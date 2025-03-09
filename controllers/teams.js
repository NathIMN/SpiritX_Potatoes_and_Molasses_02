const Team = require("../models/Team");
const Player = require("../models/Player");
const User = require("../models/User");

const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find({});
    res.status(200).json({
      teams: teams,
      amount: teams.length,
      msg: "all teams fetched successfully",
    });
  } catch (error) {
    res.status(500).json({ msg: "internal server error" });
  }
};

// const createTeam = async (req, res) => {
//   try {
//     const team = await Team.create(req.body);
//     res.status(201).json({ msg: "new team successfully registered" });
//   } catch (error) {
//     res.status(500).json({ msg: "internal server error" });
//   }
// };

// const createTeam = async (req, res) => {
//   try {
//     // Get the current user from the session
//     const userId = req.session.user._id;
    
//     // Get player IDs from the request
//     const { playerIds } = req.body;
    
//     if (!playerIds || !Array.isArray(playerIds) || playerIds.length !== 11) {
//       return res.status(400).json({ 
//         success: false, 
//         msg: "You must provide exactly 11 players" 
//       });
//     }
    
//     // Find the user to check budget and existing team
//     const user = await User.findById(userId);
    
//     if (!user) {
//       return res.status(404).json({ 
//         success: false, 
//         msg: "User not found" 
//       });
//     }
    
//     // Check if user already has a team
//     if (user.team) {
//       return res.status(400).json({ 
//         success: false, 
//         msg: "You already have a team. Delete it first to create a new one." 
//       });
//     }
    
//     // Fetch all players to calculate total cost
//     const players = await Player.find({ _id: { $in: playerIds } });
    
//     if (players.length !== 11) {
//       return res.status(400).json({ 
//         success: false, 
//         msg: "One or more selected players not found" 
//       });
//     }
    
//     // Check if any players are already in a team
//     const assignedPlayers = players.filter(player => player.team !== null);
//     if (assignedPlayers.length > 0) {
//       return res.status(400).json({
//         success: false,
//         msg: `The following players are already in a team: ${assignedPlayers.map(p => p.name).join(', ')}`
//       });
//     }
    
//     // Calculate total cost
//     let totalCost = 0;
//     players.forEach(player => {
//       // Calculate player points (same formula as in frontend)
//       let expr1 = 0, expr2 = 0, expr3 = 0, expr4 = 0;
      
//       if (player.ballsFaced > 0) {
//         expr1 = (player.totalRuns * 20) / player.ballsFaced;
//       }
      
//       if (player.inningsPlayed > 0) {
//         expr2 = (player.totalRuns * 0.8) / player.inningsPlayed;
//       }
      
//       if (player.oversBowled > 0) {
//         expr3 = (500 * player.wickets) / (6 * player.oversBowled);
//       }
      
//       if (player.runsConceded > 0) {
//         expr4 = (140 * player.oversBowled) / player.runsConceded;
//       }
      
//       const points = expr1 + expr2 + expr3 + expr4;
//       const cost = Math.round((9 * points + 100) * 1000);
      
//       totalCost += cost;
//     });
    
//     // Check if user has enough budget
//     if (user.budget < totalCost) {
//       return res.status(400).json({ 
//         success: false, 
//         msg: `Insufficient budget. Required: Rs. ${totalCost}, Available: Rs. ${user.budget}` 
//       });
//     }
    
//     // Create the team
//     const team = await Team.create({
//       owner: userId,
//       players: playerIds
//     });
    
//     // Update user - set team and deduct budget
//     user.team = team._id;
//     user.budget -= totalCost;
//     await user.save();
    
//     // Update all players with the team reference
//     await Player.updateMany(
//       { _id: { $in: playerIds } },
//       { $set: { team: team._id } }
//     );
    
//     res.status(201).json({ 
//       success: true, 
//       msg: "Team created successfully", 
//       teamId: team.teamId
//     });
    
//   } catch (error) {
//     console.error("Error creating team:", error);
//     res.status(500).json({ 
//       success: false, 
//       msg: "Internal server error: " + error.message 
//     });
//   }
// };

