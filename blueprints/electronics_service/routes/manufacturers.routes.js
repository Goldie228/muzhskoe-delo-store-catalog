
const { Router } = require('express');
const ManufacturersController = require('../controllers/ManufacturersController');

const router = Router();
const controller = new ManufacturersController();

router.get('/manufacturers', controller.getAllManufacturers.bind(controller));
router.get('/manufacturers/:id', controller.getManufacturerById.bind(controller));
router.post('/manufacturers', controller.createManufacturer.bind(controller));
router.put('/manufacturers/:id', controller.updateManufacturer.bind(controller));
router.delete('/manufacturers/:id', controller.deleteManufacturer.bind(controller));

router.get('/manufacturers/country/:country', controller.getManufacturersByCountry.bind(controller));
router.get('/manufacturers/certified', controller.getCertifiedManufacturers.bind(controller));

module.exports = router;