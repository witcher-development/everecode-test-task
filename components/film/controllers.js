const axios = require('axios');
const { FilmModel, ShortFilmProjection, FullFilmProjection } = require('./models');
const {
	allSpecifiedGenresInDocumentFilter,
	globalErrorHandler,
	invalidType
} = require('../../utils/helpers');
const { api_url, api_key } = require('../../utils/constans');

exports.countController = async (req, res, next) => {
	try {

		const genresFilter = allSpecifiedGenresInDocumentFilter(req.query.genres);

		const count = await FilmModel.find(genresFilter).count();
		res.status(200).send({ data: count });
	} catch (e) {
		res.status(500).send(e.message);
		await globalErrorHandler(e);
	}
};

exports.updateController = async (req, res, next) => {
	try {

		let pages = 20;

		let genresRes = await axios.get(`${api_url}/genre/movie/list?api_key=${api_key}&language=en-US`);
		let genres = [];
		genresRes.data.genres.forEach(g => {
			genres[g.id] = g.name;
		});

		let totalAdded = 0;

		for (let i = 1; i <= pages; i++) {
			let filmsRes = await axios.get(`${api_url}/movie/top_rated?api_key=${api_key}&page=${i}&language=en-US`);
			let films = filmsRes.data.results.map(f => {
				f.genres = f.genre_ids.map(g => genres[g]);
				return f;
			});

			for (let film of films) {
				try {
					await FilmModel.create(film);
					totalAdded++;
				} catch (e) {
					// console.log(e);
				}
			}

		}

		// res.send(filmsRes.data.films);
		res.status(200).send({ data: totalAdded });

	} catch (e) {
		res.status(500).send(e.message);
		await globalErrorHandler(e);
	}
};

exports.getFilmsController = async (req, res, next) => {
	try{

		const {
			page: pageQuery,
			sort: sortQuery,
			genres
		} = req.query;

		if (invalidType(pageQuery, 'number') || invalidType(sortQuery, 'number') || invalidType(genres, 'string')) {
			throw new Error('Invalid parameter type');
		}

		const perPage = 10;

		const to = (pageQuery || 1) * 10;
		const from = to - perPage;

		const genresFilter = allSpecifiedGenresInDocumentFilter(genres);

		const sort = sortQuery ? { title: sortQuery } : {};

		const result = await FilmModel
			.find(genresFilter)
			.select(ShortFilmProjection)
			.sort(sort)
			.skip(from).limit(perPage);

		if (!result.length) {
			throw new Error('No films found');
		}

		res.status(200).send({ data: result });
	} catch (e) {

		let status = 500;

		if (e.message === 'Invalid parameter type') {
			status = 400;
		} else if (e.message === 'No films found') {
			status = 404;
		}

		res.status(status).send(e.message);
		await globalErrorHandler(e);
	}
};

exports.getFilmController = async (req, res, next) => {
	try {

		const id = req.params.id;
		const film = await FilmModel.findById(id).select(FullFilmProjection);

		if (film === null) {
			throw new Error('Film with specified ID was not found');
		}

		res.status(200).send({ data: film })
	} catch (e) {

		if (e.name === 'CastError' && e.kind === 'ObjectId') {
			res.status(400).send('Please send ID in the ObjectId format');
		} else if (e.message === 'Film with specified ID was not found') {
			res.status(404).send(e.message);
		} else {
			res.status(500).send(e.message);
		}

		await globalErrorHandler(e);
	}
};
