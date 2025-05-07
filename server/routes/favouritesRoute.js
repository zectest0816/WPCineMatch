const express = require("express");
const Favourite = require("../models/Favourite");
const router = express.Router();

// Add movie to favourites
// routes/favourite.js
router.post("/add", async (req, res) => {
  const { userId, movieId, title, poster_path } = req.body; // Include all fields

  try {
    const existing = await Favourite.findOne({ userId, movieId });
    if (existing) {
      return res.status(200).json({ message: "Already in favorites" });
    }

    // Create and save the new favorite
    const newFavourite = new Favourite({
      userId,
      movieId,
      title,
      poster_path
    });

    await newFavourite.save();
    res.status(201).json(newFavourite); // Return 201 for successful creation
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Get all favourites for a user
router.get("/list/:userId", async (req, res) => {
  try {
    const favourites = await Favourite.find({ userId: req.params.userId });
    res.status(200).json(favourites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:movieId", async (req, res) => {
  console.log(req.query);  

  const { userId } = req.query;  
  const movieId = parseInt(req.params.movieId, 10);  

  if (!userId || isNaN(movieId)) {
    return res.status(400).json({ message: "Missing or invalid userId or movieId" });
  }

  try {
    const deletedFavourite = await Favourite.findOneAndDelete({ userId, movieId });

    if (!deletedFavourite) {
      return res.status(404).json({ message: "Favourite not found" });
    }

    res.status(200).json({ message: "Favourite removed successfully" });
  } catch (error) {
    console.error("Error deleting favourite:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;