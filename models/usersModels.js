const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: [true, 'please enter the Email'],
		trim: true,
		unique: true,
		validate: [validator.isEmail, 'please Enter A Valid Email'],
	},
	password: {
		type: String,
		required: [true, 'password is required'],
		minlength: 5,
	},
	confirmPassword: {
		type: String,
		required: [true, 'confirm password is required'],
		minlength: 5,
		validate: {
			validator: function (el) {
				return el === this.password;
			},
			message: 'the confirm password is incorrect',
		},
	},
	name: {
		type: String,
		required: [true, 'name is required'],
		maxlength: 50,
	},
	lastName: {
		type: String,
		required: [true, 'lastName is required'],
		maxlength: 50,
	},
	cart: {
		type: Array,
		default: [],
	},
	history: {
		type: Array,
		default: [],
	},
	role: {
		type: String,
		enum: ['user', 'admin'],
		default: 'user',
	},
	token: {
		type: String,
	},
});
userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();
	this.password = await bcrypt.hash(this.password, 12);

	this.confirmPassword = undefined;
	next();
});
userSchema.methods.comparePassword = async function (
	userPassword,
	databasePassword
) {
	const compare = await bcrypt.compare(userPassword, databasePassword);

	return compare;
};
const User = mongoose.model('User', userSchema);
module.exports = User;
