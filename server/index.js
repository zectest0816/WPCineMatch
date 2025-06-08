const express = require("express");
const mongoose = require('mongoose');
const cors = require("cors");
const bcrypt = require('bcryptjs');
const UserModel = require('./models/User');
const CinematchModel = require("./models/Cinematch");
const CommentModel = require("./models/Comment");
const favouritesRouter = require("./routes/favouritesRoute");
const watchLaterRouter = require("./routes/watchLaterRoute");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection with error handling
mongoose.connect("mongodb://127.0.0.1:27017/cinematch")
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

// Login route with password hashing
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await CinematchModel.findOne({ email });
    if (!user) {
      return res.status(404).json("No record exists");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json("The password is incorrect");
    }

    res.json("Success");
  } catch (err) {
    res.status(500).json("Server error during login");
  }
});

// Register route with password hashing
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await CinematchModel.create({ name, email, password: hashedPassword });
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json("Error during registration");
  }
});

// Comments routes
app.post('/comments', async (req, res) => {
  try {
    const { movieId, user, text, rating } = req.body;
    const comment = await CommentModel.create({ movieId, user, text, rating });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: "Error saving comment" });
  }
});

app.get('/comments/:movieId', async (req, res) => {
  try {
    const comments = await CommentModel.find({ movieId: req.params.movieId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: "Error fetching comments" });
  }
});

// PATCH for editing
app.patch("/comments/:commentId", async (req, res) => {
  const { text, rating } = req.body;
  const updated = await CommentModel.findByIdAndUpdate(
    req.params.commentId,
    { text, rating },
    { new: true }
  );
  res.json(updated);
});

// DELETE for deleting
app.delete("/comments/:commentId", async (req, res) => {
  await CommentModel.findByIdAndDelete(req.params.commentId);
  res.json({ message: "Deleted" });
});

// User profile routes
app.get('/users/:userId', async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userResponse = user.toObject();
    delete userResponse.password;
    res.json(userResponse);
  } catch (err) {
    res.status(500).json({ error: "Error fetching user profile" });
  }
});

app.patch('/users/:userId', async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    const user = await UserModel.findByIdAndUpdate(
      req.params.userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userResponse = user.toObject();
    delete userResponse.password;
    res.json(userResponse);
  } catch (err) {
    res.status(500).json({ error: "Error updating user profile" });
  }
});

app.patch('/users/:userId/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await UserModel.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error changing password" });
  }
});

// Favorites routes
app.post('/users/:userId/favorites', async (req, res) => {
  try {
    const { movieId } = req.body;
    const user = await UserModel.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.favorites.includes(movieId)) {
      user.favorites.push(movieId);
      await user.save();
    }
    res.json({ message: "Movie added to favorites" });
  } catch (err) {
    res.status(500).json({ error: "Error adding movie to favorites" });
  }
});

app.delete('/users/:userId/favorites/:movieId', async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.favorites = user.favorites.filter(id => id !== req.params.movieId);
    await user.save();
    res.json({ message: "Movie removed from favorites" });
  } catch (err) {
    res.status(500).json({ error: "Error removing movie from favorites" });
  }
});

// Delete user account
app.delete('/users/:userId', async (req, res) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting user account" });
  }
});

// Mount routers
app.use("/api/favourite", favouritesRouter);
app.use("/api/watchlater", watchLaterRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
