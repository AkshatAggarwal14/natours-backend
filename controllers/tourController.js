const Tour = require('../models/tourModel');

exports.checkBody = (req, res, next) => {
    if (!req.body.name || !req.body.price) {
        return res.status(400).json({
            status: 'fail',
            message: 'missing name or price',
        });
    }
    next();
};

exports.getAllTours = (req, res) => {
    // use JSend data specification!
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        // results: tours.length,
        // data: {
        //     tours,
        // },
    });
};

exports.getTour = (req, res) => {
    // const id = req.params.id * 1;
    // const requestedID = req.params.id * 1;
    //? testing callback arrow function
    // const tour = tours.find((el) => el.id == requestedID);
    // const tour = tours.find(({ id }) => id === requestedID); //? Destructuring Technique!
    // res.status(200).json({
    //     status: 'success',
    //     data: {
    //         tour,
    //     },
    // });
};

exports.createTour = (req, res) => {
    res.status(201).json({
        status: 'success',
        // data: {
        //     tour: newTour,
        // },
    });
};

exports.updateTour = (req, res) => {
    res.status(200).json({
        status: 'success',
        data: '<Updated tour here>',
    });
};

exports.deleteTour = (req, res) => {
    // 204 for delete!
    res.status(204).json({
        status: 'success',
        data: null,
    });
};
