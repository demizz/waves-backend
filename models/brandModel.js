const mongoose = require('mongoose');
const brandSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'A Brand must have a name'],
		unique: true,
		maxlength: 30,
	},
});
const Brand = mongoose.model('Brand', brandSchema);
module.exports = Brand;
