const Tour = require('../models/tourModel');

// prefills parts of query object before reaching .getAllTours() handler
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

exports.getAllTours = async (req, res) => {
    try {
        // TODO: Build Query
        // req.query gets the query string object [Automatically done by express!]
        // We need to exclude some fields like page=2 inside the query string for pagination later!

        //* 1A) Filtering
        const queryObj = { ...req.query }; // creates a copy
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach((el) => delete queryObj[el]);

        // GET /api/v1/tours?duration[gte]=5&difficulty=easy&page=2
        // { duration: { gte: '5' }, difficulty: 'easy' }
        // Actual MongoDB query => { duration: { $gte: 5 }, difficulty: 'easy' }

        //* 1B) Advance Filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(
            /\b(gte|lte|gt|lt)\b/g,
            (match) => `$${match}`
        ); // Use regex to replace lt, gt, lte, gte with $lt, $gt, $lte, $gte

        let query = Tour.find(JSON.parse(queryStr));

        //* 2) Sorting
        if (req.query.sort) {
            // GET /api/v1/tours?sort=-price,ratingsAverage
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            // default (no sort field in queryStr)
            query = query.sort('-createdAt');
        }

        //* 3) Field Limiting
        if (req.query.fields) {
            // GET /api/v1/tours?fields=-name,-duration
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        } else {
            query = query.select('-__v');
        }

        //* 4) Pagination
        // GET /api/v1/tours?page=2&limit=10
        // (1-10) Page 1, (11-20) Page 2
        // so to get page 2 with 10 results per page, we need to skip 10 results before actually querying and reaching 11th result
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 100;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);

        if (req.query.page) {
            const numTours = await Tour.countDocuments();
            if (skip >= numTours) {
                throw new Error('This page does not exist!');
            }
        }

        // TODO: Execute Query
        const tours = await query;
        // query.sort().select().skip().limit();
        //! All these methods always return a new query, which we can chain and finally await the query at the end.

        // const tours = await Tour.find()
        //     .where('duration')
        //     .equals(5)
        //     .where('difficulty')
        //     .equals('easy');

        // TODO: Send Response
        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err,
        });
    }
};

exports.getTour = async (req, res) => {
    try {
        // Tour.findOne({ _id: req.params.id});
        const tour = await Tour.findById(req.params.id);
        res.status(200).json({
            status: 'success',
            data: {
                tour,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err,
        });
    }
};

exports.createTour = async (req, res) => {
    try {
        // const newTour = new Tour({});
        // newTour.save();

        const newTour = await Tour.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err,
        });
    }
};

exports.updateTour = async (req, res) => {
    try {
        // The third param sets the option to return the new document
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        res.status(200).json({
            status: 'success',
            data: {
                tour,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err,
        });
    }
};

exports.deleteTour = async (req, res) => {
    try {
        await Tour.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err,
        });
    }
};
