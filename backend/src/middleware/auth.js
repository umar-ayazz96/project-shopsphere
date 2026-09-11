const { verifyToken } = require('../utils/jwt');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { authenticate };
