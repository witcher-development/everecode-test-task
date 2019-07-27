const mongoose = require('mongoose');

const FilmSchema = new mongoose.Schema({
	id: {
		type: Number,
		unique: true,
		required: true
	},
	title: {
		type: String,
		required: true
	},
	overview: String,
	popularity: Number,
	vote_average: Number,
	poster_path: String,
	genres: [String],
	adult: String,
	release_date: String
});

const Film = mongoose.model('Film', FilmSchema);

const ShortFilmProjection = {
	title: 1,
	poster_path: 1,
	genres: 1,
};

const FullFilmProjection = {
	id: 0
};

// const kitty = new Cat({ name: 'Zildjian' });
// kitty.save().then(() => console.log('meow'));

exports.FilmSchema = FilmSchema;
exports.FilmModel = Film;
exports.ShortFilmProjection = ShortFilmProjection;
exports.FullFilmProjection = FullFilmProjection;
