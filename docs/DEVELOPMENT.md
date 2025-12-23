
# 📚 Руководство разработчика API
## Создание модулей для каталога "Мужское дело"

## 🎯 Обзор

Вы будете работать с самописным Node.js фреймворком, созданным специально для этого проекта. Каждый разработчик создает свой модуль (blueprint) в папке `blueprints/`, реализуя API для своей категории товаров.

## 📁 Структура вашего модуля

Каждый разработчик работает в своей папке `blueprints/<имя>_service/`:

```
blueprints/
├── food_service/  // Например, мой вариант
│   ├── data/
│   │   ├── products.json
│   │   └── categories.json
│   ├── routes/
│   │   ├── products.routes.js
│   │   └── categories.routes.js
│   ├── controllers/
│   │   ├── ProductsController.js
│   │   └── CategoriesController.js
│   ├── services/
│   │   ├── ProductsService.js
│   │   └── CategoriesService.js
│   └── __tests__/
│       ├── products.test.js
│       └── categories.test.js
```

## 🚀 Пошаговая инструкция создания API

### Шаг 1: Создание структуры модуля

1. Скопируйте шаблон (если он существует) или создайте структуру вручную
2. Создайте папку с вашей темой под номером варианта: `blueprints/<имя>_service/`
3. Создайте все необходимые подпапки

### Шаг 2: Определение сущностей

Каждый разработчик должен реализовать **минимум 2 сущности**. Каждая сущность должна содержать следующие типы полей:

- **string** (обязательно) - текстовое поле
- **number** (обязательно) - числовое поле
- **boolean** (обязательно) - логическое поле
- **Date** (обязательно) - дата в формате ISO
- **Array** (обязательно) - массив элементов

Пример сущности "Продукт":

```json
{
  "id": "prod_001",
  "name": "Стейк из говядины",
  "price": 1299.99,
  "available": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "tags": ["мясо", "гриль", "премиум"],
  "ingredients": ["говядина", "специи", "масло"]
}
```

### Шаг 3: Создание JSON файлов с данными

Создайте файлы в папке `data/` для каждой сущности:

**blueprints/<имя>_service/data/products.json**
```json
[
  {
    "id": "prod_001",
    "name": "Стейк из говядины",
    "price": 1299.99,
    "available": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "tags": ["мясо", "гриль", "премиум"],
    "ingredients": ["говядина", "специи", "масло"]
  },
  {
    "id": "prod_002",
    "name": "Салат Цезарь",
    "price": 450.00,
    "available": true,
    "createdAt": "2024-01-16T14:20:00.000Z",
    "updatedAt": "2024-01-16T14:20:00.000Z",
    "tags": ["салат", "легкий", "классика"],
    "ingredients": ["салат романо", "курица", "сухарики", "пармезан"]
  }
]
```

### Шаг 4: Создание Service слоя

Service слой отвечает за бизнес-логику и работу с данными.

**blueprints/<имя>_service/services/ProductsService.js**
```javascript
const { fileManager } = require('../../../lib/fileManager');

class ProductsService {
  constructor() {
    this.dataFile = 'blueprints/<имя>_service/data/products.json';
  }

  // Получить все продукты
  async findAll() {
    return await fileManager.readJSON(this.dataFile);
  }

  // Найти продукт по ID
  async findById(id) {
    return await fileManager.findById(this.dataFile, id);
  }

  // Создать новый продукт
  async create(productData) {
    // Валидация данных
    if (!productData.name || !productData.price) {
      throw new Error('Название и цена обязательны');
    }

    return await fileManager.create(this.dataFile, productData);
  }

  // Обновить продукт
  async update(id, updateData) {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    return await fileManager.update(this.dataFile, id, updateData);
  }

  // Удалить продукт
  async delete(id) {
    return await fileManager.delete(this.dataFile, id);
  }

  // Дополнительный метод: поиск по тегам
  async findByTag(tag) {
    const products = await this.findAll();
    return products.filter(product => 
      product.tags && product.tags.includes(tag)
    );
  }

  // Дополнительный метод: фильтрация по цене
  async findByPriceRange(min, max) {
    const products = await this.findAll();
    return products.filter(product => 
      product.price >= min && product.price <= max
    );
  }
}

module.exports = ProductsService;
```

