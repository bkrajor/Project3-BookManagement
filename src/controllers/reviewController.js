const reviewModel = require('../models/reviewModel')
const bookModel = require('../models/bookModel')
const mongoose = require('mongoose')

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

let validObjectId = (id) => {
    return mongoose.isValidObjectId(id)
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const createReview = async function (req, res) {
    try {
        let data = req.body

        const { rating } = data

        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, Message: "Please provide review details" })

        if (!bookId) return res.status(400).send({ status: false, message: "bookID is required" })
        if (!validObjectId(bookId)) return res.status(400).send({ status: false, message: "Please provide a valid userId" })

        if (!rating) return res.status(400).send({ status: false, message: "rating is required" })
        if (!/^[1-5]\d{0}$/.test(rating)) return res.status(400).send({ status: false, message: "Invalid Number" })


        const addReview = await reviewModel.create(data)

        await bookModel.findOneAndUpdate({ _id: data.bookId }, { $inc: { reviews: 1 } })

        return res.status(201).send({ status: true, data: addReview })

    } catch (err) {
        res.status(500).send({ status: false, Message: err.message })
    }
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const updateReview = async function (req, res) {
    try {
        const data = req.body

        const reviewId = req.params.reviewId

        const { rating } = data

        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, Message: "Please provide the data to update..!!" })

        if (!validObjectId(bookId)) return res.status(400).send({ status: false, Message: "Please provide the valid Id..!!" })
        if (rating)
            if (!/^[1-5]\d{0}$/.test(rating)) return res.status(400).send({ status: false, message: "Invalid Number" })


        const updatingData = await reviewModel.findByIdAndUpdate({ _id: reviewId }, { ...data }, { new: true })
        res.status(200).send({ status: true, data: updatingData })
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

module.exports={createReview,updateReview,deleteReview}