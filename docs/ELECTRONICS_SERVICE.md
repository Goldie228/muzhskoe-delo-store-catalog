
# ⚡ Модуль электротехники (Electronics Service)

## 📋 Обзор

Модуль `electronics_service` реализует API для управления электротехническими товарами, производителями и заказами в проекте "Мужское дело".

## 🏗️ Архитектура

Модуль построен по паттерну MVC:
- **Services**: Бизнес-логика и работа с JSON-файлами (`ElectricalGoodsService`, `ManufacturersService`, `OrdersService`).
- **Controllers**: Обработка HTTP-запросов и ответов.
- **Routes**: Определение эндпоинтов API.

## 🧱 Сущности

### 1. Электротовар (Electrical Good)
- `name`: Название товара (string)
- `category`: Категория (string)
- `price`: Цена (number)
- `voltage`: Напряжение, В (number)
- `current`: Ток, А (number)
- `isInStock`: В наличии (boolean)
- `specifications`: Технические характеристики (Array<string>)
- `createdAt`: Дата создания (Date)

### 2. Производитель (Manufacturer)
- `name`: Название (string)
- `country`: Страна (string)
- `foundedYear`: Год основания (number)
- `qualityRating`: Рейтинг качества, 1-5 (number)
- `isCertified`: Сертифицирован (boolean)
- `productLines`: Линейки продукции (Array<string>)
- `createdAt`: Дата создания (Date)

### 3. Заказ (Order)
- `orderNumber`: Номер заказа (string)
- `customerName`: Имя клиента (string)
- `items`: Товары в заказе (Array<Object>)
- `totalAmount`: Общая сумма (number)
- `status`: Статус заказа (string)
- `orderDate`: Дата заказа (Date)

## 🌐 Эндпоинты

### Электротовары
- `GET /api/electronics/goods` — Получить все товары
- `GET /api/electronics/goods/:id` — Получить товар по ID
- `POST /api/electronics/goods` — Создать товар
- `PUT /api/electronics/goods/:id` — Обновить товар
- `DELETE /api/electronics/goods/:id` — Удалить товар
- `GET /api/electronics/goods/category/:category` — Товары по категории
- `GET /api/electronics/goods/instock` — Товары в наличии

### Производители
- `GET /api/electronics/manufacturers` — Все производители
- `GET /api/electronics/manufacturers/:id` — Производитель по ID
- `POST /api/electronics/manufacturers` — Создать производителя
- `PUT /api/electronics/manufacturers/:id` — Обновить производителя
- `DELETE /api/electronics/manufacturers/:id` — Удалить производителя
- `GET /api/electronics/manufacturers/certified` — Сертифицированные производители

### Заказы
- `GET /api/electronics/orders` — Все заказы
- `GET /api/electronics/orders/:id` — Заказ по ID
- `POST /api/electronics/orders` — Создать заказ
- `PUT /api/electronics/orders/:id` — Обновить заказ
- `DELETE /api/electronics/orders/:id` — Удалить заказ
- `PATCH /api/electronics/orders/:id/status` — Обновить статус заказа

## 💻 Примеры запросов

### Создание электротовара
```bash
curl -X POST http://localhost:3000/api/electronics/goods \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Розетка Legrand Valena",
    "category": "розетки",
    "price": 450,
    "voltage": 250,
    "current": 16,
    "isInStock": true,
    "specifications": ["IP20", "белый"]
  }'