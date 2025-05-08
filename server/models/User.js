const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    // Keep existing fields from CinematchSchema
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    
    // Additional profile fields
    phoneNumber: {
        type: String,
        default: ''
    },
    profilePicture: {
        type: String,
        default: ''
    },
    plan: {
        type: String,
        enum: ['Basic', 'Standard', 'Premium'],
        default: 'Standard'
    },
    
    // Movie interactions
    favorites: {
        type: [Number], // Store TMDB movie IDs
        default: []
    },
    watchlist: {
        type: [Number], // Store TMDB movie IDs
        default: []
    },
    watchHistory: {
        type: [Number], // Store TMDB movie IDs
        default: []
    },
    
    // User preferences
    preferredGenres: {
        type: [Number], // Store genre IDs
        default: []
    },
    
    // Account status
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
})

// You can add methods to the schema if needed
UserSchema.methods.isFavorite = function(movieId) {
    return this.favorites.includes(Number(movieId));
};

UserSchema.methods.isInWatchlist = function(movieId) {
    return this.watchlist.includes(Number(movieId));
};

// Keep the same collection name "users" to maintain compatibility
const UserModel = mongoose.model("users", UserSchema)
module.exports = UserModel