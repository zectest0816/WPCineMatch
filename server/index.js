const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const CinematchModel = require("./models/Cinematch");
const CommentModel = require("./models/Comment");
const favouritesRouter = require("./routes/favouritesRoute");
const watchLaterRouter = require("./routes/watchLaterRoute");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/cinematch");

// Login route
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

// Register route
app.post("/register", (req, res) => {
  CinematchModel.create(req.body)
    .then((users) => res.json(users))
    .catch((err) => res.json(err));
});

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

// Favourite and Watch Later routers
app.use("/api/favourite", favouritesRouter);
app.use("/api/watchlater", watchLaterRouter);

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

app.listen(3001, () => {
  console.log("server is running");
});
