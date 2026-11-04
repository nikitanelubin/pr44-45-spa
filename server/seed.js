// Создание базы данных и начальное наполнение: node seed.js
require('dotenv').config();
const mysql = require('mysql2/promise');

const schema = `
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  token VARCHAR(64) NULL
);

CREATE TABLE dishes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  composition TEXT NOT NULL,
  calories INT NOT NULL,
  proteins DECIMAL(5, 1) NOT NULL,
  fats DECIMAL(5, 1) NOT NULL,
  carbs DECIMAL(5, 1) NOT NULL,
  price DECIMAL(8, 2) NOT NULL,
  cook_time INT NOT NULL,
  cook_method VARCHAR(100) NOT NULL,
  image VARCHAR(255) NOT NULL,
  is_new BOOLEAN NOT NULL DEFAULT FALSE,
  is_recommended BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE promotions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  text VARCHAR(255) NOT NULL
);

CREATE TABLE cart_items (
  user_id INT NOT NULL,
  dish_id INT NOT NULL,
  quantity INT NOT NULL,
  PRIMARY KEY (user_id, dish_id),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (dish_id) REFERENCES dishes (id) ON DELETE CASCADE
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
`;

const dishes = [
  ['Бородинский хлеб', 'Ржаная мука, солод, кориандр, мёд, закваска', 208, 6.8, 1.3, 40.7, 95, 180, 'Выпечка на закваске', '/uploads/borodinsky.jpg', false, true],
  ['Круассан с маслом', 'Мука, сливочное масло, молоко, дрожжи, сахар', 406, 8.2, 21, 45.8, 120, 60, 'Выпечка из слоёного теста', '/uploads/croissant.jpg', true, true],
  ['Домашний борщ', 'Говядина, свёкла, капуста, картофель, морковь, лук, сметана', 62, 3.8, 3.1, 4.7, 280, 120, 'Варка', '/uploads/borsch.jpg', false, true],
  ['Яблочный пирог', 'Яблоки, мука, сливочное масло, яйца, сахар, корица', 251, 3.1, 11.5, 34, 180, 75, 'Выпечка в духовке', '/uploads/pie.jpg', true, false],
  ['Салат с овощами', 'Огурцы, томаты, перец, листья салата, оливковое масло', 58, 1.2, 3.9, 4.6, 210, 15, 'Без термической обработки', '/uploads/salad.jpg', false, false],
  ['Тыквенный суп-пюре', 'Тыква, сливки, лук, имбирь, тыквенные семечки', 78, 1.9, 4.2, 8.6, 260, 40, 'Варка и взбивание', '/uploads/soup.jpg', true, false],
];

const promotions = [
  ['Свежий хлеб к завтраку', 'С 8:00 до 11:00 скидка 15% на всю выпечку'],
  ['Бесплатная доставка', 'При заказе от 1000 рублей привезём бесплатно'],
];

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
  });
  const db = process.env.DB_NAME;
  await connection.query(`DROP DATABASE IF EXISTS ${db}; CREATE DATABASE ${db} CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci; USE ${db};`);
  await connection.query(schema);
  await connection.query(
    'INSERT INTO dishes (name, composition, calories, proteins, fats, carbs, price, cook_time, cook_method, image, is_new, is_recommended) VALUES ?',
    [dishes]
  );
  await connection.query('INSERT INTO promotions (title, text) VALUES ?', [promotions]);
  await connection.end();
  console.log('База данных создана и заполнена');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
