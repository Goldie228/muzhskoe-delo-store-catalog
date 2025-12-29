
const fs = require('fs');
const { FileManager } = require('../lib/fileManager');

// Мок должен быть объявлен до require('fs'), но jest.mock поднимает его (hoisting) автоматически.
// Главное — правильно описать структуру promises.
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
    rename: jest.fn(),
    unlink: jest.fn(),
  }
}));

describe('FileManager', () => {
  let fileManager;
  
  // Ссылки на моки для удобства в тестах
  let mockMkdir, mockReadFile, mockWriteFile, mockRename, mockUnlink;
  const tempDir = '/tmp/test-fs';

  beforeEach(() => {
    // Получаем мокнутые функции
    mockMkdir = fs.promises.mkdir;
    mockReadFile = fs.promises.readFile;
    mockWriteFile = fs.promises.writeFile;
    mockRename = fs.promises.rename;
    mockUnlink = fs.promises.unlink;
    
    fileManager = new FileManager(tempDir);
    jest.clearAllMocks();
  });

  describe('readJSON', () => {
    test('должен возвращать пустой массив, если файл не существует', async () => {
      mockReadFile.mockRejectedValue({ code: 'ENOENT' });
      const data = await fileManager.readJSON('test.json');
      expect(data).toEqual([]);
    });

    test('должен парсить корректный JSON', async () => {
      const mockData = [{ id: 1, name: 'Test' }];
      mockReadFile.mockResolvedValue(JSON.stringify(mockData));
      const data = await fileManager.readJSON('test.json');
      expect(data).toEqual(mockData);
    });

    test('должен выбрасывать ошибку, если JSON не массив', async () => {
      mockReadFile.mockResolvedValue('{"not": "an array"}');
      await expect(fileManager.readJSON('test.json')).rejects.toThrow('не является массивом');
    });
  });

  describe('writeJSON', () => {
    test('должен успешно записывать данные', async () => {
      mockMkdir.mockResolvedValue();
      mockWriteFile.mockResolvedValue();
      mockRename.mockResolvedValue();

      const data = [{ id: 1 }];
      await fileManager.writeJSON('test.json', data);

      expect(mockMkdir).toHaveBeenCalled();
      expect(mockWriteFile).toHaveBeenCalled();
      expect(mockRename).toHaveBeenCalled();
    });

    test('должен генерировать уникальный временный файл', async () => {
      mockMkdir.mockResolvedValue();
      mockWriteFile.mockResolvedValue();
      mockRename.mockResolvedValue();

      await fileManager.writeJSON('test.json', []);

      const writeFileArg = mockWriteFile.mock.calls[0][0];
      expect(writeFileArg).toMatch(/\.tmp-\d+-\d+$/);
    });

    test('КРИТИЧНО: должен удалять временный файл при ошибке rename', async () => {
      mockMkdir.mockResolvedValue();
      mockWriteFile.mockResolvedValue();
      // Симулируем ошибку при переименовании (например, разные диски)
      mockRename.mockRejectedValue(new Error('Cross-device link'));
      mockUnlink.mockResolvedValue();

      const data = [{ id: 1 }];
      
      await expect(fileManager.writeJSON('test.json', data)).rejects.toThrow();

      // Проверяем, что несмотря на ошибку, unlink был вызван для очистки
      expect(mockUnlink).toHaveBeenCalled();
    });

    test('должен игнорировать ошибку при удалении временного файла', async () => {
      mockMkdir.mockResolvedValue();
      mockWriteFile.mockResolvedValue();
      mockRename.mockRejectedValue(new Error('Rename failed'));
      mockUnlink.mockRejectedValue(new Error('Unlink failed'));

      await expect(fileManager.writeJSON('test.json', [])).rejects.toThrow('Rename failed');
      // Ошибка не пробрасывается, тест проходит успешно
    });
  });

  describe('create', () => {
    test('должен генерировать ID и метаданные времени', async () => {
      mockReadFile.mockResolvedValue('[]');
      mockWriteFile.mockResolvedValue();
      mockRename.mockResolvedValue();
      mockMkdir.mockResolvedValue();

      const item = await fileManager.create('test.json', { name: 'Item' });

      expect(item.id).toBeDefined();
      expect(item.createdAt).toBeDefined();
      expect(item.updatedAt).toBeDefined();
      expect(item.name).toBe('Item');
    });
  });

  describe('update', () => {
    test('должен обновлять updatedAt', async () => {
      const existingData = [{ id: '1', name: 'Old', createdAt: '2024-01-01' }];
      mockReadFile.mockResolvedValue(JSON.stringify(existingData));
      mockWriteFile.mockResolvedValue();
      mockRename.mockResolvedValue();
      mockMkdir.mockResolvedValue();

      const updated = await fileManager.update('test.json', '1', { name: 'New' });

      expect(updated.name).toBe('New');
      expect(updated.createdAt).toBe('2024-01-01'); // createdAt не должен меняться
      expect(updated.updatedAt).not.toBe('2024-01-01');
    });
  });

  describe('delete', () => {
    test('должен возвращать false, если элемент не найден', async () => {
      mockReadFile.mockResolvedValue('[]');
      const result = await fileManager.delete('test.json', '1');
      expect(result).toBe(false);
    });
  });
});
