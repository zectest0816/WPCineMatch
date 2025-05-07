const express = require("express")
const mongoose = require('mongoose')
const cors = require("cors")
const CinematchModel = require('./models/Cinematch')
const UserModel = require('./models/User')

const app = express()
app.use(express.json())
app.use(cors())

mongoose.connect("mongodb://127.0.0.1:27017/cinematch");

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    CinematchModel.findOne({ email: email })
        .then(user => {
            if (user) {
                if (user.password === password) {
                    res.json("Success")
                } else {
                    res.json("The password is incorrect")
                }
            } else {
                res.json("No record existed")
            }

        })
})

app.post('/register', (req, res) => {
    CinematchModel.create(req.body)
        .then(users => res.json(users))
        .catch(err => res.json(err))
})

const CommentModel = require('./models/Comment');

app.post('/comments', async (req, res) => {
    const { movieId, user, text } = req.body;
    try {
        const comment = await CommentModel.create({ movieId, user, text });
        res.json(comment);
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

app.get('/users/:userId', async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Don't send password to client
        const userResponse = user.toObject();
        delete userResponse.password;
        
        res.json(userResponse);
    } catch (err) {
        res.status(500).json({ error: "Error fetching user profile" });
    }
});

app.patch('/users/:userId', async (req, res) => {
    try {
        // Don't allow password updates through this endpoint
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
        
        // Find user
        const user = await UserModel.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Verify current password
        if (user.password !== currentPassword) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }
        
        // Update password
        user.password = newPassword;
        await user.save();
        
        res.json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ error: "Error changing password" });
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

// Add movie to favorites
app.post('/users/:userId/favorites', async (req, res) => {
    try {
        const { movieId } = req.body;
        
        const user = await UserModel.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Add to favorites if not already there
        if (!user.favorites.includes(movieId)) {
            user.favorites.push(movieId);
            await user.save();
        }
        
        res.json({ message: "Movie added to favorites" });
    } catch (err) {
        res.status(500).json({ error: "Error adding movie to favorites" });
    }
});

// Remove movie from favorites
app.delete('/users/:userId/favorites/:movieId', async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Remove from favorites
        user.favorites = user.favorites.filter(id => id !== parseInt(req.params.movieId));
        await user.save();
        
        res.json({ message: "Movie removed from favorites" });
    } catch (err) {
        res.status(500).json({ error: "Error removing movie from favorites" });
    }
});

app.listen(3001, () => {
    console.log("server is running")
})