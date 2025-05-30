const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, hasRole } = require('../middleware/auth');

// Route to create a new order and payment intent (can be accessed by authenticated users or new users)
router.post('/', orderController.createOrder);

// Protected routes for authenticated users
router.get('/', verifyToken, orderController.getOrders); // Get user's order history or all orders for admin
router.get('/:id', verifyToken, orderController.getOrderDetails); // Get specific order details

// Admin-only route to manually update order status
router.put('/:id/status', verifyToken, hasRole('manager'), orderController.adminUpdateOrderStatus);

module.exports = router;
