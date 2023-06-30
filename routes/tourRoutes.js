const express = require('express');
const tourController = require('../controllers/tourController');

const router = express.Router();

// Not needed anymore as MongoDB will give error on Invalid ID itself
// router.param('id', tourController.checkID);

// we can also chain middlewares when passing handlers!
// router.route().post(tourController.checkBody, tourController.createTour);

// 127.0.0.1:3000/api/v1/tours?limit=5&sort=-ratingsAverage,price
// 5 Top Rated and Cheap tours
// This is a frequently used route, so we can use aliasing here!
//! Aliasing chains middleware
router
    .route('/top-5-cheap')
    .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

//! We can also use catchAsync here
// router.route('/').get(catchAsync(tourController.getAllTours))

router
    .route('/')
    .get(tourController.getAllTours)
    .post(tourController.createTour);

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour);

module.exports = router;
