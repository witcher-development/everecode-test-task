const uuid = require('uuid');
const axios = require('axios');
const { GenreModel } = require('./models');
const {
	globalErrorHandler,
	delay,
	invalidType
} = require('../../utils/helpers');
const { api_url, api_key } = require('../../utils/constans');

let backgroundProcesses = [];

class bgProcess {
	constructor(genreId) {
		this.id = uuid();

		this.genreId = genreId;
		this.progress = 0;
		this.result = this.calculate();
	}

	async calculate() {
		try {
			const pages = 50;
			const progressPerPage = 100 / pages;

			let summaryVote = 0;
			let summaryFilms = 0;

			for (let i = 1; i <= pages; i++) {

				let filmsRes = await axios.get(`${api_url}/movie/top_rated?api_key=${api_key}&page=${i}&language=en-US`);
				let films = filmsRes.data.results;

				if (films.length) {
					films = films.filter(f => f.genre_ids.indexOf(this.genreId) > -1);
				} else {
					this.progress = 99;
					break;
				}

				films.forEach(f => {
					summaryVote += +f.vote_average;
					summaryFilms++;
				});

				this.progress = i * progressPerPage;
			}

			let result = Math.round((summaryVote / summaryFilms) * 100) / 100;
			await GenreModel.updateOne({ id: this.genreId }, { $set: { 'vote_average': result } });
			await GenreModel.updateOne({ id: this.genreId }, { $set: { 'update_date': Date.now() } });
			backgroundProcesses = backgroundProcesses.filter(p => p.id !== this.id);
			return result;
		} catch (e) {
		  console.log(e);
		}
	};

	get getResult() {

		if (this.result.done) {
			return this.result;
		} else {
			return this.progress;
		}
	}
}

const processesMiddleware = (genreId) => {
	if (backgroundProcesses.length) {
		for(let p of backgroundProcesses) {

			if (p.genreId === genreId) {
				return p.getResult;
			}

		}
	}

	const newProcess = new bgProcess(genreId);
	backgroundProcesses.push(newProcess);

	return newProcess.getResult;
};

exports.statisticController = async (req, res, next) => {
	try {

		const { genre: genreQuery } = req.params;

		if (invalidType(genreQuery, 'string', true)) {
			throw new Error('Please specify the genre');
		}

		let genre = await GenreModel.findOne({ name: genreQuery });

		if (genre === null) {
			throw new Error('Genre was not found');
		}

		const toSec = 1000;
		let isFresh = true;
		let isFirstTime = false;

		if (genre.update_date) {
			const now = Date.now();
			let differenceInMilli = now - genre.update_date;
			let differenceInSec = differenceInMilli / toSec;

			if (differenceInSec > 60) {
				isFresh = false;
			}

		} else {
			isFirstTime = true;
			await GenreModel.updateOne({ name: genre.name }, { $set: { 'update_date': Date.now() } });
		}

		let result;

		if (isFirstTime || !isFresh) {
			let progress = processesMiddleware(genre.id, GenreModel);
			result = {
				progress,
				vote: null,
			};
			res.status(202).send({ data: result });
		} else {
			result = {
				progress: 100,
				vote: genre.vote_average
			};
			res.status(200).send({ data: result });
		}

	} catch (e) {

		let status = 500;

		if (e.message === 'Please specify the genre') {
			status = 400;
		} else if (e.message === 'Genre was not found') {
			status = 404;
		}

		res.status(status).send(e.message);
		await globalErrorHandler(e);
	}
};
