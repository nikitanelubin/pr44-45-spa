// Меню дня, список блюд, создание, редактирование, удаление и поиск
const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');
const pool = require('../db');
const { auth } = require('../middleware');

const router = express.Router();
// все маршруты этого файла только для вошедшего пользователя
router.use(auth);

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 МБ в байтах
const EXTENSIONS = { 'image/jpeg': '.jpg', 'image/png': '.png' };

// Блюдо приходит в form-data, потому что в нём есть картинка.
// multer разбирает такой запрос: поля кладёт в req.body, файл - в req.file (пока только в память)
const upload = multer();

// Файл записываем на диск, только когда все поля уже проверены. В базе храним путь к нему
const saveImage = (file) => {
  const name = `${Date.now()}${EXTENSIONS[file.mimetype]}`;
  fs.writeFileSync(path.join(__dirname, '..', 'uploads', name), file.buffer);
  return `/uploads/${name}`;
};

// Проверка полей блюда. Из form-data все значения приходят строками, поэтому числа проверяем через Number
const validateDish = ({ body, file }, isCreate) => {
  const errors = {};
  const isNumber = (value) => value !== undefined && value !== '' && !Number.isNaN(Number(value));

  if (!body.name || !body.name.trim()) errors.name = 'Введите название';
  else if (body.name.length > 100) errors.name = 'Название не длиннее 100 символов';
  if (!body.composition || !body.composition.trim()) errors.composition = 'Введите состав';
  // КБЖУ проверяются одинаково, поэтому одним циклом: [поле, как назвать в тексте ошибки]
  for (const [field, title] of [['calories', 'калории'], ['proteins', 'белки'], ['fats', 'жиры'], ['carbs', 'углеводы']]) {
    if (!isNumber(body[field]) || Number(body[field]) < 0) errors[field] = `Укажите ${title} числом`;
  }
  if (!isNumber(body.price) || Number(body.price) <= 0) errors.price = 'Укажите цену больше нуля';
  if (!isNumber(body.cook_time) || Number(body.cook_time) <= 0) errors.cook_time = 'Укажите время в минутах';
  if (!body.cook_method || !body.cook_method.trim()) errors.cook_method = 'Укажите способ приготовления';

  // при редактировании картинку можно не присылать, тогда остаётся старая
  if (!file && isCreate) errors.image = 'Загрузите изображение';
  else if (file && !EXTENSIONS[file.mimetype]) errors.image = 'Изображение должно быть в формате JPG или PNG';
  else if (file && file.size > MAX_IMAGE_SIZE) errors.image = 'Изображение не больше 5 МБ';

  return errors;
};

// ===== Меню дня: акции, рекомендации, новинки =====
// Три запроса к базе, ответ - один объект с тремя списками для трёх блоков страницы
router.get('/menu', async (req, res) => {
  const [promotions] = await pool.query('SELECT * FROM promotions');
  const [recommended] = await pool.query('SELECT * FROM dishes WHERE is_recommended = TRUE');
  const [novelties] = await pool.query('SELECT * FROM dishes WHERE is_new = TRUE');
  res.json({ promotions, recommended, novelties });
});

// ===== Поиск по названию =====
router.get('/search', async (req, res) => {
  const query = (req.query.q || '').trim();
  if (!query) return res.status(422).json({ errors: { q: 'Введите текст для поиска' } });
  // % в LIKE - любые символы до и после искомого текста
  const [rows] = await pool.query('SELECT id, name, image FROM dishes WHERE name LIKE ? ORDER BY name', [`%${query}%`]);
  res.json(rows);
});

// ===== Блюда =====
router.get('/dishes', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM dishes ORDER BY id');
  res.json(rows);
});

router.get('/dishes/:id', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM dishes WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ message: 'Блюдо не найдено' });
  res.json(rows[0]);
});

// upload.single('image') срабатывает до функции маршрута: в ней уже есть req.body и req.file
router.post('/dishes', upload.single('image'), async (req, res) => {
  const errors = validateDish(req, true);
  if (Object.keys(errors).length) return res.status(422).json({ errors });

  const b = req.body;
  const [result] = await pool.query(
    `INSERT INTO dishes (name, composition, calories, proteins, fats, carbs, price, cook_time, cook_method, image)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [b.name.trim(), b.composition.trim(), b.calories, b.proteins, b.fats, b.carbs, b.price, b.cook_time,
      b.cook_method.trim(), saveImage(req.file)]
  );
  const [rows] = await pool.query('SELECT * FROM dishes WHERE id = ?', [result.insertId]);
  res.status(201).json(rows[0]);
});

router.put('/dishes/:id', upload.single('image'), async (req, res) => {
  const [found] = await pool.query('SELECT image FROM dishes WHERE id = ?', [req.params.id]);
  if (!found.length) return res.status(404).json({ message: 'Блюдо не найдено' });

  const errors = validateDish(req, false);
  if (Object.keys(errors).length) return res.status(422).json({ errors });

  const b = req.body;
  // новую картинку не прислали - остаётся старая
  const image = req.file ? saveImage(req.file) : found[0].image;
  await pool.query(
    `UPDATE dishes SET name = ?, composition = ?, calories = ?, proteins = ?, fats = ?, carbs = ?,
     price = ?, cook_time = ?, cook_method = ?, image = ? WHERE id = ?`,
    [b.name.trim(), b.composition.trim(), b.calories, b.proteins, b.fats, b.carbs, b.price, b.cook_time,
      b.cook_method.trim(), image, req.params.id]
  );
  const [rows] = await pool.query('SELECT * FROM dishes WHERE id = ?', [req.params.id]);
  res.json(rows[0]);
});

// блюдо пропадёт и из корзин: ON DELETE CASCADE в seed.js
router.delete('/dishes/:id', async (req, res) => {
  const [result] = await pool.query('DELETE FROM dishes WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) return res.status(404).json({ message: 'Блюдо не найдено' });
  res.status(204).send();
});

module.exports = router;
