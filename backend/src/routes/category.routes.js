const express = require('express');
const { listCategories, createCategory } = require('../controllers/category.controller');
const { authenticate } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

const router = express.Router();

router.get('/', listCategories);
router.post('/', authenticate, adminOnly, createCategory);

module.exports = router;
