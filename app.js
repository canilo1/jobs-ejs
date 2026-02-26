// app.js
require("dotenv").config(); // load .env variables

const express = require("express");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const bodyParser = require("body-parser");
const path = require("path");
const flash = require("connect-flash");

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// MongoDB session store
const url = process.env.MONGO_URI;
const store = new MongoDBStore({
  uri: url,
  collection: "mySessions",
});

store.on("error", function (error) {
  console.log(error);
});

// Session configuration
const sessionParms = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { secure: false, sameSite: "strict" }, // secure = false for dev
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sessionParms.cookie.secure = true; // serve secure cookies in prod
}

app.use(session(sessionParms));

// Flash messages (must come after session middleware)
app.use(flash());

// Middleware to make flash messages available to all views
app.use((req, res, next) => {
  res.locals.info = req.flash("info");
  res.locals.errors = req.flash("error");
  next();
});

// Routes

// Serve the secret word page
app.get("/secretWord", (req, res) => {
  if (!req.session.secretWord) {
    req.session.secretWord = "syzygy"; // default secret word
  }
  res.render("secretWord", { secretWord: req.session.secretWord });
});

// Update the secret word with flash messages
app.post("/secretWord", (req, res) => {
  const newWord = req.body.secretWord;
  if (newWord.toUpperCase()[0] === "P") {
    req.flash("error", "That word won't work!");
    req.flash("error", "You can't use words that start with P.");
  } else {
    req.session.secretWord = newWord;
    req.flash("info", "The secret word was changed.");
  }
  res.redirect("/secretWord");
});

// Example home route
app.get("/", (req, res) => {
  res.send("Welcome to the session + flash demo!");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});