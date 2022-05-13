const reviewModel = require('../models/reviewModel')
const bookModel = require('../models/bookModel')
const mongoose = require('mongoose')

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const keyValid = (key) => {
    if (typeof (key) === 'undefined' || typeof (key) === 'null') return true
    if (typeof (key) === 'string' && key.trim().length === 0) return true
    return false
}

let validObjectId = (id) => {
    return mongoose.isValidObjectId(id)
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const createReview = async function (req, res) {
    try {
        let data = req.body
        let reqBookId = req.body.bookId
        let paramBookId = req.params.bookId

        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, Message: "Please provide review details" })

        if (!validObjectId(paramBookId)) return res.status(400).send({ status: false, message: "Invalid bookId" })

        if (!reqBookId) return res.status(400).send({ status: false, message: "bookId is required" })
        if (!validObjectId(reqBookId)) return res.status(400).send({ status: false, message: "Please provide a valid bookId" })

        if (reqBookId != paramBookId) return res.status(400).send({ status: false, message: "Both bookId should be same" })

        const book = await bookModel.findOne({ _id: reqBookId, isDeleted: false })
        if (!book) return res.status(404).send({ status: false, message: "No book exists with this id or the book is deleted" })

        const { rating, reviewedBy, review } = data

        if (!rating) return res.status(400).send({ status: false, message: "rating is required" })
        if (!/^[1-5]\d{0}$/.test(rating)) return res.status(400).send({ status: false, message: "Rating should be in between 1 to 5" })

        if (reviewedBy) {
            if (keyValid(reviewedBy)) return res.status(400).send({ status: false, message: "Invalid name" })
            if (!/^[a-zA-Z ]{3,30}$/.test(reviewedBy)) return res.status(400).send({ status: false, message: "Invalid name format" })
        }
        if (review) {
            if (keyValid(review)) return res.status(400).send({ status: false, message: "Please type some review" })
        }


        const addReview = await reviewModel.create(data)

        await bookModel.findOneAndUpdate({ _id: reqBookId }, { $inc: { reviews: 1 } })

        return res.status(201).send({ status: true, data: addReview })

    } catch (err) {
        res.status(500).send({ status: false, Message: err.message })
    }
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const updateReview = async function (req, res) {
    try {
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId
        let data = req.body

        if (!validObjectId(bookId)) return res.status(400).send({ status: false, message: "Invalid bookId" })
        const isBookPresent = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!isBookPresent) return res.status(400).send({ status: false, message: "No book present or the book is deleted " })

        if (!validObjectId(reviewId)) return res.status(400).send({ status: false, message: "Invalid reviewId" })
        const isReviewPresent = await reviewModel.findOne({ _id: reviewId, isDeleted: false })
        if (!isReviewPresent) return res.status(400).send({ status: false, message: "No review present or the review is deleted" })

        if (isReviewPresent.bookId != bookId) return res.status(400).send({ status: false, message: "BookId in review is not matched with given book" })

        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, Message: "Please provide something to update" })

        const { rating, reviewedBy, review } = data

        if (!rating) return res.status(400).send({ status: false, message: "rating is required" })
        if (!/^[1-5]\d{0}$/.test(rating)) return res.status(400).send({ status: false, message: "Rating should be in between 1 to 5" })

        if (reviewedBy) {
            if (keyValid(reviewedBy)) return res.status(400).send({ status: false, message: "Invalid name" })
            if (!/^[a-zA-Z ]{3,30}$/.test(reviewedBy)) return res.status(400).send({ status: false, message: "Invalid name format" })
        }
        if (review) {
            console.log(review)
            if (keyValid(review)) return res.status(400).send({ status: false, message: "Please type some review" })
        }

        const updateReview = await reviewModel.findByIdAndUpdate({ _id: reviewId }, { ...data }, { new: true })
        res.status(200).send({ status: true, data: updateReview })
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const deleteReview = async function (req, res) {

    try {
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId

        if (!validObjectId(bookId)) return res.status(400).send({ status: false, msg: "Invalid BookId" })
        if (!validObjectId(reviewId)) return res.status(400).send({ status: false, msg: "Invalid reviewId" })

        let bookData = await reviewModel.findOne({ _id: reviewId, isDeleted: false })

        if (!bookData) return res.status(404).send({ status: false, msg: "Book not found or book is already deleted" })


        bookData.isDeleted = true
        bookData.deletedAt = new Date()
        bookData.save()

        if (bookData) {
            let reviewCount = await bookModel.findOneAndUpdate({ _id: bookId }, { $inc: { reviews: -1 } })
        }

        res.status(200).send({ status: true, msg: "Data deleted succesfully", data: bookData })

    } catch (err) {
        return res.status(500).send({ status: false, err: err.message })
    }
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

module.exports = { createReview, updateReview, deleteReview }