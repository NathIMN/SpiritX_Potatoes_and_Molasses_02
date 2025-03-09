const mongoose = require("mongoose");
const sequence = require("mongoose-sequence")(mongoose);

const TeamSchema = new mongoose.Schema({
  teamId: { type: Number, unique: true },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  players: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
  ],
  points: {
    type: Number,
    default: 0,
  },
});

// Ensure only 11 players can be added
TeamSchema.pre("save", function (next) {
  if (this.players.length > 11) {
    return next(new Error("A team can only have 11 players."));
  }
  next();
});

TeamSchema.plugin(sequence, { inc_field: "teamId", start_seq: 3001 }); //auto increment

module.exports = mongoose.model("Team", TeamSchema);
