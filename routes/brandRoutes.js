const express = require('express');
const authController = require('../controllers/authController');
const brandController = require('../controllers/brandController');

const router = express.Router();
router.use(authController.auth);
router.route('/allBrands').get(brandController.getAllBrands);

router.use(authController.restrictTo);
router.route('/create-brand').post(brandController.createBrand);
module.exports = router;
