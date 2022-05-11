const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')

const keyValid = (key) => {
    if (typeof (key) === 'undefined' || typeof (key) === 'null') return true
    if (typeof (key) === 'string' && key.trim().length === 0) return true
    return false
}

const createUser = async (req, res) => {
    try {
        const data = req.body
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "Please provide user details" })

        const { title, name, phone, email, password, address } = data

        // ---------------validation starts from here----------------
        if (!title) return res.status(400).send({ status: false, message: "Title is required" })
        if (["Mr", "Miss", "Mrs"].indexOf(title) == -1) return res.status(400).send({ status: false, message: "Invalid title" })

        if (!name) return res.status(400).send({ status: false, message: "Name is required" })
        if (keyValid(name)) return res.status(400).send({ status: false, message: "Invalid name" })
        if (!/^[a-zA-Z ]{3,30}$/.test(name)) return res.status(400).send({ status: false, message: "Invalid name format" })

        if (!phone) return res.status(400).send({ status: false, message: "Phone number is required" })
        if (!/^[6-9]\d{9}$/.test(phone)) return res.status(400).send({ status: false, message: "Invalid Number" })
        const existingMobile = await userModel.findOne({ phone: phone })
        if (existingMobile) return res.status(400).send({ status: false, Message: "Mobile number is already exists" })

        if (!email) return res.status(400).send({ status: false, message: "Email is required" })
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) return res.status(400).send({ status: false, message: "Invalid email" })
        const existingEmail = await userModel.findOne({ email: email })
        if (existingEmail) return res.status(400).send({ status: false, Message: "Email is already exists" })

        if (!password) return res.status(400).send({ status: false, message: "Password is required" })
        if (!(password.length >= 8 && password.length <= 15)) return res.status(400).send({ status: false, message: "Password must be in 8 to 15 characters" })

        
        // if (typeof address !== "object") return res.status(400).send({ status: false, message: "Invalid address" })
        // if (keyValid(address.street)) return res.status(400).send({ status: false, message: "Invalid street" })
        // if (keyValid(address.city)) return res.status(400).send({ status: false, message: "Invalid city" })
        // if (!/^[a-zA-Z ]{3,30}$/.test(address.city)) return res.status(400).send({ status: false, message: "Invalid city name" })
        // if (!/^[1-9]\d{5}$/.test(address.pincode)) return res.status(400).send({ status: false, message: "Invalid pincode" })

        // -----------------validation ends here------------------

        const newUser = await userModel.create(data)

        res.status(201).send({ status: true, Message: "User created successfully", Data: newUser })

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

const userlogin = async (req, res) => {
    try {
        const { email, password } = req.body
        if (Object.keys(req.body).length == 0) return res.status(400).send({ status: false, message: "Please provide user details" })

        if (!email) return res.status(400).send({ status: false, message: "Email is required" })
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) return res.status(400).send({ status: false, message: "Invalid email" })

        if (!password) return res.status(400).send({ status: false, message: "Password is required" })
        if (!(password.length >= 8 && password.length <= 15)) return res.status(400).send({ status: false, message: "Password must be in 8 to 15 characters" })

        // ---------------finding user in DB-----------
        const user = await userModel.findOne({ email: email, password: password })
        if (!user) return res.status(400).send({ status: false, Message: "Email or password is not valid" })

        const token = jwt.sign({ userId: user._id }, "BookManagement_Group36", { expiresIn: "60 minutes" })
        res.status(200).send({ status: true, Message: "User login Successfully", token: token })

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}


module.exports = { createUser, userlogin }



