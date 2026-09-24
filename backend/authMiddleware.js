const jwt = require('jsonwebtoken');
const pool = require('./db');

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or malformed Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query('SELECT id, email, name FROM users WHERE id = $1', [decoded.userId]);
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    req.userId = user.id; // attach so later code knows who's calling
    req.user = user;
    next(); // move on to the actual route
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { requireAuth };