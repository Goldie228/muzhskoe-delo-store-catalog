
const { Router } = require('express');

const electricalGoodsRoutes = require('./electrical_goods.routes');
const manufacturersRoutes = require('./manufacturers.routes');
const ordersRoutes = require('./orders.routes');

const router = Router();

router.use('/api/electronics', electricalGoodsRoutes);
router.use('/api/electronics', manufacturersRoutes);
router.use('/api/electronics', ordersRoutes);

router.get('/api/electronics/health', (req, res) => {
    res.json({
        success: true,
        message: 'Модуль электротехники работает корректно',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

router.get('/api/electronics/info', (req, res) => {
    res.json({
        module: 'electronics_service',
        description: 'Модуль для управления каталогом электротехнических товаров',
        version: '1.0.0',
        endpoints: [
            '/api/electronics/goods - Управление товарами',
            '/api/electronics/manufacturers - Управление производителями',
            '/api/electronics/orders - Управление заказами',
            '/api/electronics/health - Проверка работоспособности',
            '/api/electronics/info - Информация о модуле'
        ]
    });
});

module.exports = router;