
# 📚 Руководство разработчика API
## Создание модулей для каталога "Мужское дело"

## 🎯 Обзор

Вы будете работать с самописным Node.js фреймворком, созданным специально для этого проекта. Каждый разработчик создает свой модуль (blueprint) в папке `blueprints/`, реализуя API для своей категории товаров.

## 📁 Структура вашего модуля

Каждый разработчик работает в своей папке `blueprints/<имя>_service/`:

```
blueprints/
├── food_service/              # Пример модуля
│   ├── data/                   # Хранилище данных
│   │   ├── products.json
│   │   └── categories.json
│   ├── routes/                 # Роутинг
│   │   ├── products.routes.js
│   │   └── categories.routes.js
│   ├── controllers/            # Обработка запросов
│   │   ├── ProductsController.js
│   │   └── CategoriesController.js
│   ├── services/               # Бизнес-логика и работа с БД
│   │   ├── ProductsService.js
│   │   └── CategoriesService.js
│   └── __tests__/              # Тесты API
│       ├── products.test.js
│       └── categories.test.js
```

## 🚀 Пошаговая инструкция создания API

### Шаг 1: Создание структуры модуля

1. Создайте папку с вашей темой: `blueprints/<имя>_service/`
2. Внутри создайте подпапки: `data/`, `routes/`, `controllers/`, `services/`, `__tests__/`

### Шаг 2: Определение сущностей

Каждый разработчик должен реализовать **минимум 2 сущности**. 
Обязательные типы полей для каждой сущности:
- **string** (обязательно)
- **number** (обязательно)
- **boolean** (обязательно)
- **Date** (обязательно, формат ISO)
- **Array** (обязательно)

**Пример сущности "Продукт":**
```json
{
  "id": "prod_001",
  "name": "Стейк из говядины",
  "price": 1299.99,
  "available": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "tags": ["мясо", "гриль"],
  "ingredients": ["говядина", "специи"]
}
```

### Шаг 3: Создание Service слоя

Service слой отвечает за бизнес-логику и работу с JSON-файлами через `FileManager`.

**`blueprints/<имя>_service/services/ProductsService.js`**
```javascript
const { fileManager } = require('../../../lib/fileManager');

class ProductsService {
  constructor() {
    // Укажите корректный путь к файлу данных
    this.dataFile = 'blueprints/<имя>_service/data/products.json';
  }

  async findAll() {
    return await fileManager.readJSON(this.dataFile);
  }

  async findById(id) {
    return await fileManager.findById(this.dataFile, id);
  }

  async create(productData) {
    // Валидация обязательных полей
    if (!productData.name || !productData.price) {
      throw new Error('Название и цена обязательны');
    }
    return await fileManager.create(this.dataFile, productData);
  }

  async update(id, updateData) {
    const existing = await this.findById(id);
    if (!existing) return null;
    return await fileManager.update(this.dataFile, id, updateData);
  }

  async delete(id) {
    return await fileManager.delete(this.dataFile, id);
  }

  // Пример бизнес-логики: фильтрация по цене
  async findByPriceRange(min, max) {
    const products = await this.findAll();
    return products.filter(p => p.price >= min && p.price <= max);
  }
}

module.exports = ProductsService;
```

### Шаг 4: Создание Controller слоя

Controller обрабатывает HTTP-запросы, валидирует ввод и вызывает Service. Использует `createError` для корректного возврата ошибок API.

**`blueprints/<имя>_service/controllers/ProductsController.js`**
```javascript
const ProductsService = require('../services/ProductsService');
const { createError } = require('../../../core/middleware/errorHandler');

class ProductsController {
  constructor() {
    this.service = new ProductsService();
  }

  // GET /api/products
  async getAll(req, res, next) {
    try {
      const products = await this.service.findAll();
      res.json({
        success: true,
        data: products,
        total: products.length
      });
    } catch (error) {
      next(createError(500, 'Не удалось получить продукты', error));
    }
  }

  // POST /api/products
  async create(req, res, next) {
    try {
      if (!req.body.name || !req.body.price) {
        return next(createError(400, 'Название и цена обязательны'));
      }
      
      const newProduct = await this.service.create(req.body);
      res.status(201).json({
        success: true,
        data: newProduct,
        message: 'Продукт создан'
      });
    } catch (error) {
      next(createError(500, 'Ошибка создания', error));
    }
  }
  
  // ... другие методы getById, update, delete аналогично
}

module.exports = ProductsController;
```

### Шаг 5: Создание маршрутов (Routes)

Файл маршрутов экспортирует функцию, которая принимает экземпляр `app` и регистрирует хендлеры.

