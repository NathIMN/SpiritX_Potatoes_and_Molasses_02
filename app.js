require("./db/connect"); //includes dotenv
require("express-async-errors");
const express = require("express");
const session = require("express-session");
const app = express();
const users = require("./routes/users");
const players = require("./routes/players");
const teams = require("./routes/teams");
const spiriter = require("./routes/spiriter");
const core = require("./routes/core");
const notFound = require("./middleware/not-found"); //404 handler
const rateLimiter = require("express-rate-limit");

app.set("view engine", "ejs");

app.use(express.static("./public"));

app.set("trust proxy", 1);

app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
); //maximum 100 requests per 15 minutes per ip

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
  })
); //configuring sessions

//routes
app.use("/api/v1/users", users);

app.use("/api/v1/players", players);

app.use("/api/v1/teams", teams);

app.use("/api/v1/spiriter", spiriter);

app.use("/", core);

app.use(notFound);

const port = 3000;

app.listen(port, console.log(`Server is listening on port ${port}...`));