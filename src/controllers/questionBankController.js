const QuestionBank = require("../models/questionBank")

const getQuestionsBySearch = async (req, res) => {
    const { searchQuery, arrQuestionType } = req.body

    try {
        var result = []
        if (arrQuestionType.length !== 0) {
            result = await QuestionBank.find({
                question: { $regex: searchQuery, $options: "i" },
                questionType: { $in: arrQuestionType }
            })
        } else {
            result = await QuestionBank.find({
                question: { $regex: searchQuery, $options: "i" }
            })
        }

        res.status(200).send(result)
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

const getRandomQuestionWithCondition = async (req, res) => {
    const { quantity, category, difficulty, searchQuery } = req.body

    function getRandomQuestion(arr, n) {
        var result = new Array(n),
            len = arr.length,
            taken = new Array(len);
        if (n > len) {
            return arr
        } else {
            while (n--) {
                var x = Math.floor(Math.random() * len);
                result[n] = arr[x in taken ? taken[x] : x];
                taken[x] = --len in taken ? taken[len] : len;
            }
        }
        return result
    }

    try {
        var arrQuestion = []
        if (searchQuery !== "") {
            var arrQuestion = await QuestionBank.find({
                question: { $regex: searchQuery },
                category: category,
                difficulty: difficulty
            })
        } else {
            var arrQuestion = await QuestionBank.find({
                category: category,
                difficulty: difficulty
            })
        }

        var result = getRandomQuestion(arrQuestion, quantity)

        res.json(result)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}



module.exports = { getQuestionsBySearch, getRandomQuestionWithCondition }