**`blueprints/<имя>_service/routes/products.routes.js`**
```javascript
module.exports = function(app) {
  const ProductsController = require('../controllers/ProductsController');
  const controller = new ProductsController();
  
  app.get('/api/products', controller.getAll.bind(controller));
  app.post('/api/products', controller.create.bind(controller));
  app.get('/api/products/:id', controller.getById.bind(controller));
  app.put('/api/products/:id', controller.update.bind(controller));
  app.delete('/api/products/:id', controller.delete.bind(controller));
};
```

### Шаг 6: Создание тестов

Используйте `supertest` для интеграционного тестирования. **Не импортируйте** `server.js`. Создавайте отдельный инстанс `App`.

**`blueprints/<имя>_service/__tests__/products.test.js`**
```javascript
const request = require('supertest');
const App = require('../../../core/App');
const bodyParser = require('../../../core/middleware/bodyParser');
const { errorHandler } = require('../../../core/middleware/errorHandler');

describe('API продуктов', () => {
  let app;

  beforeAll(() => {
    app = new App();
    app.use(bodyParser());
    app.setErrorHandler(errorHandler()); // Используем общий обработчик
    require('../routes/products.routes.js')(app);
  });

  test('GET /api/products должен возвращать массив', async () => {
    const res = await request(app).get('/api/products').expect(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('POST /api/products должен создавать продукт', async () => {
    const newProduct = { name: 'Тест', price: 100 };
    const res = await request(app)
      .post('/api/products')
      .send(newProduct)
      .expect(201);
    
    expect(res.body.data.name).toBe('Тест');
    expect(res.body.data.id).toBeDefined();
  });
});
```

## 🛠️ Доступные утилиты

### 1. FileManager
Находится в `lib/fileManager.js`. Обеспечивает атомарную запись и CRUD.
```javascript
const { fileManager } = require('../../../lib/fileManager');

await fileManager.readJSON('path/to/file.json');
await fileManager.create('path/to/file.json', { data: 'value' });
await fileManager.update('path/to/file.json', 'id', { data: 'newValue' });
await fileManager.delete('path/to/file.json', 'id');
```

### 2. createError
Для создания HTTP-ошибок с кодом статуса.
```javascript
const { createError } = require('../../../core/middleware/errorHandler');
throw createError(404, 'Ресурс не найден');
```

### 3. DataGenerator
Для заполнения тестовыми данными.
```javascript
const { dataGenerator } = require('../../../lib/dataGenerator');
const data = dataGenerator.generate({
  name: { type: 'string', min: 3, max: 10 },
  price: { type: 'number', min: 10, max: 1000 }
}, 10);
```

---

## ⚠️ Архитектурные ограничения (Важно!)

При разработке модулей учитывайте следующие особенности фреймворка:

### 1. Запрет на кастомный 404 через middleware
В отличие от Express, **нельзя** просто добавить `app.use(...)` в конце `server.js` для обработки 404. В нашей архитектуре middleware выполняются до роутинга. Если middleware отправит ответ (res.send/res.json), он перехватит **все** запросы. Обработка 404 реализована внутри ядра `App.js`.

### 2. Обязательное использование setErrorHandler
Класс `App` имеет встроенный простой обработчик ошибок (простой текст), который сломает JSON-формат ответов вашего API. В `server.js` всегда вызывается `app.setErrorHandler(...)`. Ваши контроллеры должны всегда использовать `createError` и передавать ошибки в `next()`, чтобы они попали в этот обработчик.

### 3. Работа с путями
В `FileManager` всегда используйте относительные пути от корня проекта, например: `'blueprints/food_service/data/products.json'`.

---

## 📝 Рекомендации и лучшие практики

### 1. Валидация
Проверяйте данные в контроллере до передачи в сервис.
```javascript
if (typeof req.body.price !== 'number') {
  return next(createError(400, 'Цена должна быть числом'));
}
```

### 2. Формат ответов
Держите единый формат.
**Успех:** `{ success: true, data: ..., message: "..." }`
**Ошибка:** `{ error: true, message: "..." }` (автоматически генерируется errorHandler).

### 3. RESTful пути
Используйте существительные во множественном числе:
`GET /api/products`, `GET /api/products/123`.

### 4. Изоляция тестов
Тесты пишут реальные данные в JSON файлы. Используйте уникальные данные или очищайте их после тестов, чтобы не засорять `data/`.

## 🚀 Порядок работы

1. Создать структуру папок.
2. Описать 2+ сущности с нужными типами полей.
3. Реализовать Service слой.
4. Реализовать Controller слой с обработкой ошибок.
5. Зарегистрировать маршруты.
6. Написать тесты (`npm test -- <имя_сервиса>`).

Подробную информацию о тестировании (моки, интеграционные тесты) смотрите в [`docs/TESTING.md`](./TESTING.md).
