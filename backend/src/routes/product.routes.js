const express = require('express');
const {
  listProducts, getProductBySlug, createProduct, updateProduct, deleteProduct,
} = require('../controllers/product.controller');
const { authenticate } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

const router = express.Router();

router.get('/', listProducts);
router.get('/:slug', getProductBySlug);
router.post('/', authenticate, adminOnly, createProduct);
router.put('/:id', authenticate, adminOnly, updateProduct);
router.delete('/:id', authenticate, adminOnly, deleteProduct);

module.exports = router;
