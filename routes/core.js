const express = require("express");
const router = express.Router();

const {
  index,
  signUp,
  signIn,
  signOut,
  players,
  playerStats,
  playerEdit,
  playerAdd,
  selectTeam,
  tournamentSummary,
  leaderboard,
  chatbot,
  errorPage,
} = require("../controllers/core");

router.get("/index", index);

router.get("/signup", signUp);

router.get("/signin", signIn);

router.get("/signout", signOut);

router.get("/players", players);

router.get("/player-stats", playerStats);

router.get("/player-edit/:id", playerEdit);

router.get("/player-add", playerAdd);

router.get("/select-team", selectTeam);

router.get("/tournament-summary", tournamentSummary);

router.get("/leaderboard", leaderboard);

router.get("/chatbot", chatbot);

router.get("/error-page", errorPage);

module.exports = router;
