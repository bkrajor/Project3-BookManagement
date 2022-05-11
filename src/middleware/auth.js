let jwt = require("jsonwebtoken")
const bookModel = require("../models/bookModel")

let authenticate = async function (req, res, next) {
    try {
        const token = req.headers["x-api-key"]
        if (!token) return res.status(403).send({ status: false, msg: "Authentication failed" })
        
        let decodedToken=jwt.verify(token, "BookManagement_Group36")
        
        if (!decodedToken) return res.status(400).send({ status: false, msg: "Token is invalid" });

        req.userId = decodedToken.userId
        next()
    }
    catch (err) {
        return res.status(500).send({ status: false, err: err.message })
    }
}

let authorize = async function (req, res, next) {
    try {
        const bookId = req.params.bookId
        const book = await bookModel.findOne({ _id: bookId, isDeleted: false })

        if (!book) return res.status(404).send({ status: false, msg: "No book exits with this Id or the book is deleted" })

        if (req.userId != book.userId) return res.status(403).send({ status: false, msg: "You are not Authorized" })

        next()
    }
    catch (err) {
        return res.status(500).send({ status: false, err: err.message })
    }
}


module.exports = { authenticate, authorize }