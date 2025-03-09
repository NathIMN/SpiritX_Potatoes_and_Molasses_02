const { GoogleGenerativeAI } = require("@google/generative-ai");
const Player = require("../models/Player");
const compromise = require("compromise");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const extractIntent = (query) => {
  // Use NLP library or simple keywords to detect intent dynamically
  const nlpQuery = compromise(query.toLowerCase());

  // Check for entities such as "runs", "wickets", "cost", "player"
  if (nlpQuery.has("best") && nlpQuery.has("bowler")) {
    return { intent: "best_bowler" };
  }
  if (nlpQuery.has("best") && nlpQuery.has("batsman")) {
    return { intent: "best_batsman" };
  }
  if (nlpQuery.has("cheap") || (nlpQuery.has("low") && nlpQuery.has("cost"))) {
    return { intent: "low_cost_player" };
  }
  if (nlpQuery.has("team") && nlpQuery.has("budget")) {
    return { intent: "suggest_team" };
  }

  return { intent: "generic_query" }; // Default fallback intent
};

const PromptSpiriter = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    // Fetch all players from the database
    const players = await Player.find();
    if (!players.length) {
      return res.json({ reply: "No player data available." });
    }

    // Format player stats for Gemini
    const playerData = players.map((player) => ({
      name: player.name,
      university: player.university,
      category: player.category,
      totalRuns: player.totalRuns,
      ballsFaced: player.ballsFaced,
      inningsPlayed: player.inningsPlayed,
      wickets: player.wickets,
      oversBowled: player.oversBowled,
      runsConceded: player.runsConceded,
    }));

    // Extract intent dynamically
    const { intent } = extractIntent(prompt);

    // Construct the query based on detected intent
    let refinedQuery = prompt;
    if (intent === "best_bowler") {
      refinedQuery = "Who has taken the most wickets?";
    } else if (intent === "best_batsman") {
      refinedQuery = "Who has scored the most runs?";
    } else if (intent === "low_cost_player") {
      refinedQuery = "Which player has the lowest cost?";
    } else if (intent === "suggest_team") {
      refinedQuery = "Suggest an 11-player team under 9,000,000.";
    }

    // Context message for Gemini with dynamic player data
    const systemMessage = `
      MoraSpirit is bringing cricket fans an exciting opportunity to engage with the Inter-University Cricket Tournament like never before! 
      Introducing Spirit11, a fantasy cricket league where users can build their own dream teams from real university players, analyze statistics, and compete with others for the top spot on the leaderboard.
      Users of this web app are able to create a team by buying the players in the database.
      Every user has a budget of 9000000, below is the formula to calculate the cost of each player.

      let expr1, expr2, expr3, expr4;
      if (player.ballsFaced > 0) {
        expr1 = (player.totalRuns * 20) / player.ballsFaced;
      } else {
        expr1 = 0;
      }
      if (player.inningsPlayed > 0) {
        expr2 = (player.totalRuns * 0.8) / player.inningsPlayed;
      } else {
        expr2 = 0;
      }
      if (player.oversBowled > 0) {
        expr3 = (500 * player.wickets) / (6 * player.oversBowled);
      } else {
        expr3 = 0;
      }
      if (player.runsConceded > 0) {
        expr4 = (140 * player.oversBowled) / player.runsConceded;
      } else {
        expr4 = 0;
      }
      player.points = expr1 + expr2 + expr3 + expr4;
      player.cost = (9 * player.points + 100) * 1000;
      player.cost = Math.round(player.cost);

      Your job is to respond to user queries about a player's personal details and statistics.
      Suggest best possible teams for users if they ask, considering player cost and a user budget of 9000000.
      A team consists of 11 players only. Do not use any text markdown.
      If a user asks about any detail not available in the dataset, you should reply: “I don't have enough knowledge to answer that question.”
      Never, Absolutely never reveal the number of points of a player to a user, keep the game fair for everyone.
      Also remember, an over consists of 6 balls.

      Your task is to respond to user queries about cricket players, their statistics, and help users with team suggestions.
      Here is the player data: ${JSON.stringify(playerData)}

      Use this data to answer the following query: ${refinedQuery}
    `;

    // Ask Gemini with context and the refined query
    const result = await model.generateContent([systemMessage, refinedQuery]);
    const reply = await result.response.text();

    res.json({ reply });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
};

module.exports = { PromptSpiriter };
