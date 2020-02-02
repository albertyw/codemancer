const $ = require('jquery');

const Rollbar = require('./rollbar');
const util = require('./util');
const varsnap = require('./varsnap');

const targetLocation = {
  wfo: 'MTR', x: '88', y: '128',
  lat: 37.778519, lng: -122.40564,
};
const geocodingAPIKey = process.env.GEOCODING_API_KEY;
const geocodingURL = 'https://maps.googleapis.com/maps/api/geocode/json';
const locationExpiration = 24 * 60 * 60 * 1000;

const Location = {
  targetLocation: targetLocation,
  cityElement: $('#city'),

  getDisplayName: function (location) {
    return new Promise((resolve, reject) => {
      let url = geocodingURL;
      url += '?latlng=' + encodeURIComponent(location.lat + ',' + location.lng);
      url += '&sensor=false';
      url += '&key=' + encodeURIComponent(geocodingAPIKey);
      util.request(url, resolve, reject, locationExpiration);
    }).then((data) => {
      if (data.status === 'OK') {
        return Location.parseDisplayName(data);
      }
      Rollbar.error('Failed to geocode', data);
      return '';
    }, (error) => {
      Rollbar.error('Failed to geocode', error);
      return '';
    });
  },

  parseDisplayName: varsnap(function parseDisplayName(data) {
    const result=data.results[0].address_components;
    const info=[];
    for(let i=0;i<result.length;++i) {
      const type = result[i].types[0];
      if(type==='country'){
        info.push(result[i].long_name);
      } else if(type==='administrative_area_level_1'){
        info.push(result[i].short_name);
      } else if(type==='locality'){
        info.unshift(result[i].long_name);
      }
    }
    const locData = util.unique(info);
    if (locData.length === 3) {
      locData.pop();
    }
    return locData.join(', ');
  }),

  renderLocation: function (cityName) {
    Location.cityElement.html(cityName).show();
  },

  showLocation: function() {
    Location.getDisplayName(Location.targetLocation).
      then(Location.renderLocation);
  },
};

function load() {
  Location.showLocation();
}

module.exports = {
  Location: Location,
  load: load,
};
