require('dotenv').config();
const mysql = require('mysql2/promise');

// Один пул соединений на всё приложение. decimalNumbers: цена и КБЖУ приходят числами, а не строками '199.00'
module.exports = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  decimalNumbers: true,
});
