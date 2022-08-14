import $ = require('jquery');

import Rollbar = require('./rollbar');
import util = require('./util');

// TODO: delete this
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sanFranciscoLocation = {
  // Generated from https://api.weather.gov/points/37.78,-122.41
  wfo: 'MTR', x: '85', y: '105',
  lat: 37.78, lng: -122.41,
  timezone: 'America/Los_Angeles',
};
export const targetLocation = sanFranciscoLocation;

const cacheDuration = 24 * 60 * 60 * 1000;
const backupDuration = 7 * 24 * 60 * 60 * 1000;

export const Location = {
  targetLocation: targetLocation,

  getLocation: function (): Promise<any> {
    const url = '/location/';
    return util.requestPromise(url, cacheDuration, backupDuration)
      .then((data) => {
        return data;
      }, (error) => {
        Rollbar.error('Failed to geocode', error);
        return '';
      })
      .catch((error) => {
        Rollbar.error('Failed to geocode', error);
        return '';
      });
  },

  renderLocation: function (location: any): void {
    const cityElement = $('#city');
    cityElement.html(location.displayName).show();
  },

  showLocation: function(): void {
    Location.getLocation().
      then(Location.renderLocation);
  },
};

export function load(): void {
  Location.showLocation();
}
