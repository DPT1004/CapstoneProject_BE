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
        enum: ["MultiChoice", "CheckBox"],
        required: true,
      },
      question: {
        type: String,
        required: true,
      },
      time: {
        type: Number,
        min: 5,
        max: 90,
      },
      backgroundImage: { type: String },
      answerList: [
        {
          answer: { type: String },
          isCorrect: { type: Boolean },
          img: { type: String }
        },
      ],
    },
  ],
})

module.exports = mongoose.model("Quiz", quizSchema)
