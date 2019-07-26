const axios = require('axios');
const { FilmModel, ShortFilmProjection, FullFilmProjection } = require('./models');
const {
	allSpecifiedGenresInDocumentFilter
} = require('../../utils/helpers');
const {
	calculateGenreStatistic
} = require('../../utils/genreStatistic');

exports.countController = async (req, res, next) => {
	try {

		const genresFilter = allSpecifiedGenresInDocumentFilter(req.query.genres);

		const count = await FilmModel.find(genresFilter).count();
		res.status(200).send({ data: count });
	} catch (e) {
		res.status(500).send(e.message);
	}
};

exports.updateController = async (req, res, next) => {
	try {

		const url = 'https://api.themoviedb.org/3';
		const api_key = 'cb4abcaa383d8dcc239745f0cbf9f7da';
		let pages = 20;

		let genresRes = await axios.get(`${url}/genre/movie/list?api_key=${api_key}&language=en-US`);
		let genres = [];
		genresRes.data.genres.forEach(g => {
			genres[g.id] = g.name;
		});

		let totalAdded = 0;

		for (let i = 1; i <= pages; i++) {
			let filmsRes = await axios.get(`${url}/movie/top_rated?api_key=${api_key}&page=${i}&language=en-US`);
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
	}
};

exports.statisticController = async (req, res, next) => {
	try {

		// res.write('Request is handling...');
		const genre = req.query.genre;

		const result = await calculateGenreStatistic(genre, FilmModel, res);

		res.write(JSON.stringify({ data: result }));
		res.end();
	} catch (e) {
		res.status(500).send(e.message);
	}
};

exports.getFilmsController = async (req, res, next) => {
	try{

		const perPage = 10;

		const pageQuery = +req.query.page;
		const to = (pageQuery || 1) * 10;
		const from = to - perPage;

		const genresFilter = allSpecifiedGenresInDocumentFilter(req.query.genres);

		const sortQuery = +req.query.sort;
		const sort = sortQuery ? { title: sortQuery } : {};

		const result = await FilmModel
			.find(genresFilter)
			.select(ShortFilmProjection)
			.sort(sort)
			.skip(from).limit(perPage);

		res.status(200).send({ data: result });
	} catch (e) {
		res.status(500).send(e.message);
	}
};

exports.getFilmController = async (req, res, next) => {
	try {

		const id = req.params.id;
		const film = await FilmModel.findById(id).select(FullFilmProjection);

		res.status(200).send({ data: film })
	} catch (e) {
		res.status(500).send(e.message);
	}
};
