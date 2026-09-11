const express = require('express');
const { addReview, listProductReviews } = require('../controllers/review.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/product/:productId', listProductReviews);
router.post('/', authenticate, addReview);

module.exports = router;
