const catchAsync = require('../utils/catchAsync');
const httpError = require('../utils/httpError');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary');
const User = require('../models/usersModels');
const fs = require('fs');

const Product = require('../models/productModel');
const { findById } = require('../models/usersModels');
exports.createArticle = catchAsync(async (req, res, next) => {
	const {
		sold,
		name,
		description,
		price,
		brand,
		shipping,
		available,
		wood,
		frets,
		publish,
	} = req.body;
	if (
		!name ||
		!description ||
		!price ||
		!wood ||
		!brand ||
		!available ||
		!shipping ||
		!publish ||
		!frets
	) {
		return next(new httpError('please provide all fields', 401));
	}
	const newProduct = await Product.create({
		sold,
		name,
		description,
		price,
		brand,
		shipping,
		available,
		wood,

		publish,
	});
	if (!newProduct) {
		return next(new httpError('fail to create new Brand', 400));
	}
	res.status(201).json({
		status: 'success',
		message: 'new brand has been created',
		result: newProduct,
	});
});
exports.getAllArticles = catchAsync(async (req, res, next) => {
	const allArticles = await Product.find();
	if (!allArticles) {
		return next(new httpError('fail to fetch all brands', 400));
	}
	res.status(200).json({
		status: 'success',
		message: 'all Brands found ',
		result: allArticles,
	});
});
exports.getArticleById = catchAsync(async (req, res, next) => {
	const type = req.query.type;
	const { id } = req.query;
	console.log({ type, id });
	let ids;
	let items = [];
	if (type === 'array') {
		ids = id.split(',');
		items = ids.map((item) => {
			return mongoose.Types.ObjectId(item);
		});
	}
	console.log({ ids });
	console.log({ items, type: typeof items[0] });
	const oneArticle = await Product.find({ _id: { $in: items } })
		.populate('band')
		.populate('wood');

	if (!oneArticle) {
		return next(new httpError('fail to find this articles'), 400);
	}
	res.status(200).json({
		status: 'success',
		result: oneArticle,
	});
});
exports.createAll = catchAsync(async (req, res, next) => {
	const article = JSON.parse(
		fs.readFileSync(`${__dirname}/products.json`, 'utf-8')
	);

	const articles = await Product.create(article, { validateBeforeSave: false });
	if (!articles) {
		return next(new httpError('fail to create ', 400));
	}
	next();
});
exports.search = catchAsync(async (req, res, next) => {
	let order = req.query.order ? req.query.order : 'desc';
	let sortBy = req.query.sortBy ? req.query.sortBy : '_id';
	let limit = req.query.limit ? parseInt(req.query.limit) : '100';
	const articles = await Product.find()
		.populate('band')
		.populate('wood')
		.sort([[sortBy, order]])
		.limit(limit);
	if (!articles) {
		return next(new httpError('fail to find the query search', 404));
	}
	res.status(200).json({
		status: 'success',
		size: articles.length,
		result: articles,
	});
});

exports.shop = catchAsync(async (req, res, next) => {
	console.log({ body: req.body });
	let order = req.body.order ? req.body.order : 'desc';
	let sortBy = req.body.sortBy ? req.body.sortBy : '_id';
	let limit = req.body.limit ? parseInt(req.body.limit) : '100';
	let skip = parseInt(req.body.skip);
	let findArgs = {};
	const filters = req.body.filters;
	console.log(filters);
	for (let key in filters) {
		if (filters[key].length > 0) {
			if (key === 'price') {
				findArgs[key] = {
					$gte: filters[key][0],
					$lte: filters[key][1],
				};
			} else {
				findArgs[key] = filters[key];
			}
		}
	}
	const articles = await Product.find(findArgs)
		.populate('band')
		.populate('wood')
		.sort([[sortBy, order]])
		.limit(limit)
		.skip(skip);
	if (!articles) {
		return next(new httpError('fail to find the query search', 404));
	}
	console.log(findArgs);
	res.status(200).json({
		status: 'success',
		size: articles.length,
		result: articles,
	});
});
exports.uploadImage = catchAsync(async (req, res, next) => {
	console.log(req.files.file.path);

	cloudinary.uploader.upload(
		req.files.file.path,
		(result) => {
			console.log(result);
			res.status(200).json({
				public_id: result.public_id,
				url: result.url,
			});
		},
		{
			public_id: `${Date.now()}`,
			resource_type: 'auto',
		}
	);
});
exports.addToCart = catchAsync(async (req, res, next) => {
	const { articleId } = req.params;
	console.log({ articleId });
	const { _id } = req.user;
	console.log({ _id });
	const doc = await User.findById(_id);
	if (!doc) {
		return next(new HttpError('fail to found the user', 404));
	}
	const cart = doc.cart;

	let duplicate = 0;
	cart.forEach((item) => {
		if (item.id === articleId) {
			duplicate += 1;
			item.quantity += 1;
		}
	});
	console.log({ cart });
	if (duplicate > 1) {
		console.log('yes');
		const newuser = await User.findByIdAndUpdate(
			{ _id },
			{ $inc: { 'cart.quantity': 1 } },
			{
				new: true,
				runValidators: true,
			}
		);
		if (!newuser) {
			return next(new HttpError('fail to add to cart', 400));
		}
	} else {
		console.log('no');
		const user = await User.findByIdAndUpdate(
			{ _id },
			{ $push: { cart: { id: articleId, quantity: 1, data: Date.now() } } },
			{
				new: true,
				runValidators: true,
			}
		);
		if (!user) {
			return next(new HttpError('fail to add to cart', 400));
		}
	}

	res.status(200).json({
		status: 'success',
		result: cart,
	});
});
exports.removeFromCart = catchAsync(async (req, res, next) => {
	const { articleId } = req.params;
	console.log({ articleId });
	const CurrentUserId = req.user._id;
	console.log({ CurrentUserId });
	const updatedUser = await User.findByIdAndUpdate(
		{ _id: CurrentUserId },
		{
			$pull: { cart: { id: articleId } },
		},
		{ new: true, runValidators: true }
	);

	if (!updatedUser) {
		return next(new htttpError('fail to remove from the cart', 400));
	}
	res.status(200).json({
		status: 'success',
		result: updatedUser,
	});
});
