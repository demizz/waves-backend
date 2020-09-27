const express = require('express');
const authController = require('../controllers/authController');
const woodsController = require('../controllers/woodsController');
const router = express.Router();
router.use(authController.auth);
router.route('/getAllWoods').get(woodsController.getAllWoods);
router.use(authController.restrictTo);
router.route('/createWood').post(woodsController.createWood);
module.exports = router;
