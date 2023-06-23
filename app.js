const express = require('express');
const morgan = require('morgan');
// convention to configure express in app.js
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// Global middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

//! Mounting routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
