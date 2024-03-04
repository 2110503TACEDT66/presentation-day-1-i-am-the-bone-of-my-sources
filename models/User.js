const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const validLatitudes = [-90, 90];  // Valid latitude range
const validLongitudes = [-180, 180]; // Valid longitude range

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add your name"],
  },
  tel: {
    type: String,
    required: [true, "Please add your phone number"],
    match: [
      /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/,
      "Please add a valid phone number",
    ],
  },
  email: {
    type: String,
    required: [true, "Please add your email"],
    unique: [true, "This email has been used"],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please add a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false,
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
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// encrypt password
UserSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// gen signed token
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// match password to hashed password in db
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
