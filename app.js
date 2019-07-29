const express = require('express');
const filmRouter = require('./components/film/index');
const genreRouter = require('./components/genre/index');
const { globalErrorHandler } = require('./utils/helpers');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/films', { useNewUrlParser: true })
	.then(() => console.log('database ready'))
	.catch(async (err) => {
		await globalErrorHandler(err);
	});
mongoose.set('useCreateIndex', true);

const app = express();

app.use(filmRouter);
app.use(genreRouter);

app.listen(3000);

module.exports = app;
