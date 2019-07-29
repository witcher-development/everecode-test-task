const axios = require('axios');
const { GenreModel, ShortGenreProjection } = require('./models');
const {	globalErrorHandler } = require('../../utils/helpers');
const { api_url, api_key } = require('../../utils/constans');

exports.getGenresController = async (req, res, next) => {
	try {

		console.log(api_key, api_url);

		let genres = await GenreModel.find().select(ShortGenreProjection);

		res.status(200).send({ data: genres });
	} catch (e) {
		res.status(500).send(e.message);
		await globalErrorHandler(e);
	}
};

exports.updateController = async (req, res, next) => {
	try {

		let genresRes = await axios.get(`${api_url}/genre/movie/list?api_key=${api_key}&language=en-US`);
		let genres = genresRes.data.genres;

		let totalAdded = 0;

		for (let genre of genres) {
			try {
				await GenreModel.create(genre);
				totalAdded++;
			} catch (e) {
				// console.log(e);
			}
		}

		// res.send(filmsRes.data.films);
		res.status(200).send({ data: totalAdded });

	} catch (e) {
		res.status(500).send(e.message);
		await globalErrorHandler(e);
	}
};
