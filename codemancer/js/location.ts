import $ = require('jquery');

import Rollbar = require('./rollbar');
import util = require('./util');
import {LocationData} from '../../server/location';

// TODO: delete this
const sanFranciscoLocation: LocationData = {
  // Generated from https://api.weather.gov/points/37.78,-122.41
  wfo: 'MTR', x: '85', y: '105',
  lat: 37.78, lng: -122.41,
  timezone: 'America/Los_Angeles',
  displayName: '',
};
export const targetLocation = sanFranciscoLocation;

const cacheDuration = 24 * 60 * 60 * 1000;
const backupDuration = 7 * 24 * 60 * 60 * 1000;

export const Location = {
  targetLocation: targetLocation,
  locationData: undefined,

  getLocation: function (): Promise<LocationData> {
    const url = '/location/';
    if (this.locationData !== undefined) {
      return this.locationData;
    }
    this.locationData = util.requestPromise(url, cacheDuration, backupDuration)
      .then((data) => {
        return data;
      }, (error) => {
        Rollbar.error('Failed to geocode', error);
        return targetLocation;
      })
      .catch((error) => {
        Rollbar.error('Failed to geocode', error);
        return targetLocation;
      });
    return this.locationData;
  },

  renderLocation: function (location: LocationData): void {
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
