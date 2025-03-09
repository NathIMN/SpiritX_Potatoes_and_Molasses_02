const express = require("express");
const { PromptSpiriter } = require("../controllers/spiriter");

const router = express.Router();

router.post("/chat", PromptSpiriter);

module.exports = router;