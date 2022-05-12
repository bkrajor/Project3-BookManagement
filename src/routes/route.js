const express = require('express')
const router = express.Router()
const userController=require('../controllers/userController')
const bookController=require('../controllers/bookController')
const reviewController=require('../controllers/reviewController')
const{authenticate,authorize}=require('../middleware/auth')

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// ---------User's APIs------------
router.post('/register', userController.createUser)

router.post('/login', userController.userlogin)

// ---------Book's APIs-------------
router.post('/books', authenticate,bookController.createBook)

router.get('/books',authenticate, bookController.getBooks)

router.get('/books/:bookId',authenticate, bookController.getBookById)

router.delete('/books/:bookId', authenticate, authorize, bookController.deleteBookById)

router.put('/books/:bookId', authenticate, authorize, bookController.updateBook)

// ----------Review's APIs------------
router.post('/books/:bookId/review',authenticate,authorize, reviewController.createReview)

router.put('/books/:bookId/review/:reviewId',reviewController.updateReview)

router.delete('/books/:bookId/review/:reviewId',authenticate,authorize,reviewController.deleteReview)

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


module.exports = router