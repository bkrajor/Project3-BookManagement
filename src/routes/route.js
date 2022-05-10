const express = require('express');
const router = express.Router();
const userController= require('../controllers/userController')
const bookController= require('../controllers/bookController')

router.post('/register', userController.createUser)

router.post('/login', userController.userlogin)

router.post('/books',bookController.createBook)

router.get('/books',bookController.getAllBooks)


module.exports = router; 