require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const dishRoutes = require('./routes/dishes');
const cartRoutes = require('./routes/cart');

const app = express();
const PORT = process.env.PORT || 3004;

// сайт на Vue работает на другом порту (5174), без CORS браузер не дал бы ему обращаться к API
app.use(cors());
app.use(express.json());
// картинки блюд отдаются как обычные файлы: путь /uploads/borsch.jpg из базы сразу открывается
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// все адреса API начинаются с /api; маршруты разложены по файлам: вход, блюда, корзина
app.use('/api', authRoutes);
app.use('/api', dishRoutes);
app.use('/api', cartRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Маршрут не найден' });
});

// Сюда попадают необработанные ошибки из маршрутов
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Ошибка сервера' });
});

app.listen(PORT, () => {
  console.log(`API запущен на http://localhost:${PORT}`);
});
