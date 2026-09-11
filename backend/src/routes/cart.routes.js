const express = require('express');
const { getCart, addToCart, updateCartItem, removeCartItem } = require('../controllers/cart.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.get('/', getCart);
router.post('/', addToCart);
router.put('/:id', updateCartItem);
router.delete('/:id', removeCartItem);

module.exports = router;
