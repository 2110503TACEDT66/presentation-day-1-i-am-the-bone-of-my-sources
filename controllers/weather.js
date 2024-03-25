const Campground = require('../models/Campground');

exports.getWeather = async (req, res, next) => {
  try {
    const campground = await Campground.findById(req.params.campgroundId);
    if (!campground) {
      return res.status(400).json({ success: false, message: `No campground with the id of ${req.params.campgroundId}` });
    }

    const lat = campground.location.coordinates[1];
    const lon = campground.location.coordinates[0];
    const exc = 'current,minutely,hourly';
    if (!lat || !lon) {
      return res.status(400).json({ success: false, message: 'This campground does not have geological information' });
    }

    const apiUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=${exc}&appid=${process.env.WEATHER_API_KEY}`
    console.log(apiUrl);

    let apiResponse;
    await fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
        // console.log(response);
      })
      .catch(err => {
        console.error(err);
        return res.status(400).json({ success: false, message: 'Unable to connect to the Weather API' });
      })
      .then(result => {
        apiResponse = result;
      })
      .catch(err => {
        console.error(err);
        return res.status(400).json({ success: false, message: 'Unable to connect to the Weather API' });
      });

    if (!apiResponse || apiResponse === undefined) {
      return res.status(400).json({ success: false, message: 'Unable to obtain weather information from API' });
    }

    return res.status(200).json({ success: true, campground: campground, weatherInfo: apiResponse });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ success: false, message: 'Unable to obtain weather information' });
  }
}
