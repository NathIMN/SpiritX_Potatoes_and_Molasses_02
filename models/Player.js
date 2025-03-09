const mongoose = require("mongoose");
const sequence = require("mongoose-sequence")(mongoose);

const validCategories = ["Batsman", "Bowler", "All-Rounder"];

const PlayerSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  university: { type: String, required: true },
  category: { type: String, required: true, enum: validCategories },
  totalRuns: { type: Number, required: true },
  ballsFaced: { type: Number, required: true },
  inningsPlayed: { type: Number, required: true },
  wickets: { type: Number, required: true },
  oversBowled: { type: Number, required: true },
  runsConceded: { type: Number, required: true },
  readonly: { type: Boolean, default: true },
});

PlayerSchema.plugin(sequence, { inc_field: "playerId", start_seq: 2001 }); //auto increment

module.exports = mongoose.model("Player", PlayerSchema);
