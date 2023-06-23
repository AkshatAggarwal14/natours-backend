const express = require('express');
const tourController = require('../controllers/tourController');

const router = express.Router();

//! In a param middleware we get access to the param through val argument
// We can use this middleware to check if ID is valid!
// This middleware is a part of our pipeline now! => Validation of ID is done automatically by this param middleware
router.param('id', tourController.checkID);

// we can also chain middlewares when passing handlers!
router
    .route('/')
    .get(tourController.getAllTours)
    .post(tourController.checkBody, tourController.createTour);

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour);

module.exports = router;
