const express = require('express');
const {
	updateController,
	countController,
	statisticController,
	getFilmsController,
	getFilmController,
} = require('./controllers');

const Router = express.Router();

Router.get('/films/count', countController);

Router.get('/films/update', updateController);

Router.get('/films/statistic', statisticController);

Router.get('/films', getFilmsController);

Router.get('/films/:id', getFilmController);

module.exports = Router;
