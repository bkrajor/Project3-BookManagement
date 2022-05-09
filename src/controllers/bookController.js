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
        if (keyValid(excerpt)) return res.status(400).send({ status: false, message: "Please provide excerpt" })

        if (keyValid(userId)) return res.status(400).send({ status: false, message: "Please provide a valid userId" })
        const isUser = await userModel.findById({ _id: userId })
        if (!isUser) return res.status(400).send({ status: false, message: "No user found with the given id" })

        if (keyValid(ISBN)) return res.status(400).send({ status: false, message: "" })
        const isISBN = await bookModel.findOne({ ISBN: ISBN })
        if (isISBN) return res.status(400).send({ status: false, message: "ISBN is already present" })

        if (keyValid(category)) return res.status(400).send({ status: false, message: "Please provide category" })

        if (!subcategory) return res.status(400).send({ status: false, message: "Please provide subcategory" })
        // -----------------validation ends here------------------

        const newBook= await bookModel.create(data)

        res.status(201).send({status:true, message:"Book created successfully", data:newBook})

    } catch (err) {
        res.status(500).send({ status: false, Message: err.message })
    }
}

module.exports={createBook}