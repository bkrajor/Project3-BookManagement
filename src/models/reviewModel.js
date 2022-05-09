const mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId

const reviewModel = new mongoose.Schema({
    bookId: {
        type: ObjectId, required: true, ref: 'book'
    },
    reviewedBy: {
        type: String, required: true, default: 'Guest', value: 'reviewer name'
    },
    reviewedAt: {
        type: Date, required: true, default: moment(new Date()).format("YYYY-MM-DD")
    },
    rating: {
        type: Number, minlength: 1, maxlength: 5, required: true
    },
    review: {
        type: String
    },
    isDeleted: {
        type: Boolean, default: false
    }
}, { timestamps: true })

module.exports = mongoose.model('review', reviewModel)