### Шаг 5: Создание Controller слоя

Controller обрабатывает HTTP запросы и вызывает методы Service.

**blueprints/<имя>_service/controllers/ProductsController.js**
```javascript
const ProductsService = require('../services/ProductsService');
const { createError } = require('../../../core/middleware/errorHandler');

class ProductsController {
  constructor() {
    this.service = new ProductsService();
  }

  // GET /api/products - получить все продукты
  async getAll(req, res, next) {
    try {
      const products = await this.service.findAll();
      res.json({
        success: true,
        data: products,
        total: products.length
      });
    } catch (error) {
      return next(createError(500, 'Не удалось получить продукты', error));
    }
  }

  // GET /api/products/:id - получить продукт по ID
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const product = await this.service.findById(id);
      
      if (!product) {
        return next(createError(404, 'Продукт не найден'));
      }
      
      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      return next(createError(500, 'Не удалось получить продукт', error));
    }
  }

  // POST /api/products - создать новый продукт
  async create(req, res, next) {
    try {
      const productData = req.body;
      
      // Базовая валидация
      if (!productData.name || !productData.price) {
        return next(createError(400, 'Название и цена обязательны'));
      }
      
      const newProduct = await this.service.create(productData);
      
      res.status(201).json({
        success: true,
        data: newProduct,
        message: 'Продукт успешно создан'
      });
    } catch (error) {
      return next(createError(500, 'Не удалось создать продукт', error));
    }
  }

  // PUT /api/products/:id - обновить продукт
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const updatedProduct = await this.service.update(id, updateData);
      
      if (!updatedProduct) {
        return next(createError(404, 'Продукт не найден'));
      }
      
      res.json({
        success: true,
        data: updatedProduct,
        message: 'Продукт успешно обновлен'
      });
    } catch (error) {
      return next(createError(500, 'Не удалось обновить продукт', error));
    }
  }

  // DELETE /api/products/:id - удалить продукт
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      
      const deleted = await this.service.delete(id);
      
      if (!deleted) {
        return next(createError(404, 'Продукт не найден'));
      }
      
      res.json({
        success: true,
        message: 'Продукт успешно удален'
      });
    } catch (error) {
      return next(createError(500, 'Не удалось удалить продукт', error));
    }
  }

  // GET /api/products/search/tag/:tag - поиск по тегу
  async findByTag(req, res, next) {
    try {
      const { tag } = req.params;
      const products = await this.service.findByTag(tag);
      
      res.json({
        success: true,
        data: products,
        total: products.length,
        tag: tag
      });
    } catch (error) {
      return next(createError(500, 'Не удалось найти продукты', error));
    }
  }

  // GET /api/products/search/price - поиск по диапазону цен
  async findByPriceRange(req, res, next) {
    try {
      const { min, max } = req.query;
      
      if (!min || !max) {
        return next(createError(400, 'Минимальная и максимальная цена обязательны'));
      }
      
      const products = await this.service.findByPriceRange(
        parseFloat(min), 
        parseFloat(max)
      );
      
      res.json({
        success: true,
        data: products,
        total: products.length,
        priceRange: { min: parseFloat(min), max: parseFloat(max) }
      });
    } catch (error) {
      return next(createError(500, 'Не удалось найти продукты', error));
    }
  }
}

module.exports = ProductsController;
```

### Шаг 6: Создание маршрутов

Регистрируем все маршруты в файле routes.

**blueprints/<имя>_service/routes/products.routes.js**
```javascript
module.exports = function(app) {
  const ProductsController = require('../controllers/ProductsController');
  const controller = new ProductsController();
  
  // Базовые CRUD операции
  app.get('/api/products', controller.getAll.bind(controller));
  app.get('/api/products/:id', controller.getById.bind(controller));
  app.post('/api/products', controller.create.bind(controller));
  app.put('/api/products/:id', controller.update.bind(controller));
  app.delete('/api/products/:id', controller.delete.bind(controller));
  
  // Дополнительные маршруты для поиска
  app.get('/api/products/search/tag/:tag', controller.findByTag.bind(controller));
  app.get('/api/products/search/price', controller.findByPriceRange.bind(controller));
};
```

