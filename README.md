# Практическая работа №44-45. Single Page Application «Домашний Хлеб»

Сервис доставки продуктов питания: Express.js + MySQL на сервере, Vue 3 на клиенте. Вся логика приложения работает через API, ответы в формате JSON.

## Запуск в Open Server Panel 6

Настройки проекта лежат в `.osp\project.ini`: домен `domashniy-hleb.local`, запуск `node server\index.js`.
Сервер Express отдаёт и API, и собранный клиент (`client\dist`), Open Server передаёт ему все запросы к домену.

1. Скопировать папку проекта в `C:\OSPanel\home`
2. Если нет файла `server\.env`, скопировать в него `server\.env.example`. В `DB_HOST` указано имя модуля MySQL (`MySQL-8.0`)
3. Перезапустить Open Server, включить модули MySQL-8.0 и Nginx
4. В консоли Open Server:

```
osp project domashniy-hleb.local
cd server
npm install
node seed.js
cd ..\client
npm install
npm run build
node server\index.js
```

Сайт: http://domashniy-hleb.local

Для разработки без Open Server: в папке `server` выполнить `node index.js`, в папке `client` — `npm run dev`
(Vite передаёт запросы `/api` и `/uploads` серверу на порт 3004).

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
