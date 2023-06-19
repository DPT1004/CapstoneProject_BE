const mongoose = require("mongoose")

const questionBankSchema = new mongoose.Schema({
    questionType: {
        type: String,
        enum: ["MultipleChoice", "CheckBox"],
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
    answerList: [
        {
            answer: { type: String },
            isCorrect: { type: Boolean },
            img: { type: String }
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