### Шаг 7: Создание тестов

Тестируем наш API.

**blueprints/<имя>_service/__tests__/products.test.js**
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
    app.use(errorHandler());
    
    // Загружаем маршруты нашего модуля
    require('../routes/products.routes.js')(app);
  });

  describe('GET /api/products', () => {
    test('должен возвращать все продукты', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.total).toBeDefined();
    });
  });

  describe('GET /api/products/:id', () => {
    test('должен возвращать продукт по ID', async () => {
      // Сначала получаем все продукты, чтобы найти ID
      const productsResponse = await request(app)
        .get('/api/products')
        .expect(200);
      
      if (productsResponse.body.data.length > 0) {
        const productId = productsResponse.body.data[0].id;
        
        const response = await request(app)
          .get(`/api/products/${productId}`)
          .expect(200);
        
        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(productId);
      }
    });

    test('должен возвращать 404 для несуществующего продукта', async () => {
      const response = await request(app)
        .get('/api/products/non-existent-id')
        .expect(404);
      
      expect(response.body.error).toBe(true);
      expect(response.body.message).toContain('не найден');
    });
  });

  describe('POST /api/products', () => {
    test('должен создавать новый продукт', async () => {
      const newProduct = {
        name: 'Тестовый продукт',
        price: 999.99,
        available: true,
        tags: ['тест', 'новый'],
        ingredients: ['ингредиент1', 'ингредиент2']
      };

      const response = await request(app)
        .post('/api/products')
        .send(newProduct)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(newProduct.name);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
    });

    test('должен возвращать 400 для отсутствующих обязательных полей', async () => {
      const invalidProduct = {
        price: 999.99
      };

      const response = await request(app)
        .post('/api/products')
        .send(invalidProduct)
        .expect(400);
      
      expect(response.body.error).toBe(true);
      expect(response.body.message).toContain('обязательны');
    });
  });

  describe('PUT /api/products/:id', () => {
    test('должен обновлять существующий продукт', async () => {
      // Сначала создаем продукт
      const createResponse = await request(app)
        .post('/api/products')
        .send({
          name: 'Продукт для обновления',
          price: 500,
          available: true
        })
        .expect(201);
      
      const productId = createResponse.body.data.id;
      
      // Обновляем продукт
      const updateData = {
        name: 'Обновленный продукт',
        price: 750
      };
      
      const updateResponse = await request(app)
        .put(`/api/products/${productId}`)
        .send(updateData)
        .expect(200);
      
      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.name).toBe(updateData.name);
      expect(updateResponse.body.data.price).toBe(updateData.price);
      expect(updateResponse.body.data.updatedAt).toBeDefined();
    });
  });

  describe('DELETE /api/products/:id', () => {
    test('должен удалять существующий продукт', async () => {
      // Сначала создаем продукт
      const createResponse = await request(app)
        .post('/api/products')
        .send({
          name: 'Продукт для удаления',
          price: 100,
          available: true
        })
        .expect(201);
      
      const productId = createResponse.body.data.id;
      
      // Удаляем продукт
      const deleteResponse = await request(app)
        .delete(`/api/products/${productId}`)
        .expect(200);
      
      expect(deleteResponse.body.success).toBe(true);
      expect(deleteResponse.body.message).toContain('удален');
      
      // Проверяем, что продукт действительно удален
      await request(app)
        .get(`/api/products/${productId}`)
        .expect(404);
    });
  });
});
```

## 🛠️ Доступные утилиты

### 1. FileManager

Работа с JSON файлами:

```javascript
const { fileManager } = require('../../../lib/fileManager');

// Чтение файла
const data = await fileManager.readJSON('blueprints/<имя>_service/data/products.json');

// Создание записи
const newItem = await fileManager.create('blueprints/<имя>_service/data/products.json', {
  name: 'Новый продукт',
  price: 999.99
});

