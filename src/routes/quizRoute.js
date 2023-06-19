const express = require("express");
const router = express.Router();

const {
    createQuiz,
    getQuiz,
    getAllQuiz,
    getQuizByIdCreator,
    getQuizesBySearch,
    updateQuiz,
    deleteQuiz,
} = require("../controllers/quizController")

router
    .route("/")
    .post(createQuiz)
    .get(getAllQuiz)

router.post("/search", getQuizesBySearch)

router
    .route("/:id")
    .get(getQuiz)
    .patch(updateQuiz)
    .delete(deleteQuiz)

router.get("/creator/:creatorId", getQuizByIdCreator)

module.exports = router;
