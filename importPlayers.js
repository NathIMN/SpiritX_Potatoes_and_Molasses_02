const mongoose = require("mongoose");
const fs = require("fs");
const csv = require("csv-parser");
const Player = require("./models/Player");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;

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

    if (!validCategories.includes(player.category)) {
      console.error(`Invalid category "${player.category}" for player: ${player.name}`);
      return;
    }

    players.push(player);
  })
  .on("end", async () => {
    console.log(`Processing ${players.length} players...`);

    for (let i = 0; i < players.length; i++) {
      try {
        await Player.create(players[i]);
        console.log(`Inserted: ${players[i].name}`);
      } catch (error) {
        console.error(`Error inserting ${players[i].name}:`, error.message);
      }

      // Prevent hitting MongoDB rate limits (200ms delay)
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    console.log(`Finished inserting ${players.length} players.`);
    mongoose.connection.close();
  });
