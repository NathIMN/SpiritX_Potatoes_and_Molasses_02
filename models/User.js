const mongoose = require("mongoose");
const sequence = require("mongoose-sequence")(mongoose);
const hashPassword = require("../middleware/hash-password");

const validatePassword = function (password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{4,}$/.test(password);
};

const UserSchema = new mongoose.Schema({
  userId: {
    type: Number,
    unique: true,
  },
  username: {
    type: String,
    required: [true, "must provide user name"],
    trim: true,
    unique: true,
    minlength: [8, "user name must be at least 8 characters long"],
    maxlength: [128, "user name can not be more than 128 characters"],
  },
  password: {
    type: String,
    required: [true, "must provide password"],
    minlength: [4, "password must be at least 4 characters long"],
    validate: [
      validatePassword,
      "password must contain at least one lowercase letter, one uppercase letter, and one special character",
    ],
  },
}); //db schema for User collection

UserSchema.plugin(sequence, { inc_field: "userId", start_seq: 1000 }); //auto increment

UserSchema.pre("save", hashPassword);

module.exports = mongoose.model("User", UserSchema);
