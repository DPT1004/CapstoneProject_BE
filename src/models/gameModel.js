const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
    hostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
    },
    pin: {
        type: String,
    },
    isLive: {
        type: Boolean,
        default: false,
    },
    playerList: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            userName: { type: String },
            socketId: { type: String },
            photo: { type: String },
            totalScore: { type: Number, default: 0 },
            totalTimeAnswer: { type: Number, default: 0 },
            numberOfCorrect: { type: Number, default: 0 },
            numberOfInCorrect: { type: Number, default: 0 },
            currentIndexQuestion: { type: Number, default: 0 },
            playerResult: [
                {
                    question: { type: Object },
                    indexPlayerAnswer: [Number],
                    playerAnswer: { type: String, default: null },
                    arrPlayerAnswer: { type: Array, default: null },
                    score: { type: Number },
                    timeAnswer: { type: Number }
                }
            ]
        }
    ],
    playerWasKicked: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Game", gameSchema);
