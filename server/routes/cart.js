// Корзина и оформление заказа
const express = require('express');
const pool = require('../db');
const { auth } = require('../middleware');

const router = express.Router();
router.use(auth);

// Больше двух порций одного блюда добавить нельзя: блюдо "заканчивается"
const MAX_PORTIONS = 2;
const outOfStock = (res) => res.status(409).json({ message: 'Блюдо закончилось', code: 'out_of_stock' });

const getCart = async (userId) => {
  const [items] = await pool.query(
    `SELECT d.id, d.name, d.price, d.image, c.quantity
     FROM cart_items c
     JOIN dishes d ON d.id = c.dish_id
     WHERE c.user_id = ?
     ORDER BY d.name`,
    [userId]
  );
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { items, total };
};

router.get('/cart', async (req, res) => {
  res.json(await getCart(req.user.id));
});

router.post('/cart', async (req, res) => {
  const { dish_id } = req.body;
  const [dishes] = await pool.query('SELECT id FROM dishes WHERE id = ?', [dish_id]);
  if (!dishes.length) return res.status(404).json({ message: 'Блюдо не найдено' });

  const [existing] = await pool.query('SELECT quantity FROM cart_items WHERE user_id = ? AND dish_id = ?', [req.user.id, dish_id]);
  if (existing.length && existing[0].quantity >= MAX_PORTIONS) return outOfStock(res);

  if (existing.length) {
    await pool.query('UPDATE cart_items SET quantity = quantity + 1 WHERE user_id = ? AND dish_id = ?', [req.user.id, dish_id]);
  } else {
    await pool.query('INSERT INTO cart_items (user_id, dish_id, quantity) VALUES (?, ?, 1)', [req.user.id, dish_id]);
  }
  res.status(201).json(await getCart(req.user.id));
});

router.patch('/cart/:dishId', async (req, res) => {
  const quantity = Number(req.body.quantity);
  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(422).json({ errors: { quantity: 'Количество должно быть не меньше 1' } });
  }
  if (quantity > MAX_PORTIONS) return outOfStock(res);

  await pool.query('UPDATE cart_items SET quantity = ? WHERE user_id = ? AND dish_id = ?', [quantity, req.user.id, req.params.dishId]);
  res.json(await getCart(req.user.id));
});

router.delete('/cart/:dishId', async (req, res) => {
  await pool.query('DELETE FROM cart_items WHERE user_id = ? AND dish_id = ?', [req.user.id, req.params.dishId]);
  res.json(await getCart(req.user.id));
});

router.post('/orders', async (req, res) => {
  const { items, total } = await getCart(req.user.id);
  if (!items.length) return res.status(422).json({ message: 'Корзина пуста, заказывать нечего' });

  const [result] = await pool.query('INSERT INTO orders (user_id, total) VALUES (?, ?)', [req.user.id, total]);
  await pool.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
  res.status(201).json({ order_id: result.insertId, total });
});

module.exports = router;
