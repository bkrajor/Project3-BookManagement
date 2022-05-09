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
        if (["Mr", "Miss", "Mrs"].indexOf(title) == -1) return res.status(400).send({ status: false, message: "Please enter a valid title" })

        if (!/^[a-zA-Z\s]*$/.test(name)) return res.status(400).send({ status: false, message: "Please provide valid name" })

        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) return res.status(400).send({ status: false, message: "Email format is invalid" })
        const existingEmail = await userModel.findOne({ email: email })
        if (existingEmail) return res.status(400).send({ status: false, Message: "Email is already exists" })

        if (!/^[6-9]\d{9}$/.test(phone)) return res.status(400).send({ status: false, message: "Enter a valid mobile number." })
        const existingMobile = await userModel.findOne({ phone: phone })
        if (existingMobile) return res.status(400).send({ status: false, Message: "Mobile number is already exists" })

        if (!(password.length >= 8 && password.length <= 15)) return res.status(400).send({ status: false, message: "Password must be in 8 to 15 characters" })

        if (keyValid(address)) return res.status(400).send({ status: false, message: "Please provide address" })
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

        // ---------------finding user in DB-----------
        const user = await userModel.findOne({ email: email, password: password })
        if (!user) return res.status(400).send({ status: false, Message: "Email or password is not valid" })

        const token = jwt.sign({ userId: user._id }, "BookManagement_Group36", {expiresIn:"10 minutes"})
        res.status(200).send({ status: true, Message: "User login Successfully", Data: token })
    
    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }

}


module.exports = { createUser, userlogin }



