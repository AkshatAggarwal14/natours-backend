const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

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

module.exports = app;
