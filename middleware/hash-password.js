const bcrypt = require("bcrypt");

const hashPassword = async function (next) {
  if (!this.isModified("password")) {
    return next();
  } //skip hashing if password not modified

  try {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    this.password = await bcrypt.hash(this.password, salt); //hash the password with salt
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = hashPassword;
