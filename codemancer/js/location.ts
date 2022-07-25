import $ = require('jquery');

import Rollbar = require('./rollbar');
import util = require('./util');
import varsnap = require('./varsnap');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sanFranciscoLocation = {
  // Generated from https://api.weather.gov/points/37.78,-122.41
  wfo: 'MTR', x: '85', y: '105',
  lat: 37.78, lng: -122.41,
  timezone: 'America/Los_Angeles',
};
export const targetLocation = sanFranciscoLocation;
const geocodingAPIKey = process.env.GEOCODING_API_KEY;
const geocodingURL = 'https://maps.googleapis.com/maps/api/geocode/json';
const cacheDuration = 24 * 60 * 60 * 1000;
const backupDuration = 7 * 24 * 60 * 60 * 1000;

export const Location = {
  targetLocation: targetLocation,

  urlBuilder: varsnap(function urlBuilder(location: any): string {
    let url = geocodingURL;
    url += '?latlng=' + encodeURIComponent(location.lat + ',' + location.lng);
    url += '&sensor=false';
    url += '&key=' + encodeURIComponent(geocodingAPIKey);
    return url;
  }, 'Location.urlBuilder'),

  getDisplayName: function (location: any): Promise<string> {
    const url = Location.urlBuilder(location);
    return util.requestPromise(url, cacheDuration, backupDuration)
      .then((data) => {
        if (data.status === 'OK') {
          return Location.parseDisplayName(data);
        }
        Rollbar.error('Failed to geocode', data);
        return '';
      }, (error) => {
        Rollbar.error('Failed to geocode', error);
        return '';
      })
      .catch((error) => {
        Rollbar.error('Failed to geocode', error);
        return '';
      });
  },

  parseDisplayName: varsnap(function parseDisplayName(data: any): string {
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

  renderLocation: function (cityName: string): void {
    const cityElement = $('#city');
    cityElement.html(cityName).show();
  },

  showLocation: function(): void {
    Location.getDisplayName(Location.targetLocation).
      then(Location.renderLocation);
  },
};

export function load(): void {
  Location.showLocation();
}
