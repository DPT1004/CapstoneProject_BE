const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  loginWithSocial
} = require("../controllers/userController");

router
  .route("/register")
  .post(register);

router.post("/login", login)

router.post("/loginWithSocial", loginWithSocial)

router.post("/logout", logout)

module.exports = router;
