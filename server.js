'use strict';

const express = require('express');
require('dotenv').config();
const cors = require('cors');
const server = express();
const superagent = require('superagent');
const pg = require('pg');
const PORT = process.env.PORT || 5000;
server.use(cors());

const client = new pg.Client(process.env.DATABASE_URL);

server.get('/', (req,res)=>{
  res.send(' سلاااام على الزلااام');
});

server.get('/location',getLocationFromDatabase);
server.get('/weather', weatherHandler);
server.get('/parks', parksHandler);
server.get('*',generalHandler);

function getLocationFromDatabase(req,res){
  let cityName = req.query.city;
  let SQL = `SELECT * FROM locations WHERE search_query=$1;`;
  let safeValuse = [cityName];
  client.query(SQL,safeValuse)
    .then(result=>{
      if (result.rows.length !== 0){
        console.log(result.rows);
        res.send(result.rows[0]);
      }else{
        let key = process.env.LOCATION_KEY;
        let locURL = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${cityName}&format=json`;
        superagent.get(locURL)
          .then(geoData=>{
            let gData = geoData.body;
            let locationData = new Location(cityName,gData);
            let SQL = `INSERT INTO locations (search_query,formatted_query,latitude,longitude) VALUES ($1,$2,$3,$4) RETURNING *;`;
            let safeValues = [locationData.search_query,locationData.formatted_query,locationData.latitude,locationData.longitude];
            client.query(SQL,safeValues);
            res.send(locationData);
          }).catch(error=>{
            console.log(error);
            res.send(error);
          });
      }

    });
}

function weatherHandler(req,res){
  let cityName = req.query.search_query;
  let key1 = process.env.WEATHER_KEY;
  let wethURL = `https://api.weatherbit.io/v2.0/forecast/daily?city=${cityName}&key=${key1}`;
  superagent.get(wethURL)
    .then(wethData=>{
      let arrayWeth = wethData.body.data.map((elemnt) =>{ return new Weathers(elemnt);});
      res.send(arrayWeth);
    }).catch(error=>{
      console.log(error);
      res.send(error);
    });
}
function parksHandler(req,res){
  let cityName = req.query.search_query;
  let key2 = process.env.PARKS_API_KEY;
  let wethURL = `https://developer.nps.gov/api/v1/parks?q=${cityName}&limit=5&api_key=${key2}`;
  superagent.get(wethURL)
    .then(parkData=>{
      let park = parkData.body;
      let parksArray = park.data.map(item =>
        new Parks(item));
      res.send(parksArray);
    }).catch(error=>{
      console.log(error);
      res.send(error);
    });
}

function generalHandler(req,res){
  let errObj = {
    status: 404,
    resText: 'sorry! this page not found'
  };
  res.status(404).send(errObj);
}

function Location(cityName,locData){
  this.search_query = cityName;
  this.formatted_query = locData[0].display_name;
  this.latitude = locData[0].lat;
  this.longitude = locData[0].lon;
}

function Weathers (weatherData)
{
  this.forecast = weatherData.weather.description;
  this.time = new Date(weatherData.valid_date).toString().slice(0,15);
}
function Parks (parkData){
  this.name = parkData.fullName;
  this.address = `${(parkData.addresses[0].line1)},${parkData.addresses[0].city},${parkData.addresses[0].stateCode} ${parkData.addresses[0].postalCode}`;
  this.fee = '0.00';
  this.description = parkData.description;
  this.url = parkData.url;
}

// function noParks(){

// }

client.connect()
  .then(() => {
    server.listen(PORT, () =>
      console.log(`listening on ${PORT}`)
    );

  });
