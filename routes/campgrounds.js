const express = require('express');
const {getCampgrounds, getCampground, createCampground, updateCampground, deleteCampground, getCampgroundsLocation, getNearestCampground} = require('../controllers/campgrounds');

const bookingRouter = require('./bookings');
const { getWeather } = require('../controllers/weather');

const router = express.Router();

const {protect, authorize} = require('../middleware/auth');

//Re-route into other resource routers
router.use('/:campgroundId/bookings', bookingRouter);

router.route('/locations').get(getCampgroundsLocation);
router.route('/:campgroundId/weather').get(getWeather);
router.route('/nearest').get(protect, getNearestCampground);

router.route('/').get(getCampgrounds).post(protect, authorize('admin'), createCampground);
router.route('/:id').get(getCampground).put(protect, authorize('admin'), updateCampground).delete(protect, authorize('admin'), deleteCampground);

module.exports = router;