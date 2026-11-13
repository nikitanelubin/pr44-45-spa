const pool = require('./db');

// Проверка входа. При входе пользователь получает токен (он хранится в users.token),
// сайт присылает его в каждом запросе: Authorization: Bearer {token}. Ищем, чей это токен
const auth = async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Требуется авторизация' });
  }
  const [users] = await pool.query('SELECT id, name, email FROM users WHERE token = ?', [header.slice(7)]);
  if (!users.length) {
    return res.status(401).json({ message: 'Требуется авторизация' });
  }
  // дальше в маршруте известно, чья это корзина: req.user.id
  req.user = users[0];
  next();
};

module.exports = { auth };
