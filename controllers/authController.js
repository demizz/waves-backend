const User = require('../models/usersModels.js');
const catchAsync = require('../utils/catchAsync');
const httpError = require('../utils/httpError');
const jwt = require('jsonwebtoken');
exports.signup = catchAsync(async (req, res, next) => {
	const { name, lastName, email, password, confirmPassword, role } = req.body;
	console.log(req.body);
	const doc = await User.findOne({ email });
	if (doc) {
		return next(
			new httpError('This user is already registred try to login', 400)
		);
	}
	const newUser = await User.create({
		name,
		lastName,
		email,
		password,
		confirmPassword,
		role,
	});
	if (!newUser) {
		return next(new httpError('fail to create new User', 400));
	}
	res.status(201).json({
		status: 'success',
		message: 'new user has been created',
		result: newUser,
	});
});
exports.login = catchAsync(async (req, res, next) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return next(new httpError('please provide the required fields', 400));
	}
	const user = await User.findOne({ email });
	if (!user) {
		return next(new httpError('email or password are rong', 400));
	}

	const comparePassword = await user.comparePassword(password, user.password);

	if (!comparePassword) {
		return next(new httpError('email or password are rong', 401));
	}
	const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRESIN,
	});
	console.log(token);
	res.cookie('jwt', token, {
		expires: new Date(
			Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000
		),
	});
	user.token = token;
	user.save(function (err) {
		if (err) {
			return next(new httpError('fail to save the token', 401));
		}
	});
	res.status(200).json({
		status: 'success',
		result: user,
		token,
	});
});
exports.auth = catchAsync(async (req, res, next) => {
	let token;
	if (
		req.headers.authentication &&
		req.headers.authentication.startsWith('Bearer ')
	) {
		token = req.headers.authentication.split(' ')[1];
	} else if (req.cookies.jwt) {
		token = req.cookies.jwt;
	}
	if (!token) {
		return next(
			new httpError('you are not logged in please try to login', 401)
		);
	}
	const { id } = await jwt.verify(token, process.env.JWT_SECRET);
	const user = await User.findById(id);
	console.log({ id, user });
	if (!user) {
		return next(new httpError('the token is not valid ', 401));
	}
	console.log({ user });
	req.user = user;
	next();
});
exports.currentUser = catchAsync(async (req, res, next) => {
	let token;
	if (
		req.headers.authentication &&
		req.headers.authentication.startsWith('Bearer ')
	) {
		token = req.headers.authentication.split(' ')[1];
	} else if (req.cookies.jwt) {
		token = req.cookies.jwt;
	}
	if (!token) {
		return res.status(200).json({
			status: 'success',
			result: {
				isLoggedIn: false,
				data: null,
			},
		});
	}

	const { id } = await jwt.verify(token, process.env.JWT_SECRET);
	const user = await User.findById(id);
	console.log({ id, user });
	if (!user) {
		return res.status(200).json({
			status: 'success',
			result: {
				isLoggedIn: false,
				data: null,
			},
		});
	}
	res.status(200).json({
		status: 'success',
		result: {
			isLoggedIn: true,
			data: {
				isAdmin: user.role === 'admin' ? true : false,

				email: user.email,
				name: user.name,
				lastName: user.lastName,
				role: user.role,
				cart: user.cart,
				history: user.history,
			},
		},
	});
});
exports.restrictTo = catchAsync(async (req, res, next) => {
	const userId = req.user._id;

	const doc = await User.findById(userId);
	if (!doc) {
		return next(new httpError('user not found', 401));
	}
	if (doc.role.toLowerCase() !== 'admin') {
		return next(new httpError('this route is only for admin', 401));
	}
	next();
});
exports.logout = catchAsync(async (req, res, next) => {
	const userId = req.user._id;
	const doc = await User.findByIdAndUpdate(
		{ _id: userId },
		{
			token: '',
		},
		{
			runValidators: false,
		}
	);
	if (!doc) {
		return next(new httpError('fail to logout', 401));
	}
	res.cookie('jwt', 'logout out', {
		expires: new Date(Date.now() + 10 * 1000),
	});
	res.status(200).json({
		status: 'success',
		result: doc,
	});
});
exports.try = (req, res, next) => {
	res.status(200).json({
		message: 'logged in',
	});
};