const createTeam = async (req, res) => {
  try {
    const userId = req.session.user._id;
    
    const { playerIds } = req.body;
    
    if (!playerIds || !Array.isArray(playerIds) || playerIds.length !== 11) {
      return res.status(400).json({ 
        success: false, 
        msg: "You must provide exactly 11 players" 
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        msg: "User not found" 
      });
    }
    
    if (user.team) {
      return res.status(400).json({ 
        success: false, 
        msg: "You already have a team. Delete it first to create a new one." 
      });
    }
    
    const players = await Player.find({ _id: { $in: playerIds } });
    
    if (players.length !== 11) {
      return res.status(400).json({ 
        success: false, 
        msg: "One or more selected players not found" 
      });
    }
    
    const assignedPlayers = players.filter(player => player.team !== null);
    if (assignedPlayers.length > 0) {
      return res.status(400).json({
        success: false,
        msg: `The following players are already in a team: ${assignedPlayers.map(p => p.name).join(', ')}`
      });
    }
    
    let totalCost = 0;
    let totalPoints = 0;
    
    players.forEach(player => {
      let expr1 = 0, expr2 = 0, expr3 = 0, expr4 = 0;
      
      if (player.ballsFaced > 0) {
        expr1 = (player.totalRuns * 20) / player.ballsFaced;
      }
      
      if (player.inningsPlayed > 0) {
        expr2 = (player.totalRuns * 0.8) / player.inningsPlayed;
      }
      
      if (player.oversBowled > 0) {
        expr3 = (500 * player.wickets) / (6 * player.oversBowled);
      }
      
      if (player.runsConceded > 0) {
        expr4 = (140 * player.oversBowled) / player.runsConceded;
      }
      
      const points = expr1 + expr2 + expr3 + expr4;
      const cost = Math.round((9 * points + 100) * 1000);
      
      totalCost += cost;
      totalPoints += points;
    });
    
    if (user.budget < totalCost) {
      return res.status(400).json({ 
        success: false, 
        msg: `Insufficient budget. Required: Rs. ${totalCost}, Available: Rs. ${user.budget}` 
      });
    }
    
    const team = await Team.create({
      owner: userId,
      players: playerIds,
      points: totalPoints
    });
    
    user.team = team._id;
    user.budget -= totalCost;
    await user.save();
    
    await Player.updateMany(
      { _id: { $in: playerIds } },
      { $set: { team: team._id } }
    );
    
    res.status(201).json({ 
      success: true, 
      msg: "Team created successfully", 
      teamId: team.teamId,
      teamPoints: totalPoints
    });
    
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ 
      success: false, 
      msg: "Internal server error: " + error.message 
    });
  }
};

const getTeam = async (req, res) => {
  try {
    const { id: teamID } = req.params;
    const team = await Team.findOne({ _id: teamID });
    if (!team) {
      res.status(404).json({ msg: `no team with id: ${teamID}` });
      return;
    }
    res.status(200).json({ team: team });
  } catch (error) {
    res.status(500).json({ msg: "internal server error" });
  }
};

const updateTeam = async (req, res) => {
  try {
    const { id: teamID } = req.params;

    const existingTeam = await Team.findOne({ _id: teamID });

    if (!existingTeam) {
      return res.status(404).json({ msg: `no team with id: ${teamID}` });
    }

    const team = await Team.findOneAndUpdate({ _id: teamID }, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ msg: "team successfully updated" });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ msg: "internal server error" });
  }
};

// const deleteTeam = async (req, res) => {
//   try {
//     const { id: teamID } = req.params;

//     const existingTeam = await Team.findOne({ _id: teamID });

//     if (!existingTeam) {
//       return res.status(404).json({ msg: `no team with id: ${teamID}` });
//     }

//     const team = await Team.findOneAndDelete({ _id: teamID });

//     res.status(200).json({ team: null, status: "success" });
//   } catch (error) {
//     console.error("Delete error:", error);
//     res.status(500).json({ msg: "internal server error" });
//   }
// };

const deleteTeam = async (req, res) => {
  try {
    const userId = req.session.user._id;
    
    // Find the user
    const user = await User.findById(userId).populate('team');
    
    if (!user || !user.team) {
      return res.status(404).json({
        success: false,
        msg: "No team found"
      });
    }
    
    const teamId = user.team._id;
    
    // Release all players from this team
    await Player.updateMany(
      { team: teamId },
      { $set: { team: null } }
    );
    
    // Delete the team
    await Team.findByIdAndDelete(teamId);
    
    user.team = null;
    user.budget = 9000000; // Reset to default budget
    await user.save();
    
    res.status(200).json({
      success: true,
      msg: "Team deleted successfully"
    });
    
  } catch (error) {
    console.error("Error deleting team:", error);
    res.status(500).json({
      success: false,
      msg: "Internal server error: " + error.message
    });
  }
};

module.exports = {
  getAllTeams,
  createTeam,
  getTeam,
  updateTeam,
  deleteTeam,
};
