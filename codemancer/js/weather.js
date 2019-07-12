const $ = require('jquery');

const Rollbar = require('./rollbar');
const Location = require('./location');
const util = require('./util');

const weatherRefreshInterval = 20 * 60 * 1000;
// Icons are from https://erikflowers.github.io/weather-icons/
// Conditions are from https://graphical.weather.gov/xml/xml_fields_icon_weather_conditions.php
const weatherConditions = [
  ['Sunny', '\uf00d'],
  ['Clear', '\uf00d'],
  ['Cloudy', '\uf013'],
  ['Partly Cloudy', '\uf002'],
  ['Mostly Cloudy', '\uf041'],
  ['Areas Of Fog', '\uf014'],
  ['Fog', '\uf014'],
  ['Drizzle', '\uf009'],
  ['Rain Showers', '\uf009'],
  ['Light Rain', '\uf009'],
  ['Rain', '\uf008'],
  ['Heavy Rain', '\uf04e'],
  ['Showers And Thunderstorms', '\uf00e'],
];
const weatherIconConversions = new Map(weatherConditions);
const descriptors = ['Mostly', 'Partly', 'Slight Chance', 'Chance', 'Likely', 'Isolated', 'Patchy', 'Occasional', 'Very'];
const weatherLookForwardHours = 24;

const Weather = {

  $el: {
    now : $('.now'),
    city : $('#city')
  },

  urlBuilder: function(location) {
    // Documentation at https://www.weather.gov/documentation/services-web-api#/
    const url = 'https://api.weather.gov/gridpoints/' + location.wfo + '/'
      + location.x + ',' + location.y + '/forecast/hourly';
    return url;
  },

  atLocation: function () {
    const getWeather = new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', Weather.urlBuilder(Location.targetLocation));
      xhr.onload = () => resolve(xhr.responseText);
      xhr.onerror = () => reject([new Error('Cannot get weather'), xhr.statusText]);
      xhr.send();
    });
    const getDisplayName = Location.getDisplayName(Location.targetLocation);
    return Promise.all([getWeather, getDisplayName]).then((values) => {
      const data = JSON.parse(values[0]);
      data.locationDisplayName = values[1];
      return data;
    }).then(Weather.parse).catch((e) => {
      const message = e[0];
      const data = e[1];
      Rollbar.error(message, data);
    });
  },

  parse: function(data) {
    // Lets only keep what we need.
    const w2 = {};
    w2.city = data.locationDisplayName;
    if (!util.chainAccessor(data, ['properties', 'periods'])) {
      throw [new Error('No weather forecast periods available'), data];
    }
    w2.currentTemp = Math.round(util.chainAccessor(data, ['properties', 'periods', 0, 'temperature']));
    w2.minTemp = w2.currentTemp;
    w2.maxTemp = w2.currentTemp;
    w2.conditionSequence = [util.chainAccessor(data, ['properties', 'periods', 0, 'shortForecast'])];
    for (let i = 0; i < weatherLookForwardHours; i++) {
      if (i >= data.properties.periods.length) {
        break;
      }
      const period = data.properties.periods[i];
      const temp = Math.round(util.chainAccessor(period, ['temperature']));
      w2.minTemp = Math.min(w2.minTemp, temp);
      w2.maxTemp = Math.max(w2.maxTemp, temp);

      const condition = period.shortForecast;
      if(w2.conditionSequence[w2.conditionSequence.length-1] != condition) {
        w2.conditionSequence.push(condition);
      }
    }
    for (let i=0; i < w2.conditionSequence.length; i++) {
      w2.conditionSequence[i] = Weather.conditionIcon(w2.conditionSequence[i]);
    }
    w2.worstCondition = Weather.worstCondition(w2.conditionSequence);
    return w2;
  },

  worstCondition: function (conditionSequence) {
    let worstCondition = conditionSequence[0];
    for (let i=0; i < weatherConditions.length; i++) {
      if(conditionSequence.includes(weatherConditions[i][1])) {
        worstCondition = weatherConditions[i][1];
      }
    }
    return worstCondition;
  },

  conditionIcon: function (condition){
    let weatherIconCode = weatherIconConversions.get(condition);
    if (weatherIconCode !== undefined) {
      return weatherIconCode;
    }
    for (let i=0; i<descriptors.length; i++) {
      condition = condition.replace(descriptors[i], '');
    }
    condition = condition.replace(/^\s+|\s+$/g, '');
    weatherIconCode = weatherIconConversions.get(condition);
    if (weatherIconCode !== undefined) {
      return weatherIconCode;
    }
    Rollbar.error('cannot find image for "' + condition + '"');
    return '\uf04c';
  },

  render: function(wd) {
    // Set Current Information
    Weather.renderDay(Weather.$el.now, wd);
    Weather.$el.city.html(wd.city).show();

    // Show Weather
    $('#weather-inner').removeClass('hidden').show();
  },

  renderDay: function(el, data) {
    el.find('.condition').html(data.worstCondition);
    el.find('.min-temp').html(data.minTemp);
    el.find('.current-temp').html(data.currentTemp);
    el.find('.max-temp').html(data.maxTemp);
  },

  load: function() {
    return Weather.atLocation();
  }
};

function main() {
  Weather.load().then(function(data) {
    Weather.render(data);
  }, function(error) {
    Rollbar.error(error);
  });
  setInterval(main, weatherRefreshInterval);
}

module.exports = {
  load: main,
  Weather: Weather,
};
