const mongoose = require("mongoose")

const quizSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  backgroundImage: { type: String },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  numberOfQuestions: {
    type: Number,
    default: 0,
  },
  isPublic: { type: Boolean, required: true, default: true },
  categories: [String],
  dateCreated: { type: Date, default: new Date() },
  questionList: [
    {
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
    },
  ],
})

module.exports = mongoose.model("Quiz", quizSchema)
