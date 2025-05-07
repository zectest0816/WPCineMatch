const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  movieId: {
    type: String,
    required: true,
  },
  user: {
    type: String, 
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const CommentModel = mongoose.model("comments", CommentSchema);
module.exports = CommentModel;
