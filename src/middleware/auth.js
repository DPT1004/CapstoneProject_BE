require("dotenv").config()
const tokenConfig = require("../common/tokenConfig")
const jwt = require("jsonwebtoken")

const verifyToken = async function (req, res, next) {
    try {
        let token = req.header("Authorization")
        if (!token) {
            return res.status(403).send({
                message: "No token provided!",
            });
        }
        token = token.split(" ")[1];
        const decoded = jwt.verify(token, tokenConfig.ACCESS_TOKEN_SECRET);
        req.user = decoded;

        next();
    } catch (err) {
        return res.status(401).json({
            message: "Unauthorized access!",
        });
    }
}


module.exports = { verifyToken }
