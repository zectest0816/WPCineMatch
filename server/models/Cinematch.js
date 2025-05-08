const mongoose = require('mongoose');

const CinematchSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});

// Check if the model already exists to prevent OverwriteModelError
const CinematchModel = mongoose.models.users || mongoose.model('users', CinematchSchema);

module.exports = CinematchModel;