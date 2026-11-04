# Практическая работа №44-45. Single Page Application «Домашний Хлеб»

Сервис доставки продуктов питания: Express.js + MySQL на сервере, Vue 3 на клиенте. Вся логика приложения работает через API, ответы в формате JSON.

## Запуск

Сервер (MySQL должен быть запущен):

```
cd server
npm install
copy .env.example .env
node seed.js
node index.js
```

Клиент:

```
cd client
npm install
npm run dev
```

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
