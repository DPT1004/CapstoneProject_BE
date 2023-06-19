const mongoose = require("mongoose")
const Quiz = require("../models/quizModel")
const QuestionBank = require("../models/questionBank")
const Game = require("../models/gameModel")

const createQuiz = async (req, res) => {
  const {
    name,
    description,
    backgroundImage,
    isPublic,
    categories,
    questionList,
  } = req.body
  const quiz = new Quiz({
    name,
    backgroundImage,
    description,
    creatorId: req.user.id,
    numberOfQuestions: questionList.length,
    isPublic,
    categories,
    dateCreated: new Date().toISOString(),
    questionList,
  })

  try {
    await quiz.save()
    res.json({ message: "Create Quiz success" })

    questionList.forEach(async (ItemQuestion) => {
      var result = await QuestionBank.findOne({ question: ItemQuestion.question, answerList: { $all: ItemQuestion.answerList } })
      if (result == null) {
        const { _id, ...newQuestion } = ItemQuestion
        await QuestionBank.insertMany(newQuestion)
      }
    })

  } catch (error) {
    res.status(400).json({ message: error.message })
  }

}

const getQuiz = async (req, res) => {
  try {
    let quiz = await Quiz.findById(req.params.id)

    if (quiz == null) {
      return res.status(404).json({ message: "Quiz not found" })
    }
    res.status(200).json(quiz)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getAllQuiz = async (req, res) => {
  const { page } = req.query
  try {
    const LIMIT = 4
    const startIndex = (Number(page) - 1) * LIMIT

    const total = await Quiz.find({ isPublic: true }).countDocuments()
    const quizes = await Quiz.find({ isPublic: true })
      .sort({ _id: -1 })
      .limit(LIMIT)
      .skip(startIndex)

    res.status(200).send({
      data: quizes,
      numberOfPages: Math.ceil(total / LIMIT)
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getQuizByIdCreator = async (req, res) => {
  const { creatorId } = req.params
  const { page } = req.query
  try {
    const LIMIT = 5
    const startIndex = (Number(page) - 1) * LIMIT

    const total = await Quiz.find({ creatorId: creatorId }).countDocuments()
    const quizes = await Quiz.find({ creatorId: creatorId })
      .sort({ _id: -1 })
      .limit(LIMIT)
      .skip(startIndex)

    res.status(200).send({
      data: quizes,
      numberOfPages: Math.ceil(total / LIMIT)
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getQuizesBySearch = async (req, res) => {
  const { page } = req.query
  const { searchQuery, categories } = req.body

  try {
    const LIMIT = 4
    const startIndex = (Number(page) - 1) * LIMIT
    var result = []
    var total = 0

    if (categories.length == 0) {

      result = await Quiz.find({
        isPublic: true,
        name: { $regex: searchQuery }
      })
        .limit(LIMIT)
        .skip(startIndex)

      total = await Quiz.find({
        isPublic: true,
        name: { $regex: searchQuery }
      }).countDocuments()

    } else {

      result = await Quiz.find({
        isPublic: true,
        name: { $regex: searchQuery },
        categories: { $in: categories }
      })
        .limit(LIMIT)
        .skip(startIndex)

      total = await Quiz.find({
        isPublic: true,
        name: { $regex: searchQuery },
        categories: { $in: categories }
      }).countDocuments()
    }

    res.status(200).send({
      data: result,
      numberOfPages: Math.ceil(total / LIMIT)
    })
  } catch (error) {
    res.status(404).json({ message: error.message })
  }

}

const updateQuiz = async (req, res) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: `No quiz with id: ${id}` })
  }

  const {
    name,
    description,
    backgroundImage,
    isPublic,
    categories,
    questionList,
  } = req.body
  const quiz = new Quiz({
    _id: id,
    name,
    backgroundImage,
    description,
    creatorId: req.user.id,
    numberOfQuestions: questionList.length,
    isPublic,
    categories,
    dateCreated: new Date().toISOString(),
    questionList,
  })
  try {
    await Quiz.findByIdAndUpdate(id, quiz)
    res.json({ message: "Update quiz success" })

    questionList.forEach(async (ItemQuestion) => {
      var result = await QuestionBank.findOne({ question: ItemQuestion.question, answerList: { $all: ItemQuestion.answerList } })
      if (result == null) {
        const { _id, ...newQuestion } = ItemQuestion
        await QuestionBank.insertMany(newQuestion)
      }
    })

  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const deleteQuiz = async (req, res) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: `No quiz with id: ${id}` })
  }

  try {
    const existedGameIsStarted = await Game.findOne({ quizId: id, isLive: false })
    if (existedGameIsStarted == null) {
      await Quiz.findByIdAndRemove(id)
      res.json({ message: "Quiz deleted succesfully" })
    } else {
      res.json({ message: "Have Game using your Quiz to start Game, waiting for them fisnish then delete again" })
    }

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}



module.exports = {
  createQuiz,
  getQuiz,
  getAllQuiz,
  getQuizByIdCreator,
  getQuizesBySearch,
  updateQuiz,
  deleteQuiz,
}
