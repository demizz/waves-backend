const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'A product must have a name'],
		unique: true,
		maxlength: 30,
	},
	description: {
		type: String,
		required: [true, 'A product must have a description'],
		maxlength: [300, 'A description must be less then 300 characters'],
	},
	price: {
		type: Number,
		required: [true, 'A product must have a price'],
		maxlength: 266,
	},
	brand: {
		type: mongoose.Schema.ObjectId,
		ref: 'Brand',
		required: [true, 'A product must have a brand'],
	},
	shipping: {
		type: Boolean,
		required: [true, 'A product must have a shipping'],
	},
	frets: {
		type: Number,
	},
	available: {
		type: Boolean,
		required: [true, 'a product must be availale or not'],
	},
	wood: {
		type: mongoose.Schema.ObjectId,
		ref: 'Woods',
		required: [true, 'A product must have a woods'],
	},
	sold: {
		type: Number,
		maxlength: 100,
	},
	publish: {
		type: Boolean,
		required: [true, 'a product must have a publish'],
	},
	images: {
		type: Array,
		default: [],
	},
});
const Product = mongoose.model('Product', productSchema);
module.exports = Product;
