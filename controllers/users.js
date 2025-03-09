const User = require("../models/User");
const bcrypt = require("bcrypt");

const validatePassword = function (password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{4,}$/.test(password);
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({
      users: users,
      amount: users.length,
      msg: "all users fetched successfully",
    });
  } catch (error) {
    res.status(500).json({ msg: "internal server error" });
  }
};

const currentUser = async (req, res) => {
  if (req.session.user) {
    res.status(200).json({ user: req.session.user });
  } else {
    res.status(404).json({ user: null });
  }
};

const createUser = async (req, res) => {
  try {
    const username = req.body.username;
    const pw = req.body.password;
    const userExists = await User.findOne({ username: username });
    if (userExists) {
      res.status(409).json({ msg: "username already registered" });
      return;
    }
    if (!validatePassword(pw)) {
      res.status(400).json({
        msg: "password must contain at least one lowercase letter, one uppercase letter, and one special character",
      });
      return;
    }
    const user = await User.create(req.body);
    res.status(201).json({ msg: "new user successfully registered" });
  } catch (error) {
    res.status(500).json({ msg: "internal server error" });
  }
}; //bunch of these checks are redundant with the frontend, keeping for api

const authUser = async (req, res) => {
  try {
    const username = req.body.username;
    const pw = req.body.password;
    if (!username || !pw) {
      res.status(400).json({ msg: "username and password required" });
      return;
    }
    // if (!validatePassword(pw)) {
    //   res.status(400).json({
    //     msg: "password must contain at least one lowercase letter, one uppercase letter, and one special character",
    //   });
    //   return;
    // }
    const user = await User.findOne({ username: username });
    if (!user) {
      res.status(404).json({ msg: `user not found with username: ${username}` });
      return;
    }
    const matchHash = await bcrypt.compare(pw, user.password);
    if (!matchHash) {
      res.status(401).json({ msg: `authentication failed, invalid password` });
      return;
    }
    const isAdmin = user.userId <= 1000;
    req.session.isLoggedIn = true;
    req.session.user = user;
    req.session.isAdmin = isAdmin;
    req.session.reSignUp = false;
    res.status(200).json({ user: user, isAdmin: isAdmin });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "internal server error" });
  }
}; //bunch of these checks are redundant with the frontend, keeping for api

const getUser = async (req, res) => {
  try {
    const { id: userID } = req.params;
    const user = await User.findOne({ _id: userID });
    if (!user) {
      res.status(404).json({ msg: `no user with id: ${userID}` });
      return;
    }
    res.status(200).json({ user: user });
  } catch (error) {
    res.status(500).json({ msg: "internal server error" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id: userID } = req.params;
    const user = await User.findOneAndUpdate({ _id: userID }, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      res.status(404).json({ msg: `no user with id: ${userID}` });
      return;
    }
    req.session.user = user;
    res.status(200).json({ msg: "user successfully updated" });
  } catch (error) {
    res.status(500).json({ msg: "internal server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id: userID } = req.params;
    const user = await User.findOneAndDelete({ _id: userID });
    if (!user) {
      res.status(404).json({ msg: `no user with id: ${userID}` });
      return;
    }
    res.status(200).json({ user: null, status: "success" });
  } catch (error) {
    res.status(500).json({ msg: "internal server error" });
  }
};

module.exports = {
  getAllUsers,
  currentUser,
  createUser,
  authUser,
  getUser,
  updateUser,
  deleteUser,
};
