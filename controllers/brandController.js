const Brand = require('../models/brandModel');
const catchAsync = require('../utils/catchAsync');
const httpError = require('../utils/httpError');
exports.createBrand = catchAsync(async (req, res, next) => {
	const { name } = req.body;
	if (!name) {
		return next(new httpError('please provide the name', 401));
	}
	const newBrand = await Brand.create({ name });
	if (!newBrand) {
		return next(new httpError('fail to create new Brand', 400));
	}
	res.status(201).json({
		status: 'success',
		message: 'new brand has been created',
		result: newBrand,
	});
});
exports.getAllBrands = catchAsync(async (req, res, next) => {
	const allBrands = await Brand.find();
	if (!allBrands) {
		return next(new httpError('fail to fetch all brands', 400));
	}
	res.status(200).json({
		status: 'success',
		message: 'all Brands found ',
		result: allBrands,
	});
});
