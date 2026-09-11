const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/db');

function slugify(text) {
  return text.toString().toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function listCategories(req, res, next) {
  try {
    const result = await query(
      `SELECT c.id, c.name, c.slug, c.description, c.parent_id, COUNT(p.id)::int AS product_count
       FROM categories c LEFT JOIN products p ON p.category_id = c.id AND p.is_active = TRUE
       GROUP BY c.id ORDER BY c.name`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const { name, description, parentId } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const id = uuidv4();
    const slug = slugify(name);

    const result = await query(
      `INSERT INTO categories (id, name, slug, description, parent_id)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [id, name, slug, description || null, parentId || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = { listCategories, createCategory };
