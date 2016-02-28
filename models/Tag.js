var mongoose = require('mongoose');

var tagSchema = new mongoose.Schema({
	text: String,
	size: Number
})

var Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;