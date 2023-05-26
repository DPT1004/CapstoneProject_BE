require("dotenv").config()
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose");

const app = express();
const {
    verifyToken
} = require("./src/middleware/auth")
const userRouter = require("./src/routes/userRoute")
const quizRouter = require("./src/routes/quizRoute")
const categoryRouter = require("./src/routes/categoryRoute")
const gameRouter = require("./src/routes/gameRoute")

mongoose.connect(process.env.DATABASE_URL)

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to database"));

app.use(express.json());
app.use(cors())


app.use("/api/user", userRouter)
app.use("/api/game", gameRouter)
app.use("/api/category", categoryRouter)

app.use(verifyToken);
app.use("/api/quiz", quizRouter);

app.listen(process.env.PORT, () =>
    console.log(`Server started on port ${process.env.PORT}`)
);