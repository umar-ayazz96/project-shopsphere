const express = require('express');
const {
  createOrder, listMyOrders, getOrderById, listAllOrders, updateOrderStatus,
} = require('../controllers/order.controller');
const { authenticate } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

const router = express.Router();

router.use(authenticate);
router.post('/', createOrder);
router.get('/mine', listMyOrders);
router.get('/admin/all', adminOnly, listAllOrders);
router.put('/:id/status', adminOnly, updateOrderStatus);
router.get('/:id', getOrderById);

module.exports = router;
