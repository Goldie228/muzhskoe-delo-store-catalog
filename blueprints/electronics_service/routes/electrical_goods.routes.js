
const { Router } = require('express');
const ElectricalGoodsController = require('../controllers/ElectricalGoodsController');

const router = Router();
const controller = new ElectricalGoodsController();

router.get('/goods', controller.getAllGoods.bind(controller));
router.get('/goods/:id', controller.getGoodById.bind(controller));
router.post('/goods', controller.createGood.bind(controller));
router.put('/goods/:id', controller.updateGood.bind(controller));
router.delete('/goods/:id', controller.deleteGood.bind(controller));

router.get('/goods/category/:category', controller.getGoodsByCategory.bind(controller));
router.get('/goods/instock', controller.getInStockGoods.bind(controller));

module.exports = router;