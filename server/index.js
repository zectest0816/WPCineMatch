const express = require("express")
const mongoose = require('mongoose')
const cors = require("cors")
const CinematchModel = require('./models/Cinematch')

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

app.listen(3001, () => {
    console.log("server is running")
})