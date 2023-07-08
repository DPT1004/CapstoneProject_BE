const mongoose = require("mongoose")

const questionBankSchema = new mongoose.Schema({
    questionType: {
        type: String,
        enum: ["MultipleChoice", "CheckBox", "Fill-In-The-Blank", "DragAndSort"],
        required: true,
    },
    question: {
        type: String,
        required: true,
    },
    time: {
        type: Number,
    },
    backgroundImage: { type: String },
    video: { type: String },
    youtube: { type: String },
    startTime: {
        type: Number,
        default: 0
    },
    endTime: {
        type: Number,
        default: 0
    },
    answerList: [
        {
            answer: { type: String },
            isCorrect: { type: Boolean },
            img: { type: String },
            order: { type: Number, default: -1 }
        },
    ],
    difficulty: {
        type: String,
        enum: ["easy", "normal", "hard"],
        default: "easy"
    },
    category: {
        type: String,
    }
})

module.exports = mongoose.model("QuestionBank", questionBankSchema)
