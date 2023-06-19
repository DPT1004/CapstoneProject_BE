const express = require("express");
const router = express.Router();

const {
    getQuestionsBySearch,
    getRandomQuestionWithCondition
} = require("../controllers/questionBankController");


router.route("/getRandomQuestion").
    post(getRandomQuestionWithCondition)

router.post("/search", getQuestionsBySearch)

module.exports = router;
