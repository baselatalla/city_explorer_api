'use strict';

const express = require('express');

require('dotenv').config();

const cors = require('cors');

const server = express();

const PORT = process.env.PORT || 5000;

server.use(cors());

server.get('/', (req,res)=>{
  res.send('سلاااام على الزلااام');
});

server.get('*', (req, res) => {
  let errObject = {
    status: 500,
    responseText: 'Sorry, something went wrong ',
  };
  res.status(500).send(errObject);});



server.get('/location',(req,res)=>{
  //fetch the data that inside locaion.json file
  let locationData = require('./data/location.json');
  let locationRes = new Location(locationData);
  console.log(locationRes);
  res.send(locationRes);
});

server.get('/weather',(req,res)=>{
  //fetch the data that inside locaion.json file
  let weatherData = require('./data/weather.json');

  weatherData.data.forEach(element => {
    new Weather(element.weather['description'],element.valid_date);
  });
  res.send(weatherArray);
});

let weatherArray = [];

function Location(locationData) {
  this.search_query = 'Lynwood';
  this.formatted_query = locationData[0].display_name;
  this.latitude = locationData[0].lat;
  this.longitude = locationData[0].lon;
}
function Weather(forecast,time){
  this.forecast = forecast;
  this.time = time;
  weatherArray.push(this);
}

server.listen(PORT,()=>{
  console.log(`listening on port ${PORT}`);
});
