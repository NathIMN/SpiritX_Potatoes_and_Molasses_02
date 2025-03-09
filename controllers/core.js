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
    if (req.session.isAdmin) {
      res.render("players", {
        user: req.session.user,
        page: "players",
        players: playerList,
        isAdmin: req.session.isAdmin,
      });
    } else {
      res.redirect(302, "player-stats");
    }
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

const playerEdit = async (req, res) => {
  if (!req.session.isAdmin) {
    req.session.msg = "idk what to put here";
    res.redirect(302, "/index");
    return;
  }
  try {
    const playerId = req.params.id;

    // Fetch player details from the database
    const player = await Player.findById(playerId);

    if (!player) {
      return res.status(404).send("Player not found");
    }

    // Render the edit page with player details
    res.render("player-edit", { player });
  } catch (error) {
    console.error("Error fetching player for edit:", error);
    res.status(500).send("Server error");
  }
};

const playerAdd = async (req, res) => {
  if (!req.session.isAdmin) {
    req.session.msg = "idk what to put here";
    res.redirect(302, "/index");
    return;
  }
  try {
    res.render("player-add");
  } catch (error) {
    console.error("Error rendering add player page:", error);
    res.status(500).send("Server error");
  }
};

const selectTeam = async (req, res) => {
  if (!req.session.isLoggedIn) {
    req.session.msg = "Please sign in first to create a team";
    res.redirect(302, "/signin");
    return;
  }

  if (req.session.isAdmin) {
    req.session.msg = "Admin accounts can't create teams";
    res.redirect(302, "/players");
    return;
  }

  try {
    // Find the current user with populated team data
    const user = await User.findById(req.session.user._id).populate({
      path: "team",
      populate: {
        path: "players",
        model: "Player",
      },
    });

    // Check if user already has a team
    if (user.team) {
      return res.render("viewTeam", {
        team: user.team,
        user: user,
        page: "viewTeam",
      });
    }

    // User doesn't have a team yet, proceed with team selection
    const batsmen = await Player.find({
      category: "Batsman",
      team: null,
    });

    const bowlers = await Player.find({
      category: "Bowler",
      team: null,
    });

    const allRounders = await Player.find({
      category: "All-Rounder",
      team: null,
    });

    res.render("selectTeam", {
      batsmen,
      bowlers,
      allRounders,
      user: user,
      page: "selectTeam",
    });
  } catch (error) {
    console.error("Error fetching players:", error);
    res.status(500).send("Error fetching players");
  }
};

const tournamentSummary = async (req, res) => {
  if (!req.session.isLoggedIn) {
    req.session.msg = "Please sign in";
    res.redirect(302, "/signin");
    return;
  }
  try {
    const players = await Player.find({});

    const overallRuns = players.reduce(
      (sum, player) => sum + (player.totalRuns || 0),
      0
    );
    const overallWickets = players.reduce(
      (sum, player) => sum + (player.wickets || 0),
      0
    );

    const highestRunScorer = players.reduce(
      (topPlayer, player) =>
        player.totalRuns > (topPlayer.totalRuns || 0) ? player : topPlayer,
      {}
    );

    const highestWicketTaker = players.reduce(
      (topPlayer, player) =>
        player.wickets > (topPlayer.wickets || 0) ? player : topPlayer,
      {}
    );

    res.render("tournamentSummary", {
      overallRuns,
      overallWickets,
      highestRunScorer: highestRunScorer.name || "N/A",
      highestWicketTaker: highestWicketTaker.name || "N/A",
    });
  } catch (error) {
    console.error("Error fetching tournament summary:", error);
    res.status(500).send("Server Error");
  }
};

const leaderboard = async (req, res) => {
  if (!req.session.isLoggedIn) {
    req.session.msg = "Please sign in";
    res.redirect(302, "/signin");
    return;
  }
  try {
    const users = await User.find({ userId: { $gt: 1000 } })
      .populate("team", "points")
      .select("username team")
      .lean();

    const leaderboard = users
      .map((user) => ({
        username: user.username,
        points: user.team ? user.team.points : 0, // Default to 0 if no team
      }))
      .sort((a, b) => b.points - a.points);

    res.render("leaderboard", { leaderboard, loggedInUser: "spiritx_2025" });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).send("Server Error");
  }
};

const chatbot = async (req, res) => {
  if (!req.session.isLoggedIn) {
    req.session.msg = "Please sign in";
    res.redirect(302, "/signin");
    return;
  }
  try {
    res.render("chatbot");
  } catch (error) {
    console.error("Error rendering chatbot:", error);
    res.status(500).send("Server error");
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
  playerEdit,
  playerAdd,
  tournamentSummary,
  leaderboard,
  chatbot,
  errorPage,
  selectTeam,
};
