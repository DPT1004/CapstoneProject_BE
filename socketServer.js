require("dotenv").config()
const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const { log } = require("console")
const Game = require("./src/models/gameModel")
const Quiz = require("./src/models/quizModel")
const port = 3001


//Mongodb setup
const urlConnectDB = process.env.DATABASE_URL
const mongoose = require('mongoose')
mongoose.connect(urlConnectDB, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log('Connected to database')
}).catch(err => console.log(err))


http.listen(port, function () {
    console.log(`Listening socketServer to port ${port}`);
})


io.on("connection", (socket) => {
    socket.emit("connection", socket.id)

    socket.on("disconnect", (reason) => {
        console.log("Socket " + socket.id + " was disconnected")
        console.log(reason)
    })

    socket.on("init-game", (newGame) => {
        socket.join(String(newGame.pin))
        console.log(
            "Host with id" + socket.id + " started game and joined room: " + newGame.pin
        )
    })

    socket.on("player-join", async ({ user, socketId, pin }) => {
        var game = await Game.findOne({ pin: pin, isLive: false })
        //If game don't exist
        if (game == null) {
            message = "Game not found"
            socket.emit("player-joined", "Game not found", {})
        } else {
            socket.join(pin)
            game.playerList.push({
                userId: user.userId,
                userName: user.email,
                socketId: socketId,
            })
            game.save()
            socket.emit("player-joined", "You are in", {
                ...game,
                _id: game._id
            })
            socket.to(pin).emit("newPlayer-joined", "New player join", {
                ...game,
                _id: game._id
            })
        }
    })

    socket.on("player-remove", async ({ userId, pin }) => {
        var game = await Game.findOne({ pin: pin, isLive: false })
        if (game !== null) {
            if (game.playerList.length == 1) {
                await Game.findOneAndDelete({ pin: pin, isLive: false })
            }
            else if (game.hostId == userId && game.playerList.length > 1) {
                game.playerList.splice(game.playerList.findIndex(player => player.userId == userId), 1)
                game.hostId = game.playerList[0].userId
                game.save()
                socket.leave(pin)
                socket.to(pin).emit("player-removed", `Old host was out \n ${game.playerList[0].userName} are now a New Host`, game)
            }
            else {
                game.playerList.splice(game.playerList.findIndex(player => player.userId == userId), 1)
                game.save()
                socket.to(pin).emit("player-removed", "one player out", game)
                socket.leave(pin)
            }
        }
    })

    socket.on("player-quit-when-game-isPlaying", async ({ userId, pin }) => {
        var game = await Game.findOne({ pin: pin, isLive: true })
        if (game !== null) {
            if (game.playerList.length == 1) {
                await Game.findOneAndDelete({ pin: pin, isLive: true })
            }
            else {
                game.playerList.splice(game.playerList.findIndex(player => player.userId == userId), 1)
                game.save()
                var leaderBoard = game.playerList.sort((a, b) => b.totalScore - a.totalScore)
                socket.to(pin).emit("player-quited-when-game-isPlaying", { leaderBoard })
                socket.leave(pin)
            }
        }
    })

    socket.on("host-start-game", async ({ quizId, pin }) => {
        var quiz = await Quiz.findById(quizId)
        var game = await Game.findOne({ pin: pin, isLive: false })
        if (quiz !== null && game !== null) {
            game.isLive = true
            game.save()
            socket.emit("start-game-host", quiz)
            socket.to(pin).emit("start-game", quiz)
        }
    })

    socket.on("player-send-score-and-currentIndexQuestion", async ({ userId, pin, scoreRecieve, currentIndexQuestion }) => {
        var game = await Game.findOne({ pin: pin })
        if (game !== null) {
            var player = game.playerList.find(player => player.userId == userId)
            player.totalScore += scoreRecieve
            player.currentIndexQuestion = currentIndexQuestion
            game.save()
            var leaderBoard = game.playerList.sort((a, b) => b.totalScore - a.totalScore)

            io.in(pin).emit("players-get-finalLeaderBoard", { leaderBoard })
        }
    })

})








