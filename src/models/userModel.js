const mongoose = require("mongoose")

const userModel = new mongoose.Schema({
    title: { 
        type: String, required: true, enum: ['Mr', 'Mrs', 'Miss'] ,trim:true
    },
    name: { 
        type: String, required: true , trim:true
    },
    phone: { 
        type: Number, required: true, unique: true 
    },
    email: { 
        type: String, required: true, unique: true 
    },
    password: {
        type: String, required: true, minlength: 8, maxlength: 15
    },
    address: {
        street: String, city: String, pincode: String
    },

}, { timestamps: true })

module.exports=mongoose.model('user',userModel)