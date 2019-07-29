const express = require('express');
const { updateController, getGenresController } = require('./controllers');
const { statisticController } = require('./statisticController');

const Router = express.Router();

Router.get('/genres', getGenresController);

Router.get('/genres/update', updateController);

Router.get('/genres/statistic/:genre', statisticController);

module.exports = Router;
