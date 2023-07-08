require("dotenv").config()
const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
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
        try {
            socket.join(String(newGame.pin))
            console.log(
                "Host with id" + socket.id + " started game and joined room: " + newGame.pin
            )
        } catch (error) {
            console.log("init-game error", error)
        }
    })

    socket.on("player-join", async ({ user, socketId, pin }) => {
        try {
            var game = await Game.findOne({ pin: pin, isLive: false })
            //If game don't exist
            if (game == null) {
                message = "Game not found"
                socket.emit("player-joined", message, {})
            }
            else if (game.playerWasKicked.includes(user.userId)) {
                message = "You have been kicked out of this room so you can't join again"
                socket.emit("player-joined", message, {})
            }
            else {
                socket.join(pin)
                game.playerList.push({
                    userId: user.userId,
                    userName: user.name,
                    socketId: socketId,
                    photo: user.photo
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
        } catch (error) {
            console.log("player-join error", error)
        }
    })

    socket.on("player-remove", async ({ userId, pin }) => {
        try {
            var game = await Game.findOne({ pin: pin, isLive: false })
            if (game !== null) {
                if (game.playerList.length == 0 && userId == game.hostId) {
                    socket.leave(pin)
                    await Game.findOneAndDelete({ pin: pin, isLive: false })
                }
                else
                    if (game.hostId == userId && game.playerList.length >= 1) {
                        game.hostId = game.playerList[0].userId
                        var nameNewHost = game.playerList[0].userName
                        game.playerList.splice(0, 1)
                        game.save()
                        socket.to(pin).emit("player-removed", `Old host was out \n ${nameNewHost} are now a New Host`, game)
                        socket.leave(pin)
                    }
                    else {
                        game.playerList.splice(game.playerList.findIndex(player => player.userId == userId), 1)
                        game.save()
                        socket.to(pin).emit("player-removed", "", game)
                        socket.leave(pin)
                    }
            }
        } catch (error) {
            console.log("player-remove error", error)
        }
    })

    socket.on("player-quit-when-game-isPlaying", async ({ userId, pin }) => {
        try {
            var game = await Game.findOne({ pin: pin, isLive: true })
            if (game !== null) {
                game.playerList.splice(game.playerList.findIndex(player => player.userId == userId), 1)
                game.save()
                var leaderBoard = game.playerList.sort((a, b) => b.totalScore - a.totalScore)
                socket.to(pin).emit("player-quited-when-game-isPlaying", { leaderBoard })
                socket.leave(pin)
            }
        } catch (error) {
            console.log("player-quit-when-game-isPlaying error", error)
        }
    })

    socket.on("host-kick-player", async ({ userId, pin, socketId }) => {
        try {
            var game = await Game.findOne({ pin: pin, isLive: false })
            if (game !== null) {
                var clients = await io.in(pin).fetchSockets()
                var userIdWasKicked = userId
                const playerSocketWasBeenKicked = clients.find(sket => sket.id.toString() == socketId);
                game.playerList.splice(game.playerList.findIndex(player => player.userId == userId), 1)
                game.playerWasKicked.push(userId)
                game.save()

                io.in(pin).emit("host-kicked-player", game, userIdWasKicked)
                playerSocketWasBeenKicked.leave(pin)
            }
        } catch (error) {
            console.log("host-kick-player", error)
        }
    })


    //typeActiveShuffle = 1 is active for eachplayer have the different shuffle, = 2 is active for allplayer the same shuffle
    socket.on("host-start-game", async ({ quizId, pin, isActiveTimeCounter, isActiveShuffleQuestion, typeActiveShuffle, isHostJoinGame, hostInfo }) => {
        try {
            var quiz = await Quiz.findById(quizId)
            var game = await Game.findOne({ pin: pin, isLive: false })
            if (quiz !== null && game !== null) {
                game.isLive = true
                if (isHostJoinGame) {
                    game.playerList.push(hostInfo)
                }
                game.save()

                var quizApplySetting = JSON.parse(JSON.stringify(quiz._doc))
                if (isActiveShuffleQuestion && typeActiveShuffle == 2) {
                    quizApplySetting.questionList.sort(() => Math.random() - 0.5)
                    quizApplySetting.questionList.forEach(question => question.answerList.sort(() => Math.random() - 0.5))
                }

                io.in(pin).emit("start-game", quizApplySetting, isActiveTimeCounter, isActiveShuffleQuestion, typeActiveShuffle)
            }
        } catch (error) {
            console.log("host-start-game error", error)
        }
    })

    socket.on("player-quit-room-when-game-finish", async ({ pin }) => {
        socket.leave(pin)
    })

    socket.on("player-send-score-and-currentIndexQuestion", async ({ userId, pin, scoreRecieve, currentIndexQuestion, playerResult }) => {
        try {
            var game = await Game.findOne({ pin: pin })
            if (game !== null) {

                var player = game.playerList.find(player => player.userId == userId)
                player.totalScore += scoreRecieve
                player.totalTimeAnswer += playerResult.timeAnswer
                if (scoreRecieve > 0) {
                    player.numberOfCorrect += 1
                } else {
                    player.numberOfInCorrect += 1
                }
                player.currentIndexQuestion = currentIndexQuestion
                player.playerResult.push(playerResult)
                game.save()
                var leaderBoard = game.playerList.sort((a, b) => b.totalScore - a.totalScore)

                io.in(pin).emit("players-get-finalLeaderBoard", { leaderBoard })
            }
        } catch (error) {
            console.log("player-send-score-and-currentIndexQuestion error", error)
        }
    })

})








