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
            totalScore: { type: Number, default: 0 },
            currentIndexQuestion: { type: Number, default: 0 }
        },
    ],
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

module.exports = mongoose.model("Game", gameSchema);
