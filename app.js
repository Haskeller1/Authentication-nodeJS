//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema();

userSchema.plugin(passportLocalMongoose, {
    usernameField: 'email'
});

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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
    if (req.isAuthenticated()) res.render("secrets")
    else res.redirect("/login");
});

app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/")
});

app.post("/register", function (req, res) {
    User.register({ email: req.body.email }, req.body.password, function (err) {
        if (err) {
            console.log(err);
            return (res.redirect("/register"));
        }
        else {
            passport.authenticate("local")(req, res, function () {
                return (res.redirect("/secrets"));
            });
        }
    });
});

app.post("/login", function (req, res) {
    const user = new User({
        email: req.body.email,
        password: req.body.password
    })
    req.login(user, function (err) {
        if (err) console.log(err);
        else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");
            });
        };
    });
});

const {
    PORT = 3000
} = process.env

app.listen(PORT, function () {
    console.log(`Listening to requests on port ${PORT}`);
})

