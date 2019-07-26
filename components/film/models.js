const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/films', { useNewUrlParser: true })
	.then(() => console.log('database ready'))
	.catch(err => console.log(err));

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

exports.FilmModel = Film;
exports.ShortFilmProjection = ShortFilmProjection;
exports.FullFilmProjection = FullFilmProjection;
