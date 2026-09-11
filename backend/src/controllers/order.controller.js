const { v4: uuidv4 } = require('uuid');
const { getClient, query } = require('../config/db');

function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `SS-${ts}-${rand}`;
}

// POST /api/orders  -- checkout: turns the user's cart into an order
async function createOrder(req, res, next) {
  const client = await getClient();
  try {
    const { shippingAddressId, paymentMethod = 'card' } = req.body;
    if (!shippingAddressId) return res.status(400).json({ error: 'shippingAddressId is required' });

    await client.query('BEGIN');

    const cartResult = await client.query(
      `SELECT ci.id AS cart_item_id, ci.quantity, p.id AS product_id, p.name, p.price, p.discount_price, p.stock_quantity
       FROM cart_items ci JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = $1 FOR UPDATE`,
      [req.user.id]
    );

    if (cartResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cart is empty' });
    }

    for (const item of cartResult.rows) {
      if (item.stock_quantity < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Insufficient stock for ${item.name}` });
      }
    }

    const subtotal = cartResult.rows.reduce((sum, item) => {
      const unitPrice = item.discount_price ?? item.price;
      return sum + Number(unitPrice) * item.quantity;
    }, 0);
    const shippingFee = subtotal > 100 ? 0 : 9.99;
    const taxAmount = Number((subtotal * 0.08).toFixed(2));
    const totalAmount = Number((subtotal + shippingFee + taxAmount).toFixed(2));

    const orderId = uuidv4();
    const orderNumber = generateOrderNumber();

    await client.query(
      `INSERT INTO orders
        (id, order_number, user_id, status, subtotal, shipping_fee, tax_amount, total_amount, shipping_address_id, payment_method, payment_status)
       VALUES ($1,$2,$3,'paid',$4,$5,$6,$7,$8,$9,'paid')`,
      [orderId, orderNumber, req.user.id, subtotal.toFixed(2), shippingFee, taxAmount, totalAmount, shippingAddressId, paymentMethod]
    );

    for (const item of cartResult.rows) {
      const unitPrice = item.discount_price ?? item.price;
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [orderId, item.product_id, item.name, unitPrice, item.quantity, (unitPrice * item.quantity).toFixed(2)]
      );
      await client.query(
        'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    await client.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);

    await client.query('COMMIT');

    res.status(201).json({
      id: orderId,
      orderNumber,
      status: 'paid',
      subtotal,
      shippingFee,
      taxAmount,
      totalAmount,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

async function listMyOrders(req, res, next) {
  try {
    const result = await query(
      `SELECT id, order_number, status, total_amount, payment_status, created_at
       FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;
    const orderResult = await query(
      `SELECT * FROM orders WHERE id = $1 AND (user_id = $2 OR $3 = 'admin')`,
      [id, req.user.id, req.user.role]
    );
    if (orderResult.rowCount === 0) return res.status(404).json({ error: 'Order not found' });

    const itemsResult = await query('SELECT * FROM order_items WHERE order_id = $1', [id]);
    res.json({ ...orderResult.rows[0], items: itemsResult.rows });
  } catch (err) {
    next(err);
  }
}

// Admin: list every order, with optional status filter
async function listAllOrders(req, res, next) {
  try {
    const { status } = req.query;
    const params = [];
    let where = '';
    if (status) {
      params.push(status);
      where = 'WHERE o.status = $1';
    }
    const result = await query(
      `SELECT o.id, o.order_number, o.status, o.total_amount, o.payment_status, o.created_at,
              u.email, u.first_name, u.last_name
       FROM orders o JOIN users u ON u.id = o.user_id
       ${where}
       ORDER BY o.created_at DESC LIMIT 200`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

// Admin: update order status
async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const valid = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status value' });

    const result = await query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Order not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = { createOrder, listMyOrders, getOrderById, listAllOrders, updateOrderStatus };
