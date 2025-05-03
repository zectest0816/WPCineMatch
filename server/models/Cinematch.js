const mongoose = require('mongoose')

const CinematchSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String

})

const CinematchModel = mongoose.model("users", CinematchSchema)
module.exports = CinematchModel