const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
// convention to configure express in app.js

const app = express();

// We use `morgan` for logging!
app.use(morgan('dev'));

// middleware - functions modifying incoming request data!
app.use(express.json());

//! If this middleware is declared after a route handler then it doesnt execute as the request-response cycle ends at the route handler!
//! This is a global middleware! before all route handlers.
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// route handlers are also middleware, but for specific requests!

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

const getAllTours = (req, res) => {
    // use JSend data specification!
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        results: tours.length,
        data: {
            // this automatically creates a property names tours and assigns tours to it!
            tours,
        },
    });
};

const getTour = (req, res) => {
    console.log(req.params);

    // this will convert string to number
    // const id = req.params.id * 1;
    const requestedID = parseInt(req.params.id);
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
    //? testing callback arrow function
    // const tour = tours.find((el) => el.id == requestedID);
    const tour = tours.find(({ id }) => id == requestedID); //? Destructuring Technique!

    if (!tour) {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID',
        });
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour,
        },
    });
};

const createTour = (req, res) => {
    // We get the JSON as JS Object that we sent in the POST request
    // console.log(req.body);

    const newID = tours[tours.length - 1].id + 1;
    // we can also do req.body.id = newID but we did not want to mutate the request!
    const newTour = { id: newID, ...req.body };

    tours.push(newTour);
    fs.writeFile(
        `${__dirname}/dev-data/data/tours-simple.json`,
        JSON.stringify(tours),
        (err) => {
            // 201 means new resource created
            res.status(201).json({
                status: 'success',
                data: {
                    tour: newTour,
                },
            });
        }
    );

    // ERR_HTTP_HEADERS_SENT : happens if you try to send two responses!
    // res.send('Done');
};

const updateTour = (req, res) => {
    console.log(req.params);

    const requestedID = parseInt(req.params.id);

    if (requestedID >= tours.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID',
        });
    }

    res.status(200).json({
        status: 'success',
        data: '<Updated tour here>',
    });
};

const deleteTour = (req, res) => {
    console.log(req.params);

    const requestedID = parseInt(req.params.id);

    if (requestedID >= tours.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID',
        });
    }

    // 204 for delete!
    res.status(204).json({
        status: 'success',
        data: null,
    });
};

const getAllUsers = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!',
    });
};

const createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!',
    });
};

const getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!',
    });
};

const updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!',
    });
};

const deleteUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!',
    });
};

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

//? refactored
app.route('/api/v1/tours').get(getAllTours).post(createTour);

app.route('/api/v1/tours/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(deleteTour);

app.route('/api/v1/users').get(getAllUsers).post(createUser);

app.route('/api/v1/users/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`App running on port ${PORT}...`);
});
