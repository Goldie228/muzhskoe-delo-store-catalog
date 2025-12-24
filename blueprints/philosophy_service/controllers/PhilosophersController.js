const PhilosophersService = require('../services/PhilosophersService');
const { createError } = require('../../../core/middleware/errorHandler');

class PhilosophersController {
  constructor() {
    this.service = new PhilosophersService();
  }

  async getAll(req, res, next) {
    try {
      const philosophers = await this.service.findAll();
      res.json({
        success: true,
        data: philosophers,
        total: philosophers.length
      });
    } catch (error) {
      return next(createError(500, 'Не удалось получить философов', error));
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const philosopher = await this.service.findById(id);
      
      if (!philosopher) {
        return next(createError(404, 'Философ не найден'));
      }
      
      res.json({
        success: true,
        data: philosopher
      });
    } catch (error) {
      return next(createError(500, 'Не удалось получить философа', error));
    }
  }

  async create(req, res, next) {
    try {
      const philosopherData = req.body;
      
      if (!philosopherData.name || !philosopherData.birthYear) {
        return next(createError(400, 'Имя и год рождения обязательны'));
      }
      
      const newPhilosopher = await this.service.create(philosopherData);
      
      res.status(201).json({
        success: true,
        data: newPhilosopher,
        message: 'Философ успешно добавлен'
      });
    } catch (error) {
      return next(createError(500, 'Не удалось создать философа', error));
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const updatedPhilosopher = await this.service.update(id, updateData);
      
      if (!updatedPhilosopher) {
        return next(createError(404, 'Философ не найден'));
      }
      
      res.json({
        success: true,
        data: updatedPhilosopher,
        message: 'Философ успешно обновлен'
      });
    } catch (error) {
      return next(createError(500, 'Не удалось обновить философа', error));
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      
      const deleted = await this.service.delete(id);
      
      if (!deleted) {
        return next(createError(404, 'Философ не найден'));
      }
      
      res.json({
        success: true,
        message: 'Философ успешно удален'
      });
    } catch (error) {
      return next(createError(500, 'Не удалось удалить философа', error));
    }
  }
  
  async findBySchool(req, res, next) {
    try {
      const { school } = req.params;
      const philosophers = await this.service.findBySchool(school);
      
      res.json({
        success: true,
        data: philosophers,
        total: philosophers.length,
        school: school
      });
    } catch (error) {
      return next(createError(500, 'Не удалось найти философов', error));
    }
  }
}

module.exports = PhilosophersController;