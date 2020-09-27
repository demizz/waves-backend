const mongoose = require('mongoose');
const woodsSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'A woods must have a name'],
		unique: true,
		maxlength: 30,
	},
});
const Woods = mongoose.model('Woods', woodsSchema);
module.exports = Woods;
