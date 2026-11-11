# Практическая работа №44-45. Single Page Application «Домашний Хлеб»

Сервис доставки продуктов питания: Express.js + MySQL на сервере, Vue 3 на клиенте. Вся логика приложения работает через API, ответы в формате JSON.

## Запуск

База данных - MySQL из Open Server: в Open Server включить модуль MySQL и запустить сервер.
Если нет файла `server\.env`, скопировать в него `server\.env.example` (MySQL на localhost, пользователь root без пароля).

Терминал 1, сервер:

```
cd server
npm install
node seed.js
node index.js
```

Терминал 2, клиент:

```
cd client
npm install
npm run dev
```

API: http://localhost:3004/api, сайт: адрес, который напечатает Vite (обычно http://localhost:5173).

Запросы к API для Postman с описаниями: `ПР44-45.postman_collection.json` (Postman -> Import).

## API

| Метод | Адрес | Описание |
|-------|-------|----------|
| POST | /api/register | регистрация |
| POST | /api/login | вход |
| POST | /api/logout | выход |
| GET | /api/menu | акции, рекомендации, новинки |
| GET, POST | /api/dishes | список и создание блюд |
| GET, PUT, DELETE | /api/dishes/:id | блюдо |
| GET | /api/search?q= | поиск |
| GET, POST | /api/cart | корзина, добавление блюда |
| PATCH, DELETE | /api/cart/:dishId | количество, удаление |
| POST | /api/orders | оформление заказа |
