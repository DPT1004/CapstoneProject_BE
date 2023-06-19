const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    // required: true,
  },
  name: {
    type: String,
    default: ""
  },
  photo: {
    type: String,
    default: "https://cdn-icons-png.flaticon.com/512/6596/6596121.png"
  },
  last_login: {
    type: Date,
    default: null,
  }
});

module.exports = mongoose.model("User", userSchema);
