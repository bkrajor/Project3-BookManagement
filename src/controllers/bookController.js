const bookModel = require('../models/bookModel')
const userModel = require('../models/userModel')

const keyValid = (key) => {
    if (typeof (key) === 'undefined' || typeof (key) === 'null') return true
    if (typeof (key) === 'string' && key.trim().length === 0) return true
    return false
}

const createBook = async (req, res) => {
    try {
        let data = req.body
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, Message: "Please provide book details" })

        const { title, excerpt, userId, ISBN, category, subcategory, } = data

        // ---------------validation starts from here----------------
        if (keyValid(title)) return res.status(400).send({ status: false, message: "Please provide title" })
        const isTitle = await bookModel.findOne({ title: title, isDeleted: false })
        if (isTitle) return res.status(400).send({ status: false, message: "Title is already present" })

        if (keyValid(excerpt)) return res.status(400).send({ status: false, message: "Please provide excerpt" })

        if (keyValid(userId)) return res.status(400).send({ status: false, message: "Please provide a valid userId" })
        const isUser = await userModel.findById({ _id: userId })
        if (!isUser) return res.status(400).send({ status: false, message: "No user found with the given id" })

        if (keyValid(ISBN)) return res.status(400).send({ status: false, message: "Please provide ISBN" })
        const isISBN = await bookModel.findOne({ ISBN: ISBN, isDeleted: false })
        if (isISBN) return res.status(400).send({ status: false, message: "ISBN is already present" })

        if (keyValid(category)) return res.status(400).send({ status: false, message: "Please provide category" })

        if (!subcategory) return res.status(400).send({ status: false, message: "Please provide subcategory" })
        // -----------------validation ends here------------------

        const newBook = await bookModel.create(data)

        res.status(201).send({ status: true, message: "Book created successfully", data: newBook })

    } catch (err) {
        res.status(500).send({ status: false, Message: err.message })
    }
}

const getBooks = async (req, res) => {
    try {
        let data = req.query
        let userId = data.userId

        if (userId)
            if (!mongoose.isValidObjectId(data.userId)) return res.status(400).send({ status: false, message: "UserId is invalid" })

        let books = await bookModel
            .find({ $and: [data, { isDeleted: false }] })
            .select({ title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 })
            .sort({ title: 1 })

        if (!books) return res.status(400).send({ status: false, msg: 'No book found or book is deleted' })

        return res.status(200).send({ status: true, data: books })
    }
    catch (err) {
        return res.status(400).send({ status: false, msg: err.message })
    }
}

const getBookById = async function (req, res) {
    try {
        const bookId = req.params.bookId

        if (!mongoose.isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "BookId is Invalid" })

        const book = await bookModel
            .find({ _id: bookId, isDeleted: false })
            .select({ title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 })

        if (!book) return res.status(400).send({ status: false, message: "Book is not found or book is deleted" })

        return res.status(200).send({ status: true, data: book })

    }
    catch (err) {
        res.status(500).send({ status: false, Message: err.message })

    }
}

const deleteBookById = async function (req, res) {
    try {
        let bookId = req.params.bookId
        if (!mongoose.isValidObjectId(bookId)) return res.status(400).send({ status: false, msg: "Invalid BookId" })

        let bookData = await bookModel.findOne({ _id: bookId, isDeleted: false })

        if (!bookData) return res.status(404).send({ status: false, msg: "Book not found or book is already deleted" })

        bookData.isDeleted = true
        bookData.deletedAt = new Date()
        bookData.save()

        res.status(200).send({ status: true, msg: "Data deleted succesfully", data: bookData })

    } catch (err) {
        return res.status(500).send({ status: false, err: err.message })
    }
}



module.exports = { createBook, getBooks, getBookById, deleteBookById }