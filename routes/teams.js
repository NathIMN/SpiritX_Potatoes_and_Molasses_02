const express = require("express");
const router = express.Router();
const {
  getAllTeams,
  createTeam,
  getTeam,
  updateTeam,
  deleteTeam,
} = require("../controllers/teams");

router.get("/", getAllTeams);

router.post("/", createTeam);

router.get("/:id", getTeam);

router.patch("/:id", updateTeam);

router.delete("/:id", deleteTeam);

module.exports = router;
