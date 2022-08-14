import $ = require('jquery');

import {Location} from './location';
import {LocationData} from '../../server/location';
import util = require('./util');
import varsnap = require('./varsnap');

const airnowProxyURL = '/airnow/';
const cacheDuration = 20 * 60 * 1000;
const backupDuration = 3 * 60 * 60 * 1000;

export const Air = {
  dom: $('#air-message'),

  urlBuilder: varsnap(function urlBuilder(locationData: LocationData): string {
    let url = airnowProxyURL;
    url += '?latitude=' + encodeURIComponent(locationData.lat);
    url += '&longitude=' + encodeURIComponent(locationData.lng);
    return url;
  }, 'Air.urlBuilder'),

  showAirQuality: function showAirQuality(): void {
    Location.getLocation()
      .then(Air.urlBuilder)
      .then((url: string) => {
        return util.requestPromise(url, cacheDuration, backupDuration);
      })
      .then(function(data: any) {
        if (data[0].Category.Number > 2) {
          const message = 'Air Quality: ' + data[0].Category.Name;
          Air.dom.text(message);
        }
      });
  }

};

export function main(): void {
  Air.showAirQuality();
}
