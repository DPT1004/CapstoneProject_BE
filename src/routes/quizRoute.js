const express = require("express");
const router = express.Router();

const {
    createQuiz,
    getQuiz,
    getAllQuiz,
    getQuizByIdCreator,
    updateQuiz,
    deleteQuiz,
    addQuestion,
    updateQuestion,
    deleteQuestion
} = require("../controllers/quizController")

router
    .route("/")
    .post(createQuiz)
    .get(getAllQuiz)

router
    .route("/:id")
    .get(getQuiz)
    .patch(updateQuiz)
    .delete(deleteQuiz)

router.get("/creator/:creatorId", getQuizByIdCreator)

router
    .route('/questions/:quizId')
    .post(addQuestion)

router
    .route('/questions/:quizId/:questionId')
    .patch(updateQuestion)
    .delete(deleteQuestion)

module.exports = router;
