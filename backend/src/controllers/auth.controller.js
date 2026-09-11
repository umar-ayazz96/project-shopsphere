const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/db');
const { signToken } = require('../utils/jwt');

const SALT_ROUNDS = 10;

async function register(req, res, next) {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'email, password, firstName and lastName are required' });
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const id = uuidv4();

    const result = await query(
      `INSERT INTO users (id, email, password_hash, first_name, last_name, phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, role, created_at`,
      [id, email.toLowerCase(), passwordHash, firstName, lastName, phone || null]
    );

    const user = result.rows[0];
    const token = signToken({ id: user.id, email: user.email, role: user.role });

    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const result = await query(
      'SELECT id, email, password_hash, first_name, last_name, role, is_active FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is disabled' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    delete user.password_hash;

    res.json({ user, token });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const result = await query(
      'SELECT id, email, first_name, last_name, phone, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me };
