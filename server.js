const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./configs/db');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

// const campgrounds = require('./routes/campgrounds');
const auth = require('./routes/auth');
// const bookings = require('./routes/bookings');

//Load env vars
dotenv.config({path:'./config/config.env'});

connectDB();

const app = express();

//Body Parser
app.use(express.json());

//Cookie parser
app.use(cookieParser());

//Sanitize data
app.use(mongoSanitize());

//Set security headers
app.use(helmet());

//Prevent XSS attacks
app.use(xss());

//Rate Limiting
const limiter = rateLimit({
    windowsMs: 10*60*1000,
    max: 500
});
app.use(limiter);

//Prevent http param pollutions
app.use(hpp());

//Enable CORS
app.use(cors());

//Mount router
// app.use('/api/v1/campgrounds', campgrounds);
app.use('/api/v1/auth', auth);
// app.use('/api/v1/bookings', bookings);


const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, ' mode on port ', PORT));

process.on(`unhandledRejection`, (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(()=>process.exit(1));
});
