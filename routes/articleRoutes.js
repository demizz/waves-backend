const express = require('express');
const authController = require('../controllers/authController');
const articleController = require('../controllers/articleController');
const formidable = require('express-formidable');

const router = express.Router();

router.route('/shop').post(articleController.shop);
router.route('/getAllArticles').get(articleController.getAllArticles);
router.route('/articles-by-id').get(articleController.getArticleById);
router.route('/search').get(articleController.search);

router.use(authController.auth);
router.route('/:articleId/addToCart').patch(articleController.addToCart);
router
	.route('/:articleId/removeFromCart')
	.patch(articleController.removeFromCart);

router.use(authController.restrictTo);
router.route('/createArticle').post(articleController.createArticle);
router.use(formidable());
router.route('/uploadImage').post(articleController.uploadImage);

module.exports = router;
