const reviewModel = require('../models/reviewModel')
const bookModel = require('../models/bookModel')
const mongoose = require('mongoose')

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const keyValid = (key) => {
    if (typeof (key) === 'undefined' || typeof (key) === 'null') return true
    if (typeof (key) === 'string' && key.trim().length === 0) return true
    if (typeof (key) == 'Number' && key.toString().trim().length == 0) return true
    return false
}

let isValidObjectId = (id) => {
    return mongoose.isValidObjectId(id)
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const createReview = async function (req, res) {
    try {
        let paramBookId = req.params.bookId
        let data = req.body
        let reqBookId = req.body.bookId

        // -------------Validating param bookId--------------
        if (!isValidObjectId(paramBookId)) return res.status(400).send({ status: false, message: "Invalid bookId" })
        const book = await bookModel.findOne({ _id: paramBookId, isDeleted: false })
        if (!book) return res.status(404).send({ status: false, message: "No book exists with this id or the book is deleted" })

        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, Message: "Please provide review details" })

        // ------------Validating request body bookId-----------
        if (!reqBookId) return res.status(400).send({ status: false, message: "bookId is required" })
        if (!isValidObjectId(reqBookId)) return res.status(400).send({ status: false, message: "Please provide a valid bookId" })

        // ------------Matching both bookId's-------------
        if (reqBookId != paramBookId) return res.status(400).send({ status: false, message: "Both bookId should be same" })

        const { rating, reviewedBy, review } = data

        // -----------Validating request body keys------------
        if (!rating) return res.status(400).send({ status: false, message: "rating is required" })
        if (!/^[1-5]\d{0}$/.test(rating)) return res.status(400).send({ status: false, message: "Rating should be in between 1 to 5" })

        if (reviewedBy != undefined) {
            if (keyValid(reviewedBy)) return res.status(400).send({ status: false, message: "Invalid name" })
            if (!/^[a-zA-Z ]{3,30}$/.test(reviewedBy)) return res.status(400).send({ status: false, message: "Invalid name format" })
        }
        if (review != undefined) {
            if (keyValid(review)) return res.status(400).send({ status: false, message: "Please type some review" })
        }

        const reviewData = await reviewModel.create(data)

        // ----------Increasing reviews count in bookData-------------
        const bookData = await bookModel.findOneAndUpdate({ _id: paramBookId }, { $inc: { reviews: 1 } }, { new: true }).lean()
        bookData.reviewData=reviewData

        return res.status(201).send({ status: true, message:"Review created successfully", data: bookData })

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

        // ------------Validating bookId-------------
        if (!isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "Invalid bookId" })
        const isBookPresent = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!isBookPresent) return res.status(404).send({ status: false, message: "No book present or the book is deleted " })

        // ------------Validating reviewId-------------
        if (!isValidObjectId(reviewId)) return res.status(400).send({ status: false, message: "Invalid reviewId" })
        const isReviewPresent = await reviewModel.findOne({ _id: reviewId, isDeleted: false })
        if (!isReviewPresent) return res.status(404).send({ status: false, message: "No review present or the review is deleted" })

        // ------------Matching review's bookId with bookId------------ 
        if (isReviewPresent.bookId != bookId) return res.status(400).send({ status: false, message: "Please enter correct bookId or reviewId!!" })

        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, Message: "Please provide something to update" })

        const { rating, reviewedBy, review } = data

        // ------------Validating other keys-----------
        if (!rating) return res.status(400).send({ status: false, message: "rating is required" })
        if (!/^[1-5]\d{0}$/.test(rating)) return res.status(400).send({ status: false, message: "Rating should be in between 1 to 5" })

        if (reviewedBy != undefined) {
            if (keyValid(reviewedBy)) return res.status(400).send({ status: false, message: "Invalid name" })
            if (!/^[a-zA-Z ]{3,30}$/.test(reviewedBy)) return res.status(400).send({ status: false, message: "Invalid name format" })
        }
        if (review != undefined) {
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

        // ------------Validating bookId-------------
        if (!isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "Invalid bookId" })
        const isBookPresent = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!isBookPresent) return res.status(404).send({ status: false, message: "No book present or the book is already deleted " })

        // ------------Validating reviewId-------------
        if (!isValidObjectId(reviewId)) return res.status(400).send({ status: false, message: "Invalid reviewId" })
        const isReviewPresent = await reviewModel.findOne({ _id: reviewId, isDeleted: false })
        if (!isReviewPresent) return res.status(404).send({ status: false, message: "No review present or the review is already deleted" })

        // ------------Matching review's bookId with bookId------------ 
        if (isReviewPresent.bookId != bookId) return res.status(400).send({ status: false, message: "Please enter correct bookId or reviewId!!" })

        //-------------Adding isDeleted key in reviewData-------------- 
        isReviewPresent.isDeleted = true
        isReviewPresent.save()

        await bookModel.findOneAndUpdate({ _id: bookId }, { $inc: { reviews: -1 } })

        res.status(200).send({ status: true, msg: "Review deleted successfully", data: isReviewPresent })

    }
    catch (err) {
        return res.status(500).send({ status: false, err: err.message })
    }
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

module.exports = { createReview, updateReview, deleteReview }