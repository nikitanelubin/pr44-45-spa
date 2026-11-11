require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const dishRoutes = require('./routes/dishes');
const cartRoutes = require('./routes/cart');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
