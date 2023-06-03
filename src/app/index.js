const express = require('express');
const cors = require('cors');
const exceptionMiddleware = require('../exception/exception.middleware');
const router = require('../routes/index');

const app = express();

//cors middleware
app.use(
  cors({
    credentials: true,
  })
);

//json parse middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use('/', router);

//exception middleware
app.use(exceptionMiddleware);

module.exports = { app };
