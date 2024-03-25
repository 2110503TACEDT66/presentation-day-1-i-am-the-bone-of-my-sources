const Booking = require('../models/Booking');
const Campground = require('../models/Campground');

/**
 * @desc   Get All bookings
 * @route  GET /api/v1/bookings
 * @access Public
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.getBookings = async (req, res, next) => {
    let query;
    // Generate users can see only their bookings!
    if (req.user.role !== 'admin') {
        query = Booking.find({ user: req.user.id });
    } else {
        // admin can see all bookings
        if (req.params.campgroundId) {
            console.log(req.params.campgroundId);
            query = Booking.find({ campground: req.params.campgroundId });
        } else {
            query = Booking.find();
        }
    }
    query = query.populate({
        path: 'campground',
        select: 'name address tel picture',
    });
    try {
        const bookings = await query;
        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings,
        });
    } catch (err) {
        console.log(err);
        return res
            .status(500)
            .json({ success: false, message: 'Cannot find Booking' });
    }
};

/**
 * @desc    Get single booking
 * @route   GET /api/v1/bookings/:id
 * @access  Public
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.getBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id).populate({
            path: 'campground',
            select: 'name description tel picture',
        });
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: `No booking with the id of ${req.params.id}`,
            });
        }
        res.status(200).json({
            success: true,
            data: booking,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: `Cannot find Booking`,
        });
    }
};

/**
 * @desc    Create new booking
 * @route   POST /api/v1/campgrounds/:campgroundId/bookings
 * @access  Private
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.addBooking = async (req, res, next) => {
    try {
        req.body.campground = req.params.campgroundId;
        req.body.user = req.user.id;

        const campground = await Campground.findById(req.params.campgroundId);
        if (!campground) {
            return res.status(404).json({
                success: false,
                message: `No campground with the id of ${req.params.campgroundId}`,
            });
        }

        // Check if existed booking
        const existedBooking = await Booking.find({
            user: req.user.id,
        });

        console.log(existedBooking.length);
        if (existedBooking.length >= 3 && req.user.role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: `The user with ID ${req.user.id} has already made 3 bookings.`,
            });
        }

        const booking = await Booking.create(req.body);
        res.status(200).json({
            success: true,
            data: booking,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: `Cannot create Booking`,
        });
    }
};

/**
 * @desc    Update booking
 * @route   PUT /api/v1/bookings/:id
 * @access  Private
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.updateBooking = async (req, res, next) => {
    try {
        let booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: `No booking with the id of ${req.params.id}`,
            });
        }

        // Make sure user is booking owner
        if (
            booking.user.toString() !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to update this booking`,
            });
        }

        booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            data: booking,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: `Cannot update Booking`,
        });
    }
};

/**
 * @desc    Delete booking
 * @route   DELETE /api/v1/bookings/:id
 * @access  Private
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.deleteBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: `No booking with the id of ${req.params.id}`,
            });
        }

        // Make sure user is booking owner
        if (
            booking.user.toString() !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to delete this booking`,
            });
        }

        await booking.deleteOne();

        res.status(200).json({
            success: true,
            data: {},
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: `Cannot delete Booking`,
        });
    }
};
