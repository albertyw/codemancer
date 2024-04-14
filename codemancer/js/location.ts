import $ = require('jquery');

import getRollbar = require('./rollbar');
import util = require('./util');
import {LocationData} from '../../server/location';

const cacheDuration = 24 * 60 * 60 * 1000;
const backupDuration = 7 * 24 * 60 * 60 * 1000;

export const Location = {
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
        getRollbar().error('Failed to geocode', error);
        return {};
      })
      .catch((error) => {
        getRollbar().error('Failed to geocode', error);
        return {};
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
