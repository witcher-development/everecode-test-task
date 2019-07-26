const express = require('express');
const filmRouter = require('./components/film/index');

const app = express();

app.use(filmRouter);

app.listen(3000);

module.exports = app;
