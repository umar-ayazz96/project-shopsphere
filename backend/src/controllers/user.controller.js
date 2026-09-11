const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/db');

async function updateProfile(req, res, next) {
  try {
    const { firstName, lastName, phone } = req.body;
    const result = await query(
      `UPDATE users SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name), phone = COALESCE($3, phone)
       WHERE id = $4 RETURNING id, email, first_name, last_name, phone, role`,
      [firstName, lastName, phone, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function listAddresses(req, res, next) {
  try {
    const result = await query('SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function addAddress(req, res, next) {
  try {
    const { label, line1, line2, city, state, postalCode, country, isDefault } = req.body;
    if (!line1 || !city || !postalCode || !country) {
      return res.status(400).json({ error: 'line1, city, postalCode and country are required' });
    }

    const id = uuidv4();
    if (isDefault) {
      await query('UPDATE addresses SET is_default = FALSE WHERE user_id = $1', [req.user.id]);
    }

    const result = await query(
      `INSERT INTO addresses (id, user_id, label, line1, line2, city, state, postal_code, country, is_default)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [id, req.user.id, label || 'home', line1, line2 || null, city, state || null, postalCode, country, !!isDefault]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

// Admin: list customers
async function listUsers(req, res, next) {
  try {
    const result = await query(
      `SELECT id, email, first_name, last_name, role, is_active, created_at FROM users ORDER BY created_at DESC LIMIT 200`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

module.exports = { updateProfile, listAddresses, addAddress, listUsers };