// Обновление записи
const updated = await fileManager.update('blueprints/<имя>_service/data/products.json', 'id', {
  name: 'Обновленное имя'
});

// Удаление записи
const deleted = await fileManager.delete('blueprints/<имя>_service/data/products.json', 'id');
```

### 2. DataGenerator

Генерация тестовых данных:

```javascript
const { dataGenerator } = require('../../../lib/dataGenerator');

// Создание тестовых продуктов
const testProducts = dataGenerator.generate({
  name: { type: 'string', min: 5, max: 20 },
  price: { type: 'number', min: 100, max: 5000 },
  available: 'boolean',
  tags: { type: 'array', items: 'string', size: 3 },
  ingredients: { type: 'array', items: 'string', size: 5 }
}, 10);

// Сохранение в файл
await fileManager.writeJSON('blueprints/<имя>_service/data/products.json', testProducts);
```

### 3. Обработка ошибок

Создание HTTP ошибок:

```javascript
const { createError } = require('../../../core/middleware/errorHandler');

// В контроллере
if (!product) {
  return next(createError(404, 'Продукт не найден'));
}

if (!req.body.name) {
  return next(createError(400, 'Название обязательно'));
}
```

## 🧪 Запуск тестов

```bash
# Запустить все тесты
npm test

# Запустить только тесты вашего модуля
npm test -- blueprints/<имя>_service

# Запустить тесты с покрытием
npm run test:coverage

# Запустить тесты в режиме наблюдения
npm run test:watch
```

## 📝 Рекомендации и лучшие практики

### 1. Валидация данных

Всегда валидируйте входящие данные:

```javascript
// В контроллере
function validateProduct(data) {
  const errors = [];
  
  if (!data.name || data.name.length < 3) {
    errors.push('Название должно содержать минимум 3 символа');
  }
  
  if (!data.price || data.price < 0) {
    errors.push('Цена должна быть положительным числом');
  }
  
  if (errors.length > 0) {
    throw createError(400, 'Ошибка валидации', { errors });
  }
}
```

### 2. Единый формат ответов

Используйте единый формат для всех ответов API:

```javascript
// Успешный ответ
{
  "success": true,
  "data": { ... },
  "message": "Операция выполнена успешно",
  "total": 10 // для списков
}

// Ответ с ошибкой
{
  "error": true,
  "message": "Описание ошибки",
  "status": 400,
  "details": { ... } // опционально
}
```

### 3. Именование маршрутов

Используйте RESTful соглашения:

```
GET    /api/products           # Получить все
GET    /api/products/:id       # Получить один
POST   /api/products           # Создать
PUT    /api/products/:id       # Обновить полностью
PATCH  /api/products/:id       # Обновить частично
DELETE /api/products/:id       # Удалить
```

### 4. Обработка асинхронных ошибок

Используйте try-catch во всех асинхронных методах:

```javascript
async getById(req, res, next) {
  try {
    const product = await this.service.findById(req.params.id);
    if (!product) {
      return next(createError(404, 'Продукт не найден'));
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(createError(500, 'Не удалось получить продукт', error));
  }
}
```

### 5. Тестирование

Пишите тесты для всех основных сценариев:

- Успешные операции
- Ошибки валидации
- Не найденные ресурсы
- Некорректные входные данные

## 🚀 Порядок работы

1. Создайте структуру папок для вашего варианта
2. Определите 2+ сущности с обязательными типами полей
3. Создайте JSON файлы с начальными данными
4. Реализуйте Service слой для каждой сущности
5. Создайте Controllers с обработкой ошибок
6. Зарегистрируйте маршруты
7. Напишите тесты
8. Проверьте работу API

## 📞 Поддержка

Если у вас возникнут вопросы или проблемы:
1. Проверьте консоль на наличие ошибок
2. Убедитесь, что все пути к файлам правильные
3. Проверьте, что вы правильно экспортируете модули
4. Запустите тесты для диагностики проблем

Удачи в разработке! 🎉

---

Эта документация предоставит вашей команде все необходимые инструменты и знания для успешной реализации API для каталога "Мужское дело". Каждый разработчик сможет работать независимо, используя общую инфраструктуру фреймворка.
```
