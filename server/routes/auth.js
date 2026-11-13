// Регистрация, вход и выход
const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { auth } = require('../middleware');

const router = express.Router();

// Ошибки собираем в объект { поле: текст }: сайт выводит каждую под своим полем и подсвечивает его красным
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const errors = {};

  if (!name || !name.trim()) errors.name = 'Введите имя';
  if (!email) errors.email = 'Введите email';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Некорректный email';
  else {
    const [found] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (found.length) errors.email = 'Этот email уже зарегистрирован';
  }
  if (!password) errors.password = 'Введите пароль';
  else if (password.length < 6) errors.password = 'Пароль должен быть не короче 6 символов';

  if (Object.keys(errors).length) return res.status(422).json({ errors });

  // в базе храним не пароль, а его хеш
  const hash = await bcrypt.hash(password, 10);
  await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name.trim(), email, hash]);
  res.status(201).json({ message: 'Регистрация прошла успешно' });
});

// Вход: проверяем пароль и выдаём новый случайный токен, сайт сохранит его и будет отправлять с запросами
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const errors = {};
  if (!email) errors.email = 'Введите email';
  if (!password) errors.password = 'Введите пароль';
  if (Object.keys(errors).length) return res.status(422).json({ errors });

  const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  const isCorrect = users.length && (await bcrypt.compare(password, users[0].password));
  if (!isCorrect) return res.status(401).json({ message: 'Неверный email или пароль' });

  const token = crypto.randomBytes(32).toString('hex');
  await pool.query('UPDATE users SET token = ? WHERE id = ?', [token, users[0].id]);
  res.json({ token, user: { id: users[0].id, name: users[0].name } });
});

// Выход: стираем токен, после этого запросы с ним получат 401
router.post('/logout', auth, async (req, res) => {
  await pool.query('UPDATE users SET token = NULL WHERE id = ?', [req.user.id]);
  res.json({ message: 'Вы вышли из аккаунта' });
});

module.exports = router;
