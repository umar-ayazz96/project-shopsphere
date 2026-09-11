const { query } = require('../config/db');

async function getCart(req, res, next) {
  try {
    const result = await query(
      `SELECT ci.id, ci.quantity, p.id AS product_id, p.name, p.slug, p.price, p.discount_price,
              p.image_url, p.stock_quantity
       FROM cart_items ci JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = $1 ORDER BY ci.created_at DESC`,
      [req.user.id]
    );

    const items = result.rows;
    const subtotal = items.reduce((sum, item) => {
      const unitPrice = item.discount_price ?? item.price;
      return sum + Number(unitPrice) * item.quantity;
    }, 0);

    res.json({ items, subtotal: Number(subtotal.toFixed(2)) });
  } catch (err) {
    next(err);
  }
}

async function addToCart(req, res, next) {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId is required' });

    const productCheck = await query('SELECT id, stock_quantity FROM products WHERE id = $1 AND is_active = TRUE', [productId]);
    if (productCheck.rowCount === 0) return res.status(404).json({ error: 'Product not found' });
    if (productCheck.rows[0].stock_quantity < quantity) {
      return res.status(400).json({ error: 'Not enough stock available' });
    }

    const result = await query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
       RETURNING *`,
      [req.user.id, productId, quantity]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function updateCartItem(req, res, next) {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    if (!quantity || quantity < 1) return res.status(400).json({ error: 'quantity must be at least 1' });

    const result = await query(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [quantity, id, req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Cart item not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function removeCartItem(req, res, next) {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING id', [id, req.user.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Cart item not found' });
    res.json({ message: 'Removed from cart', id });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCart, addToCart, updateCartItem, removeCartItem };
