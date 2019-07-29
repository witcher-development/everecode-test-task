const mongoose = require('mongoose');
const axios = require('axios');
const { assert } = require('chai');

const { FilmSchema } = require('./models');
const { allSpecifiedGenresInDocumentFilter, invalidType } = require('../../utils/helpers');

mongoose.set('useCreateIndex', true);

describe('DB and models', () => {

	let FilmTestModel;

	before('Connecting to DB', async () => {
		try {
			await mongoose.connect('mongodb://localhost:27017/films', { useNewUrlParser: true });
			FilmTestModel = mongoose.model('Film_test', FilmSchema);
		} catch (e) {
			assert.fail(e);
		}
	});

	after('Close connection to DB', () => {
		mongoose.connection.close();
	});

	beforeEach('Clear collection', async () => {
		try {
			await FilmTestModel.deleteMany({});
			let films = await FilmTestModel.find();

			assert.equal(films.length, 0, 'Test collection cleared');
		} catch (e) {
			assert.fail(e);
		}
	});

	it('Connection to DB', () => {
		assert.equal(mongoose.connection.readyState, 1)
	});

	it('Save film document to test collection', (done) => {
		const newFilm = {
			id: 1,
			title: 'Test film',
			overview: 'Description',
			popularity: 5,
			vote_average: 5,
			poster_path: 'path',
			genres: ['Drama'],
			adult: false,
			release_date: '10-10-10',
		};

		let film = new FilmTestModel(newFilm);
		assert.equal(film.isNew, true);

		film.save((err, data) => {
			if (err) {
				assert.fail(err);
			}

			done();
		})
	})

});

describe('API response status and headers. All should return status 200 and headers "application/json; charset=utf-8"', () => {

	const url = 'http://localhost:3000/films';

	it('/films endpoint', async () => {
		try {
			let films = await axios.get(url);

			assert.equal(films.status, 200);
			assert.equal(films.headers['content-type'], 'application/json; charset=utf-8');
		} catch (e) {
			assert.fail(e);
		}
	});

	it('/films with params', async () => {
		try {
			let films = await axios.get(url + '?page=2&genre=Drama');

			assert.equal(films.status, 200);
			assert.equal(films.headers['content-type'], 'application/json; charset=utf-8');
		} catch (e) {
			assert.fail(e);
		}
	});

	it('/films/:id endpoint if there is at least one film', async () => {
		try {
			let films = await axios.get(url);
			films = films.data.data;

			if (films.length) {
				let id = films[0]._id;
				let film = await axios.get(url + '/' + id);

				assert.equal(film.status, 200);
				assert.equal(film.headers['content-type'], 'application/json; charset=utf-8');
			}

		} catch (e) {
			assert.fail(e);
		}
	});

	it('/films/count endpoint', async () => {
		try {
			let count = await axios.get(url + '/count');

			assert.equal(count.status, 200);
			assert.equal(count.headers['content-type'], 'application/json; charset=utf-8');
		} catch (e) {
			assert.fail(e);
		}
	});

});

describe('Helpers testing', () => {

	it('Should create right query structure from genres string', () => {
		const genresString = 'Drama,Adventure';
		const expectedQuery = {
			$and: [
				{
					genres: { $eq: 'Drama' }
				},
				{
					genres: { $eq: 'Adventure' }
				}
			]
		};

		let query = allSpecifiedGenresInDocumentFilter(genresString);

		assert.deepEqual(query, expectedQuery);
	});

	it('invalidType helper should return true when argument is not valid', () => {

		assert(!invalidType('argument', 'string'));
		assert(invalidType('argument', 'number'));
		assert(!invalidType(undefined, 'string')); // because is not required

		assert(!invalidType('argument', 'string', true));
		assert(invalidType('argument', 'number', true));
		assert(invalidType(undefined, 'string', true));

	});
});

describe('API data and structure', () => {

	const url = 'http://localhost:3000/films';

	it('/films endpoint, return array which have right length (10 - one page)', async () => {
		try {
			let films = await axios.get(url);
			films = films.data.data;

			assert(films.length >= 0);
			assert(films.length <= 10);
		} catch (e) {
			assert.fail(e);
		}
	});

	it('all documents of /films endpoint with specified genre should contains it', async () => {
		try {
			const genre = 'Crime';
			let films = await axios.get(url + '?genres=' + genre);
			films = films.data.data;

			if (films.length) {
				films.forEach(f => {
					assert(f.genres.indexOf(genre) > -1)
				});
			}
		} catch (e) {
		  assert.fail(e);
		}
	});

	it('data from /films projection test', async () => {
		try {
			let films = await axios.get(url);
			films = films.data.data;

			if (films.length) {
				films.forEach(f => {
					assert.exists(f._id);
					assert.exists(f.title);
					assert.exists(f.poster_path);
					assert.exists(f.genres);

					assert.notExists(f.id);
					assert.notExists(f.overview);
					assert.notExists(f.popularity);
					assert.notExists(f.vote_average);
					assert.notExists(f.adult);
					assert.notExists(f.release_date);
				})
			}
		} catch (e) {
		  assert.fail(e);
		}
	});

	it('data from /films/:id projection test', async () => {
		try {
			let films = await axios.get(url);
			films = films.data.data;

			if (films.length) {
				const id = films[0]._id;
				let film = await axios.get(url + "/" + id);
				film = film.data.data;

				assert.exists(film._id);
				assert.exists(film.title);
				assert.exists(film.poster_path);
				assert.exists(film.genres);

				assert.exists(film.overview);
				assert.exists(film.popularity);
				assert.exists(film.vote_average);
				assert.exists(film.adult);
				assert.exists(film.release_date);

				assert.notExists(film.id);
			}
		} catch (e) {
			assert.fail(e);
		}
	});

	it('/count endpoint, return number', async () => {
		try {
			let count = await axios.get(url + '/count');
			assert.typeOf(count.data.data, 'number');
			assert(count.data.data >= 0);
		} catch (e) {
			assert.fail(e);
		}
	});



});
