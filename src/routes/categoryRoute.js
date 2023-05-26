const express = require("express");
const router = express.Router();

const {
    getAllCategory,
    createCategory
} = require("../controllers/categoryController");


router.get("/", getAllCategory)
router.post("/create", createCategory)

module.exports = router;
