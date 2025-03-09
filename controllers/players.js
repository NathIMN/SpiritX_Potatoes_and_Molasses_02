const Player = require("../models/Player");

const getAllPlayers = async (req, res) => {
  try {
    const players = await Player.find({});
    res.status(200).json({
      players: players,
      amount: players.length,
      msg: "all players fetched successfully",
    });
  } catch (error) {
    res.status(500).json({ msg: "internal server error" });
  }
};

const createPlayer = async (req, res) => {
  try {
    const player = await Player.create(req.body);
    res.status(201).json({ msg: "new player successfully registered" });
  } catch (error) {
    res.status(500).json({ msg: "internal server error" });
  }
};

const getPlayer = async (req, res) => {
  try {
    const { id: playerID } = req.params;
    const player = await Player.findOne({ _id: playerID });
    if (!player) {
      res.status(404).json({ msg: `no player with id: ${playerID}` });
      return;
    }
    res.status(200).json({ player: player });
  } catch (error) {
    res.status(500).json({ msg: "internal server error" });
  }
};

const updatePlayer = async (req, res) => {
  try {
    const { id: playerID } = req.params;
    
    const existingPlayer = await Player.findOne({ _id: playerID });
    
    if (!existingPlayer) {
      return res.status(404).json({ msg: `no player with id: ${playerID}` });
    }
    
    // if (existingPlayer.readonly === true) {
    //   return res.status(403).json({ 
    //     msg: "Cannot update this player. Player record is read-only." 
    //   });
    // }
    
    const player = await Player.findOneAndUpdate(
      { _id: playerID }, 
      req.body, 
      {
        new: true,
        runValidators: true,
      }
    );
    
    res.status(200).json({ msg: "player successfully updated" });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ msg: "internal server error" });
  }
};

const deletePlayer = async (req, res) => {
  try {
    const { id: playerID } = req.params;
    
    const existingPlayer = await Player.findOne({ _id: playerID });
    
    if (!existingPlayer) {
      return res.status(404).json({ msg: `no player with id: ${playerID}` });
    }
    
    // if (existingPlayer.readonly === true) {
    //   return res.status(403).json({ 
    //     msg: "Cannot delete this player. Player record is read-only." 
    //   });
    // }
    
    const player = await Player.findOneAndDelete({ _id: playerID });
    
    res.status(200).json({ player: null, status: "success" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ msg: "internal server error" });
  }
};

module.exports = {
  getAllPlayers,
  createPlayer,
  getPlayer,
  updatePlayer,
  deletePlayer,
};
