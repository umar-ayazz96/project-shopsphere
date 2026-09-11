const express = require('express');
const { updateProfile, listAddresses, addAddress, listUsers } = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

const router = express.Router();

router.use(authenticate);
router.put('/profile', updateProfile);
router.get('/addresses', listAddresses);
router.post('/addresses', addAddress);
router.get('/admin/all', adminOnly, listUsers);

module.exports = router;
