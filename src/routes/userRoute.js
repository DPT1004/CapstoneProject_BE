const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout
} = require("../controllers/userController");

router
  .route("/register")
  .post(register);

router.post("/login", login)

router.post("/logout", logout)

module.exports = router;
