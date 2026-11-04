const pool = require('./db');

// Проверка токена из заголовка Authorization: Bearer {token}
const auth = async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Требуется авторизация' });
  }
  const [users] = await pool.query('SELECT id, name, email FROM users WHERE token = ?', [header.slice(7)]);
  if (!users.length) {
    return res.status(401).json({ message: 'Требуется авторизация' });
  }
  req.user = users[0];
  next();
};

module.exports = { auth };
