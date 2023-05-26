const mongoose = require("mongoose")
const Category = require("../models/categoryModel")

const createCategory = async (req, res) => {
    const {
        name
    } = req.body
    const quiz = new Category({
        name
    })

    try {
        const newCategory = await quiz.save()
        res.json(newCategory)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const getAllCategory = async (req, res) => {
    try {
        const categories = await Category.find()
        res.status(200).send(categories)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

module.exports = { getAllCategory, createCategory };