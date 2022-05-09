const mongoose = require("mongoose")
const moment = require("moment")
const ObjectId = mongoose.Schema.Types.ObjectId

const bookModel = new mongoose.Schema({
    title: {
        type: String, required: true, unique: true, trim: true
    },
    excerpt: {
        type: String, required: true, trim: true
    },
    userId: {
        type: ObjectId, required: true, ref: 'user'
    },
    ISBN: {
        type: String, required: true, unique: true
    },
    category: {
        type: String, required: true
    },
    subcategory: {
        type: [String], required: true
    },
    reviews: {
        type: Number, default: 0, comment: String
    },
    deletedAt: {
        type: Date,
    },
    isDeleted: {
        type: Boolean, default: false
    },
    releasedAt: {
        type: Date, required: true, default: moment(new Date()).format("YYYY-MM-DD")
    }
}, { timestamps: true })

module.exports = mongoose.model('books', bookModel)