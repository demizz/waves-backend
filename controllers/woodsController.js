const catchAsync = require('../utils/catchAsync');
const Woods = require('../models/woodsModel');
const httpError = require('../utils/httpError');
exports.createWood = catchAsync(async (req, res, next) => {
	const { name } = req.body;
	if (!name) {
		return next(new httpError('please provide the name', 401));
	}
	const newWood = await Woods.create({ name });
	if (!newWood) {
		return next(new httpError('fail to create new Wood', 400));
	}
	res.status(201).json({
		status: 'success',
		message: 'new brand has been created',
		result: newWood,
	});
});
exports.getAllWoods = catchAsync(async (req, res, next) => {
	const allWoods = await Woods.find();
	if (!allWoods) {
		return next(new httpError('fail to fetch all brands', 400));
	}
	res.status(200).json({
		status: 'success',
		message: 'all Brands found ',
		result: allWoods,
	});
});
