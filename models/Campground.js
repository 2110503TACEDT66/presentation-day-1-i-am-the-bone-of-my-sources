const mongoose = require('mongoose');

const validLatitudes = [-90, 90];  // Valid latitude range
const validLongitudes = [-180, 180]; // Valid longitude range

const CampgroundSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    picture: {
        type: String,
        required: [true, 'Please add a picture']
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true // Ensures the type field is always present
        },
        coordinates: {
            type: [Number],
            required: true,
            validate: {
                validator: (coordinates) => {
                    const [longitude, latitude] = coordinates;
                    return (
                        validLongitudes[0] <= longitude &&  // Check if longitude is within valid range
                        longitude <= validLongitudes[1] &&
                        validLatitudes[0] <= latitude &&   // Check if latitude is within valid range
                        latitude <= validLatitudes[1]
                    );
                },
                message: props => `${props.value} is not a valid set of coordinates. Longitude must be between -180 and 180, and Latitude must be between -90 and 90`
            }
        }
    },
    tel: {
        type: String,
        required: [true, 'Please add a telephone number']
    },
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

//Cascade delete bookings when a campground is deleted
CampgroundSchema.pre('deleteOne', {document: true, query: false}, async function(next) {
    console.log(`Bookings being removed from campground ${this._id}`);
    await this.model('Booking').deleteMany({campground: this._id});
    next();
});

//Reverse populate with virtuals
CampgroundSchema.virtual('bookings', {
    ref: 'Booking',
    localField: '_id',
    foreignField: 'campground',
    justOne: false
});

module.exports = mongoose.model('Campground', CampgroundSchema);