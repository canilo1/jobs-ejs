require('dotenv').config();
const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");

const passportInit = require("./passport/passportInit");

const app = express(); // ✅ MUST COME FIRST

// ---------- view engine ----------
app.set("view engine", "ejs");

// ---------- body parser ----------
app.use(express.urlencoded({ extended: true }));

// ---------- sessions ----------
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
  })
);

// ---------- flash ----------
app.use(flash());

// ---------- passport ----------
passportInit();
app.use(passport.initialize());
app.use(passport.session());

// ---------- locals middleware ----------
app.use(require("./middleware/storeLocals"));

// ---------- routes ----------
app.get("/", (req, res) => {
  res.render("index");
});

app.use("/sessions", require("./routes/sessionRoutes"));

const auth = require("./middleware/auth");
const secretWordRouter = require("./routes/secretWord");

app.use("/secretWord", auth, secretWordRouter);

// ---------- database + start ----------
const start = async () => {
  try {
    await require("./db/connect")(process.env.MONGO_URI);

    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  } catch (err) {
    console.log(err);
  }
};

start();