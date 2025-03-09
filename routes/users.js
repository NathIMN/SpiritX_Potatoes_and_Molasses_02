const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  currentUser,
  createUser,
  authUser,
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/users");

router.get("/", getAllUsers);

router.get("/current", currentUser);

router.post("/", createUser);

router.post("/auth", authUser);

router.get("/:id", getUser);

router.patch("/:id", updateUser);

router.delete("/:id", deleteUser);

module.exports = router;
