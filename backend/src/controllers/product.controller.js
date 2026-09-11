const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/db');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// GET /api/products?search=&category=&minPrice=&maxPrice=&sort=&page=&limit=
async function listProducts(req, res, next) {
  try {
    const {
      search, category, minPrice, maxPrice,
      sort = 'newest', page = 1, limit = 12,
    } = req.query;

    const conditions = ['p.is_active = TRUE'];
    const params = [];
    let idx = 1;

    if (search) {
      conditions.push(`(p.name ILIKE $${idx} OR p.description ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }
    if (category) {
      conditions.push(`c.slug = $${idx}`);
      params.push(category);
      idx++;
    }
    if (minPrice) {
      conditions.push(`p.price >= $${idx}`);
      params.push(minPrice);
      idx++;
    }
    if (maxPrice) {
      conditions.push(`p.price <= $${idx}`);
      params.push(maxPrice);
      idx++;
    }

    const sortMap = {
      newest: 'p.created_at DESC',
      price_asc: 'p.price ASC',
      price_desc: 'p.price DESC',
      rating: 'p.avg_rating DESC',
    };
    const orderBy = sortMap[sort] || sortMap.newest;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 100);
    const offset = (pageNum - 1) * limitNum;

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(
      `SELECT COUNT(*)::int AS total
       FROM products p LEFT JOIN categories c ON c.id = p.category_id
       ${whereClause}`,
      params
    );

    const dataResult = await query(
      `SELECT p.id, p.sku, p.name, p.slug, p.price, p.discount_price, p.stock_quantity,
              p.image_url, p.brand, p.avg_rating, p.review_count, c.name AS category_name, c.slug AS category_slug
       FROM products p LEFT JOIN categories c ON c.id = p.category_id
       ${whereClause}
       ORDER BY ${orderBy}
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limitNum, offset]
    );

    res.json({
      products: dataResult.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: countResult.rows[0].total,
        totalPages: Math.ceil(countResult.rows[0].total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getProductBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const productResult = await query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.slug = $1 AND p.is_active = TRUE`,
      [slug]
    );
    if (productResult.rowCount === 0) return res.status(404).json({ error: 'Product not found' });

    const product = productResult.rows[0];

    const [images, reviews] = await Promise.all([
      query('SELECT id, image_url, alt_text, display_order FROM product_images WHERE product_id = $1 ORDER BY display_order', [product.id]),
      query(
        `SELECT r.id, r.rating, r.title, r.comment, r.created_at, u.first_name, u.last_name
         FROM reviews r JOIN users u ON u.id = r.user_id
         WHERE r.product_id = $1 ORDER BY r.created_at DESC LIMIT 20`,
        [product.id]
      ),
    ]);

    res.json({ ...product, images: images.rows, reviews: reviews.rows });
  } catch (err) {
    next(err);
  }
}

// Admin: create product
async function createProduct(req, res, next) {
  try {
    const {
      sku, name, description, price, discountPrice, stockQuantity,
      categoryId, brand, imageUrl,
    } = req.body;

    if (!sku || !name || price === undefined) {
      return res.status(400).json({ error: 'sku, name and price are required' });
    }

    const id = uuidv4();
    const slug = `${slugify(name)}-${id.slice(0, 8)}`;

    const result = await query(
      `INSERT INTO products
        (id, sku, name, slug, description, price, discount_price, stock_quantity, category_id, brand, image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [id, sku, name, slug, description || null, price, discountPrice || null,
        stockQuantity || 0, categoryId || null, brand || null, imageUrl || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

// Admin: update product
async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const fields = ['name', 'description', 'price', 'discount_price', 'stock_quantity', 'category_id', 'brand', 'image_url', 'is_active'];
    const bodyKeyMap = {
      name: 'name', description: 'description', price: 'price', discount_price: 'discountPrice',
      stock_quantity: 'stockQuantity', category_id: 'categoryId', brand: 'brand',
      image_url: 'imageUrl', is_active: 'isActive',
    };

    const sets = [];
    const params = [];
    let idx = 1;
    for (const col of fields) {
      const bodyKey = bodyKeyMap[col];
      if (req.body[bodyKey] !== undefined) {
        sets.push(`${col} = $${idx}`);
        params.push(req.body[bodyKey]);
        idx++;
      }
    }
    if (sets.length === 0) return res.status(400).json({ error: 'No valid fields to update' });

    params.push(id);
    const result = await query(
      `UPDATE products SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Product not found' });

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    const result = await query('UPDATE products SET is_active = FALSE WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deactivated', id });
  } catch (err) {
    next(err);
  }
}

module.exports = { listProducts, getProductBySlug, createProduct, updateProduct, deleteProduct };
