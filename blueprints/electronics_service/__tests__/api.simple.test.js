describe('Electronics Service API - Простой тест', () => {
    test('сервис должен загружаться без ошибок', () => {
        expect(() => {
            require('../services/ElectricalGoodsService');
        }).not.toThrow();
    });

    test('контроллер должен загружаться без ошибок', () => {
        expect(() => {
            require('../controllers/ElectricalGoodsController');
        }).not.toThrow();
    });

    test('базовый маршрут должен быть доступен', () => {
        const fs = require('fs');
        const path = require('path');
        
        const routesPath = path.join(__dirname, '../routes/index.js');
        expect(fs.existsSync(routesPath)).toBe(true);
        
        const content = fs.readFileSync(routesPath, 'utf8');
        expect(content).toContain('api/electronics/health');
        expect(content).toContain('Router');
    });

    test('модуль должен иметь правильную структуру', () => {
        const fs = require('fs');
        const path = require('path');
        
        const modulePath = path.join(__dirname, '..');
        expect(fs.existsSync(modulePath)).toBe(true);
        expect(fs.existsSync(path.join(modulePath, 'services'))).toBe(true);
        expect(fs.existsSync(path.join(modulePath, 'controllers'))).toBe(true);
        expect(fs.existsSync(path.join(modulePath, 'routes'))).toBe(true);
        expect(fs.existsSync(path.join(modulePath, 'data'))).toBe(true);
        expect(fs.existsSync(path.join(modulePath, '__tests__'))).toBe(true);
    });
});
