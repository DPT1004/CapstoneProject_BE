require("dotenv").config();
const User = require("../models/userModel")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user == null) {
    return res.status(400).send("Cannot find user");
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      const accessToken = jwt.sign({ email: req.body.email, id: user._id }, process.env.ACCESS_TOKEN_SECRET)
      const refreshToken = jwt.sign({ email: req.body.email, id: user._id }, process.env.REFRESH_TOKEN_SECRET)
      res.json({
        user: {
          id: user._id,
          email: user.email
        },
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    } else {
      res.send("Not allowed ");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const register = async (req, res) => {
  const {
    email,
    password
  } = req.body;

  const existingEmail = await User.findOne({ email: email });
  if (existingEmail) {
    return res.status(400).json({ message: "User already exists." });
  } else {
    const salt = await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash(password, salt)
    const user = new User({
      email,
      password: hashedPassword,
    });
    try {
      const newUser = await user.save();
      res.status(201).json({
        user: newUser
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};



module.exports = { register, login };
