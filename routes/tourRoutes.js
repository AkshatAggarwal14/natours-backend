const express = require('express');
const tourController = require('../controllers/tourController');

const router = express.Router();

// Not needed anymore as MongoDB will give error on Invalid ID itself
// router.param('id', tourController.checkID);

// we can also chain middlewares when passing handlers!
// router.route().post(tourController.checkBody, tourController.createTour);

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
