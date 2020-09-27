const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/currentUser').get(authController.currentUser);
router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.use(authController.auth);

router.route('/logout').get(authController.logout);
router.use(authController.restrictTo);

router.route('/auth').get(authController.try);

module.exports = router;
