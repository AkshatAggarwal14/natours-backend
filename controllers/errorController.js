const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
    const keys = Object.keys(err.keyPattern);
    const values = keys.map((key) => `${key}: ${err.keyValue[key]}`);

    const message = `Duplicate field value: '${values.join()}'. Please use another value!`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((e) => e.message);

    const message = `Invalid input data: ${errors.join('. ')}`;
    return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack, // stack trace
    });
};

const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        // trusted operational message: send msg to client
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        // unknown error: dont leak details to client
        // 1) log error
        console.log('ERROR 💥', err);

        // 2) send generic message
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!',
        });
    }
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        // let error = { ...err };  //! doesnt work as "copies own enumerable properties from a provided object onto a new object"
        let error = JSON.parse(JSON.stringify(err));

        // mark operational errors by mongoose!
        // 1) invalid id (CastError)
        // 2) duplicate key error
        // 3) ValidationError
        if (error.name === 'CastError') {
            error = handleCastErrorDB(error);
        } else if (error.code === 11000) {
            error = handleDuplicateFieldsDB(error);
        } else if (error.name === 'ValidationError') {
            // errors: {field: error, name: 'ValidationError'}
            error = handleValidationErrorDB(error);
        }

        sendErrorProd(error, res);
    }
};
