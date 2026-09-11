const { query } = require('../config/db');

async function addReview(req, res, next) {
  try {
    const { productId, rating, title, comment } = req.body;
    if (!productId || !rating) return res.status(400).json({ error: 'productId and rating are required' });
    if (rating < 1 || rating > 5) return res.status(400).json({ error: 'rating must be between 1 and 5' });

    const result = await query(
      `INSERT INTO reviews (product_id, user_id, rating, title, comment)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (product_id, user_id) DO UPDATE SET rating = $3, title = $4, comment = $5
       RETURNING *`,
      [productId, req.user.id, rating, title || null, comment || null]
    );

    // Recompute aggregate rating for the product
    await query(
      `UPDATE products p SET
         avg_rating = sub.avg_rating,
         review_count = sub.review_count
       FROM (
         SELECT product_id, ROUND(AVG(rating)::numeric, 1) AS avg_rating, COUNT(*) AS review_count
         FROM reviews WHERE product_id = $1 GROUP BY product_id
       ) sub
       WHERE p.id = sub.product_id`,
      [productId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function listProductReviews(req, res, next) {
  try {
    const { productId } = req.params;
    const result = await query(
      `SELECT r.id, r.rating, r.title, r.comment, r.created_at, u.first_name, u.last_name
       FROM reviews r JOIN users u ON u.id = r.user_id
       WHERE r.product_id = $1 ORDER BY r.created_at DESC`,
      [productId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

module.exports = { addReview, listProductReviews };
