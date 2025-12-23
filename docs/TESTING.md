
# 🧪 Руководство по тестированию

## 📋 Обзор

В этом документе описаны подходы к тестированию приложений на нашем фреймворке, включая настройку тестовой среды, написание тестов и лучшие практики.

## 🛠️ Инструменты тестирования

### Jest
Основной фреймворк для тестирования, настроенный в проекте:

```bash
# Запуск всех тестов
npm test

# Запуск тестов с покрытием кода
npm run test:coverage

# Запуск тестов в режиме наблюдения
npm run test:watch

# Запуск только тестов ядра
npm run test:core

# Запуск только тестов модулей
npm run test:blueprints
```

### Supertest
Библиотека для тестирования HTTP-эндпоинтов:

```javascript
const request = require('supertest');
const app = require('./core/App');

describe('API Tests', () => {
  test('должен возвращать список пользователей', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
```

## 🏗️ Структура тестов

### Тесты ядра фреймворка
Тесты основных компонентов фреймворка расположены в папке `tests/`:

```
tests/
├── App.test.js           # Тесты класса App
├── Router.test.js        # Тесты маршрутизатора
├── Request.test.js       # Тесты объекта запроса
├── Response.test.js      # Тесты объекта ответа
├── setup.js              # Настройка тестовой среды
└── teardown.js           # Очистка после тестов
```

### Тесты модулей (blueprints)
Тесты каждого модуля располагаются в папке `blueprints/<имя>_service/__tests__/`:

```
blueprints/
├── food_service/
│   └── __tests__/
│       ├── products.test.js
│       └── categories.test.js
├── electronics_service/
│   └── __tests__/
│       ├── devices.test.js
│       └── manufacturers.test.js
```

## 📝 Написание тестов

### Тестирование контроллеров

```javascript
const request = require('supertest');
const App = require('../../../core/App');
const bodyParser = require('../../../core/middleware/bodyParser');
const { errorHandler } = require('../../../core/middleware/errorHandler');

describe('Контроллер продуктов', () => {
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

  describe('POST /api/products', () => {
    test('должен создавать новый продукт', async () => {
      const newProduct = {
        name: 'Тестовый продукт',
        price: 999.99,
        available: true
      };

      const response = await request(app)
        .post('/api/products')
        .send(newProduct)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(newProduct.name);
      expect(response.body.data.id).toBeDefined();
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
});
```

### Тестирование сервисов

```javascript
const ProductsService = require('../services/ProductsService');
const { fileManager } = require('../../../lib/fileManager');

describe('Сервис продуктов', () => {
  const testDataFile = 'test-products.json';
  let service;

  beforeAll(async () => {
    // Создаем тестовый файл с данными
    await fileManager.writeJSON(testDataFile, [
      { id: '1', name: 'Продукт 1', price: 100, available: true },
      { id: '2', name: 'Продукт 2', price: 200, available: false }
    ]);
    
    service = new ProductsService(testDataFile);
  });

  afterAll(async () => {
    // Удаляем тестовый файл
    // В реальном проекте здесь может быть очистка временных файлов
  });

  describe('findAll', () => {
    test('должен возвращать все продукты', async () => {
      const products = await service.findAll();
      expect(products).toHaveLength(2);
      expect(products[0].name).toBe('Продукт 1');
    });
  });

  describe('findById', () => {
    test('должен возвращать продукт по ID', async () => {
      const product = await service.findById('1');
      expect(product.name).toBe('Продукт 1');
    });

    test('должен возвращать null для несуществующего ID', async () => {
      const product = await service.findById('999');
      expect(product).toBeNull();
    });
  });

  describe('create', () => {
    test('должен создавать новый продукт', async () => {
      const newProduct = {
        name: 'Новый продукт',
        price: 300,
        available: true
      };

      const created = await service.create(newProduct);
      expect(created.id).toBeDefined();
      expect(created.name).toBe(newProduct.name);
      expect(created.createdAt).toBeDefined();
    });
  });
});
```

### Тестирование утилит

