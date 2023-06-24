const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

// mongoose.Schema(SchemaDefinition, SchemaOptions);
const toursSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            // validator: [values, message]
            required: [true, 'A tour must have a name'],
            unique: true,
            trim: true,
            maxlength: [
                40,
                'A tour name must have less or equal than 40 characters',
            ],
            minlength: [
                10,
                'A tour name must have more or equal than 10 characters',
            ],
            // validate: [
            //     validator.isAlpha,
            //     'Tour name must only contain characters.',
            // ],
        },
        slug: String,
        duration: {
            type: String,
            required: [true, 'A tour must have a duration'],
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A tour must have a group size'],
        },
        difficulty: {
            type: String,
            required: [true, 'A tour must have a difficulty'],
            enum: {
                // Longhand for validators
                values: ['easy', 'medium', 'difficult'],
                message: 'Difficulty is either easy, medium or difficult',
            },
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating must be above 1.0'],
            max: [5, 'Rating must be below 5.0'],
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price'],
        },
        priceDiscount: {
            type: Number,
            //! Custom Validator [can also use validator.js for this!]
            validate: {
                validator: function (val) {
                    //! this. only points to current document on NEW document creation.
                    return val < this.price; // ensure price discount < price
                },
                message:
                    'Discount price ({VALUE}) should be below the Regular price',
            },
        },
        summary: {
            type: String,
            trim: true,
            required: [true, 'A tour must have a summary'],
        },
        description: {
            type: String,
            trim: true,
        },
        imageCover: {
            type: String,
            required: [true, 'A tour must have a cover image'],
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false, // permanently hide from output!
        },
        startDates: [Date],
        secretTour: {
            type: Boolean,
            default: false,
        },
    },
    {
        toJSON: { virtuals: true },
    }
);

// To add a virtual field [Part of business logic] (which is not persisted in the database), we use a function() {} instead of () => {} as we need a this. keyword which will point to current document!
toursSchema.virtual('durationWeeks').get(function () {
    // virtual getter
    return this.duration / 7;
});

//! Types of middleware in mongoose: Document, Query, Aggregate, Model

// 1) DOCUMENT MIDDLEWARE
//? Pre Save Middleware / Pre Save Hook: runs before the .save() and .create() command, but not .insertMany()
toursSchema.pre('save', function (next) {
    //! To actually save this we need it in our Schema
    this.slug = slugify(this.name, { lower: true });
    next();
});

// toursSchema.post('save', (doc, next) => {
//     console.log(doc);
//     next();
// });

// 2) QUERY MIDDLEWARE: runs before or after a certain query is executed
//? Pre Find Hook: doesnt work on findOne() or findById() => Thus need a regex
toursSchema.pre(/^find/, function (next) {
    // this.find({ secretTour: { $ne: true } });
    this.start = Date.now();
    next();
});

toursSchema.post(/^find/, function (doc, next) {
    console.log(`Query took ${Date.now() - this.start}ms`);
    next();
});

// 3) AGGREGATION MIDDLEWARE: runs before or after an aggregation happens
// We now dont include secret tours in the aggregate operations!
toursSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    console.log(this.pipeline());
    next();
});

const Tour = mongoose.model('Tour', toursSchema);

module.exports = Tour;
