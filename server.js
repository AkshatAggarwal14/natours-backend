const mongoose = require('mongoose');
const dotenv = require('dotenv');
// Need this config before app file, so loaded env vars can be accessed in app.js also
dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

const toursSchema = new mongoose.Schema({
    name: {
        type: String,
        // validator
        required: [true, 'A tour must have a name'],
        unique: true,
    },
    rating: {
        type: Number,
        default: 4.5,
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price'],
    },
});

const Tour = mongoose.model('Tour', toursSchema);

const testTour = new Tour({
    name: 'Test',
    rating: 4.7,
    price: 497,
});

testTour
    .save()
    .then((doc) => {
        console.log(doc);
    })
    .catch((err) => {
        console.log(err);
    });

// environment can be dev or prod! diff database or diff loggers
// console.log(app.get('env')); // set by express
// console.log(process.env); // set by node
// can set by ```NODE_ENV=development nodemon server.js```
const PORT = process.env.PORT || 3000;

mongoose.connect(DB).then(() => {
    console.log('Database connection successful!');
    app.listen(PORT, () => {
        console.log(`App running on port ${PORT}...`);
    });
});
