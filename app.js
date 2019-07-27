const express = require('express');
const filmRouter = require('./components/film/index');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/films', { useNewUrlParser: true })
	.then(() => console.log('database ready'))
	.catch(err => console.log(err));
mongoose.set('useCreateIndex', true);

const app = express();

app.use(filmRouter);

app.listen(3000);

module.exports = app;
