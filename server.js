'use strict';

require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
// Variable for holding current location
let currentLocation;
// use environment variable, or, if it's undefined, use 3000 by default
const PORT = process.env.PORT || 3000;


// Constructor for the Location response from API
const LocationResponse = function(request, formatted_query, lat, long){
  this.search_query = request.query.data;
  this.formatted_query = formatted_query;
  this.latitude = lat;
  this.longitude = long;
};

// Constructor for a DaysWeather.
const DaysWeather = function(forecast, time){
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

app.use(cors());
app.use(express.static('./public'));

app.get('/location', (request, response) => {
  //check for json file
  try {
    let geoData = require('./data/geo.json');
    currentLocation = new LocationResponse(request, geoData.results[0].formatted_address, geoData.results[0].geometry.location.lat, geoData.results[0].geometry.location.lng);
    response.send(currentLocation);
  } catch( error ) {
    console.log('There was an error /location path');
    errorHandling(error, 500, 'Sorry, something went wrong.');
  }
});

app.get('/weather', (request, response) => {
  //check for json file
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
