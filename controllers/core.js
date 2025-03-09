const User = require("../models/User");
const Player = require("../models/Player");

const index = (req, res) => {
  const msg = req.session.msg || null;
  req.session.msg = null;
  if (!req.session.isLoggedIn) {
    req.session.msg = "Please sign in first to view index";
    res.redirect(302, "/signin");
    return;
  }
  res.render("index", {
    user: req.session.user,
    page: "home",
    msg: msg,
  });
};

const signUp = async (req, res) => {
  if (req.session.isLoggedIn) {
    req.session.msg = "Please sign out first to sign up again";
    res.redirect(302, "/index");
    return;
  }
  res.render("signup", {
    user: req.session.user,
    page: "signup",
  });
};

const signIn = (req, res) => {
  if (req.session.isLoggedIn) {
    req.session.msg = "Please sign out first to sign in again";
    res.redirect(302, "/index");
    return;
  }
  res.render("signin", { user: req.session.user, page: "signin" });
};

const signOut = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ msg: "failed to sign out" });
      console.log(err);
    } else {
      res.redirect(302, "/signin");
    }
  });
};

const players = async (req, res) => {
  if (!req.session.isLoggedIn) {
    req.session.msg = "Please sign in first to view players";
    res.redirect(302, "/signin");
    return;
  }
  try {
    const playerList = await Player.find({}, "name university").sort({
      playerId: 1,
    }); // Fetch players sorted by playerId
    res.render("players", {
      user: req.session.user,
      page: "players",
      players: playerList,
      isAdmin: req.session.isAdmin,
    });
  } catch (error) {
    console.error("Error fetching players:", error);
    res.status(500).send("Internal Server Error");
  }
};

const playerStats = async (req, res) => {
  if (!req.session.isLoggedIn) {
    req.session.msg = "Please sign in first to view player-stats";
    res.redirect(302, "/signin");
    return;
  }
  try {
    const players = await Player.find({}).sort({ name: 1 }); // Sort by name alphabetically
    res.render("playerStats", {
      user: req.session.user,
      page: "playerStats",
      players: players,
      isAdmin: req.session.isAdmin,
    });
  } catch (error) {
    console.error("Error fetching players:", error);
    res.status(500).render("error", { message: "Failed to fetch player data" });
  }
};

const errorPage = (req, res) => {
  res.render("error-page", { user: req.session.user, page: "error" });
};

module.exports = {
  index,
  signUp,
  signIn,
  signOut,
  players,
  playerStats,
  errorPage,
};
