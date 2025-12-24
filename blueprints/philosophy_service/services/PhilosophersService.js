const { fileManager } = require('../../../lib/fileManager');

class PhilosophersService {
  constructor() {
    this.dataFile = 'blueprints/philosophy_service/data/philosophers.json';
  }

  // Получить всех философов
  async findAll() {
    return await fileManager.readJSON(this.dataFile);
  }

  // Найти философа по ID
  async findById(id) {
    return await fileManager.findById(this.dataFile, id);
  }

  // Создать нового философа
  async create(philosopherData) {
    if (!philosopherData.name || !philosopherData.birthYear) {
      throw new Error('Имя и год рождения обязательны');
    }

    return await fileManager.create(this.dataFile, philosopherData);
  }

  // Обновить философа
  async update(id, updateData) {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    return await fileManager.update(this.dataFile, id, updateData);
  }

  // Удалить философа
  async delete(id) {
    return await fileManager.delete(this.dataFile, id);
  }
  
  // Дополнительный метод: поиск по школе
  async findBySchool(schoolName) {
    const philosophers = await this.findAll();
    return philosophers.filter(phil => 
      phil.schools && phil.schools.includes(schoolName)
    );
  }
}

module.exports = PhilosophersService;