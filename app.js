//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const app = express();

mongoose.connect("mongodb://localhost:27017/Users", { useNewUrlParser: true, useUnifiedTopology: true }, function (err) {
    if (!err) { }
    else console.log(err);
});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

const User = mongoose.model("user", userSchema);


app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
    res.render("home");
});

app.get("/login", function (req, res) {
    res.render("login");
});

app.get("/register", function (req, res) {
    res.render("register");
});

app.get("/secrets", function (req, res) {
    res.send("<h1>You do not have permission to access this resource.</h1>")
});

app.get("/logout", function (req, res) {
    res.redirect("/");
})

app.post("/register", function (req, res) {
    const newUser = new User({
        email: req.body.email,
        password: req.body.password
    })
    newUser.save(function (err) {
        if (err) console.log(err);
        else {
            res.render("secrets");
        }
    })
});

app.post("/login", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({email: username}, function (err, foundUser) {
        if (err) console.log(err);
        else {
            if (foundUser) {
                if(foundUser.password === password) {
                    res.render("secrets");
                }
                else res.send("<h1>Could not find that user</h1><h1>Please check your email and password</h1>");
            }
        }
    });
});


app.listen(3000, function () {
    console.log("Listening to requests on port 3000.");
})