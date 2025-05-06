const express = require("express")
const mongoose = require('mongoose')
const cors = require("cors")
const CinematchModel = require('./models/Cinematch')
const favouritesRouter = require('./routes/favouritesRoute');
const watchLaterRouter = require('./routes/watchLaterRoute');

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
                    res.status(200).json({ status: "Success" });
                } else {
                    res.status(401).json({ error: "Invalid password" });
                }
            } else {
                res.status(404).json({ error: "User not found" });
            }
        })
        .catch(err => res.status(500).json({ error: err.message }));
});

app.post('/register', (req, res) => {
    CinematchModel.create(req.body)
        .then(users => res.json(users))
        .catch(err => res.json(err))
})

//error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something broke!" });
  });


app.use('/api/favourite', favouritesRouter); 

app.use('/api/watchlater', watchLaterRouter); 

app.listen(3001, () => {
    console.log("server is running")
})