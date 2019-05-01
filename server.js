'use strict';

require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const superagent = require('superagent');

// use environment variable, or, if it's undefined, use 3000 by default
const PORT = process.env.PORT || 3000;

// Constructor for the Location response from API
const Location = function(queryData, res){
  this.search_query = queryData;
  this.formatted_query = res.results[0].formatted_address;
  this.latitude = res.results[0].geometry.location.lat;
  this.longitude = res.results[0].geometry.location.lng;
};

// Constructor for a DaysWeather.
const DaysWeather = function(forecast, time) {
  this.forecast = forecast;
  this.time = new Date(time * 1000).toDateString();
};

// Function for getting all the daily weather
function getDailyWeather(weatherData){
  let data = weatherData.daily.data;
  console.log(data);
  const dailyWeather = data.map(element => (new DaysWeather(element.summary, element.time)));
  console.log(dailyWeather);

  return dailyWeather;
}

// Function for handling errors
function errorHandling(error, status, response){
  response.status(status).send('Sorry, something went wrong');
}

// express middleware
app.use(cors());
app.use(express.static('./public'));


// express endpoints
app.get('/location', (request, response) => {
  // check for json file
  try {
    let queryData = request.query.data;
    let geocodeURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${queryData}&key=${process.env.GEOCODE_API_KEY}`;
    superagent.get(geocodeURL)
      .end( (err, googleMapsApiResponse) => {
        // turn it into a location instance
        const location = new Location(queryData, googleMapsApiResponse.body);
        // send that as our response to our frontend
        response.send(location);
      });
  } catch( error ) {
    console.log('There was an error /location path');
    errorHandling(error, 500, 'Sorry, something went wrong.');
  }
});

app.get('/weather', (request, response) => {
  // check for json file
  try {
    let weatherData = require('./data/darksky.json');
    console.log(request.query.data);
    let weather = getDailyWeather(weatherData);
    response.send(weather);
  } catch( error ) {
    console.log('There was an error /weather path');
    errorHandling(error, 500, 'Sorry, something went wrong.');
  }
});


app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
