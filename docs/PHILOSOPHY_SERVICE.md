# 📚 Модуль философской литературы (Philosophy Service)

# 📋 Обзор
Модуль philosophy_service реализует API для управления каталогом философских книг и биографий философов магазина "Мужское дело".

## 🏗️ Архитектура
Модуль построен по паттерну MVC:

- **Services**: Бизнес-логика и работа с JSON-файлами (`BooksService, PhilosophersService`).
- **Controllers**: Обработка HTTP-запросов и ответов.
- **Routes**: Определение эндпоинтов API.

## 📖 Сущности
### 1. Book (Книга)
`title`: Название книги (string)
`price`: Цена (number)
`isAvailable`: В наличии (boolean)
`publishDate`: Дата публикации (Date)
`tags`: Теги/Направления (Array)
## 2. Philosopher (Философ)
`name`: Имя философа (string)
`birthYear`: Год рождения (number)
`isActive`: Жив (boolean)
`dateOfDeath`: Дата смерти (Date)
`schools`: Школы (Array)
## 🌐 Эндпоинты

### Книги
- `GET /api/philosophy/books` — Получить все книги
- `GET /api/philosophy/books/:id` — Получить книгу по ID
- `POST /api/philosophy/books` — Создать книгу
- `PUT /api/philosophy/books/:id` — Обновить книгу
- `DELETE /api/philosophy/books/:id` — Удалить книгу
- `GET /api/philosophy/books/search/tag/:tag` — Поиск по тегу
### Философы
- `GET /api/philosophy/philosophers` — Получить всех философов
- `GET /api/philosophy/philosophers/:id` — Получить философа по ID
- `POST /api/philosophy/philosophers` — Создать философа
- `PUT /api/philosophy/philosophers/:id` — Обновить философа
- `DELETE /api/philosophy/philosophers/:id` — Удалить философа
- `GET /api/philosophy/philosophers/search/school/:school` — Поиск по школе
## 💻 Примеры запросов
### Создание книги
```bash
curl -X POST http://localhost:3000/api/philosophy/books \  -H "Content-Type: application/json" \  -d '{    "title": "Миф о Сизифе",    "price": 350,    "isAvailable": true,    "tags": ["абсурдизм", "экзистенциализм"]  }'
```
### Поиск по школе
```bash
curl http://localhost:3000/api/philosophy/philosophers/search/school/Стоицизм
```