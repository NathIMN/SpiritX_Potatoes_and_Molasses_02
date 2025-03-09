const mongoose = require("mongoose");
const fs = require("fs");
const csv = require("csv-parser");
const Player = require("./models/Player");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const filePath = "/home/nath/Downloads/sample_data.csv"; // Path to CSV
const validCategories = ["Batsman", "Bowler", "All-Rounder"];
const players = [];

// Read CSV file
fs.createReadStream(filePath)
  .pipe(csv())
  .on("data", (row) => {
    const player = {
      name: row["Name"].trim(),
      university: row["University"].trim(),
      category: row["Category"].trim(),
      totalRuns: parseInt(row["Total Runs"], 10) || 0,
      ballsFaced: parseInt(row["Balls Faced"], 10) || 0,
      inningsPlayed: parseInt(row["Innings Played"], 10) || 0,
      wickets: parseInt(row["Wickets"], 10) || 0,
      oversBowled: parseInt(row["Overs Bowled"], 10) || 0,
      runsConceded: parseInt(row["Runs Conceded"], 10) || 0,
      readonly: true,
    };

    // Validate category
    if (!validCategories.includes(player.category)) {
      console.error(`Invalid category "${player.category}" for player: ${player.name}`);
      return;
    }

    players.push(player);
  })
  .on("end", async () => {
    try {
      console.log(`Processing ${players.length} players...`);

      // Insert players one by one to maintain order
      for (const player of players) {
        await Player.create(player);
        console.log(`Inserted: ${player.name}`);
      }

      console.log(`Successfully inserted ${players.length} players in order.`);
    } catch (error) {
      console.error("Error inserting players:", error);
    } finally {
      mongoose.connection.close();
    }
  });
