const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const bookController = require('../controllers/bookController')
const { authenticate, authorize } = require('../middleware/auth')

router.post('/register', userController.createUser)

router.post('/login', userController.userlogin)

router.post('/books', authenticate, bookController.createBook)

router.get('/books',authenticate, bookController.getBooks)

router.get('/books/:bookId',authenticate, bookController.getBookById)

router.delete('/books/:bookId', authenticate, authorize, bookController.deleteBookById)

router.put('/books/:bookId', authenticate, authorize, bookController.updateBook)


module.exports = router; 