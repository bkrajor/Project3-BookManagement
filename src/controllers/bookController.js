const bookModel = require('../models/bookModel')
const userModel = require('../models/userModel')
const { default: mongoose } = require("mongoose");

const keyValid = (key) => {
    if (typeof (key) === 'undefined' || typeof (key) === 'null') return true
    if (typeof (key) === 'string' && key.trim().length === 0) return true
    return false
}

let validObjectId = (id) => {
    return mongoose.isValidObjectId(id)
}
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const createBook = async (req, res) => {
    try {
        let data = req.body
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "Please provide book details" })

        const { title, excerpt, userId, ISBN, category, subcategory, } = data

        // ---------------Validation starts from here----------------
        if (!title) return res.status(400).send({ status: false, message: "Title is required" })
        if (keyValid(title)) return res.status(400).send({ status: false, message: "Please provide a valid title" })
        const isTitle = await bookModel.findOne({ title: title, isDeleted: false })
        if (isTitle) return res.status(400).send({ status: false, message: "Title is already present" })

        if (!excerpt) return res.status(400).send({ status: false, message: "Excerpt is required" })
        if (keyValid(excerpt)) return res.status(400).send({ status: false, message: "Please provide a valid excerpt" })

        if (!userId) return res.status(400).send({ status: false, message: "UserId is required" })
        if (!validObjectId(userId)) return res.status(400).send({ status: false, message: "Invalid userId" })
        const isUser = await userModel.findById({ _id: userId })
        if (!isUser) return res.status(400).send({ status: false, message: "No user found with the given id" })

        // -------------Checking the userId with the logged in userId to AUTHORIZE the user-------------------
        if (req.userId != userId) return res.status(401).send({ status: false, message: "UserId is not matched with your UserId while creating the book" })

        // ------------Checking the uniqueness of the Unique keys------------------
        if (!ISBN) return res.status(400).send({ status: false, message: "ISBN is required" })
        if (keyValid(ISBN)) return res.status(400).send({ status: false, message: "Please provide a valid ISBN" })
        const isISBN = await bookModel.findOne({ ISBN: ISBN, isDeleted: false })
        if (isISBN) return res.status(400).send({ status: false, message: "ISBN is already present" })

        if (!category) return res.status(400).send({ status: false, message: "Category is required" })
        if (keyValid(category)) return res.status(400).send({ status: false, message: "Please provide a valid category" })

        if (!subcategory) return res.status(400).send({ status: false, message: "Subcategory is required" })
        if (keyValid(subcategory)) return res.status(400).send({ status: false, message: "Please provide a valid subcategory" })
        // -----------------Validation ends here------------------

        const newBook = await bookModel.create(data)
        res.status(201).send({ status: true, message: "Book created successfully", data: newBook })
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const getBooks = async (req, res) => {
    try {
        const data = req.query
        const filterObject = { isDeleted: false }

        if (Object.keys(data).length != 0) {

            const { userId, category, subcategory, title } = data

            // --------------Validation for query filters---------------
            if (userId)
                if (!validObjectId(userId)) {
                    filterObject.userId = userId.trim()
                }
            if (category)
                if (!keyValid(category)) {
                    filterObject.category = category.trim()
                }

            if (subcategory)
                if (!keyValid(subcategory)) {
                    const subcategoryArray = subcategory.trim().split(",").map(subcategory => subcategory.trim())
                    filterObject.subcategory = { $all: subcategoryArray }
                }
            if (title)
                if (!keyValid(title)) {
                    filterObject.title = title.trim()
                }
        }
        // ---------------Validation ends for query filters---------------

        let getBooks = await bookModel.find(filterObject)
        if (getBooks.length == 0) return res.status(400).send({ status: false, message: "No book found" })
        return res.status(200).send({ status: true, message: "Book list", data: getBooks })
    }
    catch (err) {
        res.status(500).send({ Error: err.message })
    }
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const getBookById = async function (req, res) {
    try {
        const bookId = req.params.bookId

        if (!validObjectId(bookId)) return res.status(400).send({ status: false, message: "Invalid BookId" })

        const book = await bookModel
            .find({ _id: bookId, isDeleted: false })
            .select({ title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 })

        if (book.length == 0) return res.status(400).send({ status: false, message: "Book is not found or book is deleted" })

        return res.status(200).send({ status: true, data: book })

    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })

    }
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const updateBook = async function (req, res) {
    try {
        const data = req.body
        const bookId = req.params.bookId

        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "Please provide some data to update..!!" })

        if (!validObjectId(bookId)) return res.status(400).send({ status: false, message: "Invalid BookId" })

        // ------------Checking the uniqueness of the Unique keys------------------
        const isTitle = await bookModel.findOne({ title: data.title, isDeleted: false })
        if (isTitle) return res.status(400).send({ status: false, message: "Title is aready present is the DataBase..!!" })

        const isISBN = await bookModel.findOne({ ISBN: data.ISBN, isDeleted: false })
        if (isISBN) return res.status(400).send({ status: false, message: "ISBN is already present in the DataBase..!!" })

        const updatingData = await bookModel.findByIdAndUpdate({ _id: bookId }, { ...data }, { new: true })
        res.status(200).send({ status: true, data: updatingData })
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const deleteBookById = async function (req, res) {
    try {
        let bookId = req.params.bookId
        if (!validObjectId(bookId)) return res.status(400).send({ status: false, msg: "Invalid BookId" })

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

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

module.exports = { createBook, getBooks, getBookById, deleteBookById, updateBook }