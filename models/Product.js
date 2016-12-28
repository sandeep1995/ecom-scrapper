var mongoose = require('mongoose');

var productPriceSchema = new mongoose.Schema({
	name: String,
	pid: String,
	url: String,
	price: Number,
	img: String,
	merchant: String,
	suggestions: {
		flipkart: [String],
		amazon: [String],
		snapdeal: [String]
	},
	timestamp: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('ProductPrice', productPriceSchema);
