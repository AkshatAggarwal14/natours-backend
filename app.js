const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
app.use(express.json());

// Serving static files using built-in express middleware
// This servers the files in specified folder as though the base URL is the root
app.use(express.static(`${__dirname}/public`));

// app.use((req, res, next) => {
//     req.requestTime = new Date().toISOString();
//     next();
// });

// Mount Routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Unhandled routes
app.all('*', (req, res, next) => {
    // const err = new Error(`Cant find ${req.originalUrl} on this server!`);
    // err.status = 'fail';
    // err.statusCode = 404;
    next(new AppError(`Cant find ${req.originalUrl} on this server!`, 404)); // express assumes next(param: error)
});

//! err handling middleware has 4 params!
app.use(globalErrorHandler);

module.exports = app;
