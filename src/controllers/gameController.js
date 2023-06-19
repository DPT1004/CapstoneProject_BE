const Game = require("../models/gameModel")
const Quiz = require("../models/quizModel")

const generatePin = async (pin) => {
    var gameExisted = await Game.findOne({ pin: pin, isLive: false })
    return gameExisted == null ? pin : generatePin(Math.floor(100000 + Math.random() * 900000))
}

const createGame = async (req, res) => {
    const { hostId, quizId, isLive, pin, playerList } = req.body
    const game = new Game({
        hostId,
        quizId,
        date: new Date().toISOString(),
        pin,
        isLive,
        playerList
    })

    try {
        const existedQuiz = await Quiz.findOne({ _id: quizId, isPublic: true })
        if (existedQuiz !== null) {
            var newPin = await generatePin(pin)
            game.pin = newPin
            await game.save()
            res.json(game)
        } else {
            res.json({ message: "This Quiz haven't been available so can't create Game with this anymore" })
        }
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const getGame = async (req, res) => {
    try {
        var game = await Game.findById(req.params.id)
        if (game == null) {
            return res.status(404).json({ message: "Game not found" })
        }
        res.json(game)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

module.exports = { createGame, getGame }
