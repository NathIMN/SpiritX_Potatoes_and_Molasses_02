require("dotenv").config(); //package to utilize the .env file
const mongoose = require("mongoose"); //mongoose to handle mongodb

const connectionString = process.env.MONGO_URI;

mongoose
  .connect(connectionString)
  .then(() => console.log("CONNECTED TO DB"))
  .catch((err) => console.log(err));
