const express = require("express")
const router = express.Router()

const {
    createGame,
    getGame,
} = require("../controllers/gameController")

router
    .route("/")
    .post(createGame)

router
    .route("/:id")
    .get(getGame)

module.exports = router