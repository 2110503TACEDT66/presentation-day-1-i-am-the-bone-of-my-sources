const Campground = require('../models/Campground');

//Get all campgrounds
//GET /api/v1/campgrounds
exports.getCampgrounds= async (req,res,next) => {
    let query;

    //Copy req.query
    const reqQuery = {...req.query};

    //Fields to exclude
    const removeFields = ['select','sort','page','limit'];

    //Loop over remove fields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);
    console.log(reqQuery);

    //Create query string
    let queryStr = JSON.stringify(reqQuery);
    //Create operators ($gt, $gte)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    //finding resource
    query = Campground.find(JSON.parse(queryStr)).populate('bookings');

    //Select Fields
    if(req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }
    //Sort
    if(req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('name');
    }
    //Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page-1)*limit;
    const endIndex = page*limit;

    try {
        const total = await Campground.countDocuments();
        query = query.skip(startIndex).limit(limit);
        const campgrounds = await query;

        //Pagination result
        const pagination = {};

        if(endIndex < total) {
            pagination.next = {
                page: page+1,
                limit
            }
        }

        if (startIndex<0) {
            pagination.prev = {
                page: page-1,
                limit
            }
        }
        res.status(200).json({success: true, count: campgrounds.length, pagination, data: campgrounds});
    } catch (err) {
        res.status(400).json({success:false});
    }
};

//Get single campground
//GET /api/v1/campgrounds/:id
exports.getCampground= async (req,res,next) => {
    try {
        const campground = await Campground.findById(req.params.id).populate('bookings');
        if (!campground) {
            res.status(400).json({success:false});
        }
        res.status(200).json({success: true, data: campground});
    } catch (err) {
        res.status(400).json({success:false});
    }
};

//Create a campground
//POST /api/v1/campgrounds
exports.createCampground= async (req,res,next) => {
    try {
        const campground = await Campground.create(req.body);
        res.status(201).json({
            success: true, 
            data: campground});
    } catch (err) {
        res.status(400).json({success: false, message: err.message});
    }
};

//Update a campground
//PUT /api/v1/campgrounds/:id
exports.updateCampground= async (req,res,next) => {
    try {
        const campground = await Campground.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if(!campground) {
            return res.status(400).json({success: false});
        }

        res.status(200).json({success: true, data: campground});
    } catch (err) {
        res.status(400).json({success: false});
    }
};

//Delete a campground
//DELETE /api/v1/campgrounds/:id
exports.deleteCampground= async (req,res,next) => {
    try {
        const campground = await Campground.findByIdAndDelete(req.params.id);
        if(!campground) {
            res.status(404).json({success: false, message: `Campground not found with id of ${req.params.id}`});
        }

        await campground.deleteOne();
        res.status(200).json({success: true, data: {}});
    } catch (err) {
        res.status(400).json({success: false});
    }
};
// Get campgrounds location
// GET /api/v1/campground/locations
exports.getCampgroundsLocation = async (req,res,next) => {
    try {
        const campgrounds = await Campground.find().select('location name');
        res.status(200).json({success: true, data: campgrounds});
    } catch (err) {
        res.status(400).json({success: false});
    }
}