const express = require("express");
const router = express.Router();
const {
  getAllPlayers,
  createPlayer,
  getPlayer,
  updatePlayer,
  deletePlayer,
} = require("../controllers/players");

router.get("/", getAllPlayers);

router.post("/", createPlayer);

router.get("/:id", getPlayer);

router.patch("/:id", updatePlayer);

router.delete("/:id", deletePlayer);

module.exports = router;
