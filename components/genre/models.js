const mongoose = require('mongoose');

const GenreSchema = new mongoose.Schema({
	id: {
		type: Number,
		unique: true,
		required: true
	},
	name: {
		type: String,
		unique: true,
		required: true
	},
	vote_average: Number,
	update_date: String
});

const Genre = mongoose.model('Genre', GenreSchema);

const ShortGenreProjection = {
	name: 1,
};

const FullGenreProjection = {
	id: 0
};

exports.GenreSchema = GenreSchema;
exports.GenreModel = Genre;
exports.ShortGenreProjection = ShortGenreProjection;
exports.FullGenreProjection = FullGenreProjection;
