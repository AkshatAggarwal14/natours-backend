const fs = require('fs');
const express = require('express');
// convention to configure express in app.js

const app = express();

// middleware - functions modifying incoming request data!
app.use(express.json());

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// We mention version number in the route so it doesnt disturb users already using /v0/
// Route Handler!
// function(req, res) {}
app.get('/api/v1/tours', (req, res) => {
    // use JSend data specification!
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            // this automatically creates a property names tours and assigns tours to it!
            tours,
        },
    });
});

//? :variable
//? :optionalVariable?
app.get('/api/v1/tours/:id', (req, res) => {
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
});

app.post('/api/v1/tours', (req, res) => {
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
});

app.patch('/api/v1/tours/:id', (req, res) => {
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
});

app.delete('/api/v1/tours/:id', (req, res) => {
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
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`App running on port ${PORT}...`);
});
