require("dotenv").config();
const User = require("../models/userModel")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email })
  if (user == null) {
    return res.status(400).send({ message: "Cannot find user" })
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      if (user.last_login !== null) {
        res.status(400).send({ message: "You have login in another device" });
      }
      else {
        user.last_login = Date.now()
        user.save()
        const accessToken = jwt.sign({ email: req.body.email, id: user._id }, process.env.ACCESS_TOKEN_SECRET)
        const refreshToken = jwt.sign({ email: req.body.email, id: user._id }, process.env.REFRESH_TOKEN_SECRET)
        res.json({
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            photo: user.photo,
          },
          accessToken: accessToken,
          refreshToken: refreshToken,
        })
      }
    } else {
      res.status(400).send({ message: "Password is not correct" })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const logout = async (req, res) => {
  const user = await User.findById(req.body.userId)
  if (user == null) {
    return res.status(400).send({ message: "Cannot find user" })
  }
  try {
    user.last_login = null
    user.save()
    res.json({ message: "Log out success" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const loginWithSocial = async (req, res) => {
  const {
    email,
    name,
    photo
  } = req.body;
  try {
    const user = await User.findOne({ email: req.body.email })
    if (user == null) {
      const newUser = new User({
        email: email,
        name: name,
        photo: photo,
        last_login: Date.now()
      })
      newUser.save()
      const accessToken = jwt.sign({ email: req.body.email, id: newUser._id }, process.env.ACCESS_TOKEN_SECRET)
      const refreshToken = jwt.sign({ email: req.body.email, id: newUser._id }, process.env.REFRESH_TOKEN_SECRET)
      res.json({
        user: {
          id: newUser._id,
          email: newUser.email,
          name: newUser.name,
          photo: newUser.photo,
        },
        accessToken: accessToken,
        refreshToken: refreshToken,
      })
    } else {
      user.last_login = Date.now()
      user.photo = photo
      await user.save()
      const accessToken = jwt.sign({ email: req.body.email, id: user._id }, process.env.ACCESS_TOKEN_SECRET)
      const refreshToken = jwt.sign({ email: req.body.email, id: user._id }, process.env.REFRESH_TOKEN_SECRET)
      res.json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          photo: user.photo,
        },
        accessToken: accessToken,
        refreshToken: refreshToken,
      })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}


const register = async (req, res) => {

  const {
    email,
    password,
    name
  } = req.body;

  const existingEmail = await User.findOne({ email: email });
  if (existingEmail) {
    return res.status(400).json({ message: "User already exists." });
  } else {
    const salt = await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash(password, salt)
    const user = new User({
      email: email,
      password: hashedPassword,
      name: name
    });
    try {
      const newUser = await user.save();
      res.json({
        message: "Register success"
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};



module.exports = { register, login, logout, loginWithSocial }