```javascript
const { fileManager } = require('../../../lib/fileManager');

describe('Менеджер файлов', () => {
  const testFile = 'test-data.json';

  afterAll(async () => {
    // Очистка тестовых данных
    try {
      await fs.unlink(testFile);
    } catch (e) {
      // Игнорируем ошибку, если файл не существует
    }
  });

  describe('readJSON', () => {
    test('должен возвращать пустой массив для несуществующего файла', async () => {
      const data = await fileManager.readJSON('non-existent-file.json');
      expect(data).toEqual([]);
    });

    test('должен парсить JSON файл', async () => {
      await fs.writeFile(testFile, '[{"name": "test"}]');
      const data = await fileManager.readJSON(testFile);
      expect(data).toEqual([{ name: 'test' }]);
    });
  });

  describe('writeJSON', () => {
    test('должен записывать данные в файл', async () => {
      const testData = [{ name: 'test' }];
      await fileManager.writeJSON(testFile, testData);
      
      const content = await fs.readFile(testFile, 'utf8');
      expect(JSON.parse(content)).toEqual(testData);
    });
  });
});
```

## 🔧 Настройка тестовой среды

### Глобальная настройка

Файл `tests/setup.js` выполняется перед всеми тестами:

```javascript
// Глобальная настройка для всех тестов
process.env.NODE_ENV = 'test';

// Увеличиваем таймауты для тестов
jest.setTimeout(10000);

// Мокаем console методы, чтобы не засорять вывод тестов
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

// Восстанавливаем после всех тестов
afterAll(() => {
  console.log.mockRestore();
  console.warn.mockRestore();
  console.error.mockRestore();
});
```

### Очистка после тестов

Файл `tests/teardown.js` выполняется после всех тестов:

```javascript
module.exports = async () => {
  // Очистка после всех тестов
  console.log('\n✅ Все тесты завершены');
};
```

## 📊 Покрытие кода

Для запуска тестов с покрытием кода:

```bash
npm run test:coverage
```

Результаты будут сохранены в папке `coverage/` и доступны в HTML-формате.

### Игнорирование файлов в покрытии

В файле `jest.config.js` можно настроить исключение файлов из покрытия:

```javascript
collectCoverageFrom: [
  'core/**/*.js',
  'lib/**/*.js',
  '!**/node_modules/**',
  '!**/tests/**'
],
```

## 🎯 Лучшие практики

### 1. Изоляция тестов
Каждый тест должен быть независимым от других:

```javascript
// Плохо: зависимость от предыдущего теста
test('создать продукт', async () => {
  // создаем продукт
  const product = await service.create({ name: 'Test' });
  expect(product.id).toBeDefined();
});

test('получить продукт', async () => {
  // зависим от предыдущего теста
  const product = await service.findById(product.id);
  expect(product.name).toBe('Test');
});

// Хорошо: независимые тесты
test('создать продукт', async () => {
  const product = await service.create({ name: 'Test' });
  expect(product.id).toBeDefined();
});

test('получить продукт', async () => {
  // создаем продукт для этого теста
  const created = await service.create({ name: 'Test' });
  const product = await service.findById(created.id);
  expect(product.name).toBe('Test');
});
```

### 2. Тестирование граничных случаев
Проверяйте не только успешные сценарии:

```javascript
describe('findById', () => {
  test('должен возвращать продукт для валидного ID', async () => {
    const product = await service.findById('1');
    expect(product).toBeDefined();
  });

  test('должен возвращать null для несуществующего ID', async () => {
    const product = await service.findById('non-existent');
    expect(product).toBeNull();
  });

  test('должен обрабатывать null ID', async () => {
    await expect(service.findById(null)).rejects.toThrow();
  });
});
```

### 3. Мокирование внешних зависимостей
Используйте моки для изоляции от внешних систем:

```javascript
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn()
  }
}));

const fs = require('fs');

test('должен читать файл', async () => {
  fs.promises.readFile.mockResolvedValue('{"test": true}');
  
  const data = await fileManager.readJSON('test.json');
  expect(data).toEqual({ test: true });
});
```

### 4. Использование beforeEach/afterEach
Для подготовки и очистки данных между тестами:

```javascript
describe('Тесты сервиса', () => {
  let service;

  beforeEach(async () => {
    // Подготовка данных перед каждым тестом
    await fileManager.writeJSON('test.json', []);
    service = new Service('test.json');
  });

  afterEach(async () => {
    // Очистка после каждого теста
    await fs.unlink('test.json');
  });

  test('должен создавать элемент', async () => {
    const item = await service.create({ name: 'Test' });
    expect(item.id).toBeDefined();
  });
});
```
