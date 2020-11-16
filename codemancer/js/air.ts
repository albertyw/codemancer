import $ = require('jquery');

import {Location} from './location';
import util = require('./util');
import varsnap = require('./varsnap');

const airnowProxyURL = '/airnow/';
const cacheDuration = 20 * 60 * 1000;
const backupDuration = 3 * 60 * 60 * 1000;

export const Air = {
  dom: $('#air-message'),

  urlBuilder: varsnap(function urlBuilder(location) {
    let url = airnowProxyURL;
    url += '?latitude=' + encodeURIComponent(location.lat);
    url += '&longitude=' + encodeURIComponent(location.lng);
    return url;
  }),

  getAirQuality: function getAirQuality(): Promise<Record<string, unknown>> {
    const url = Air.urlBuilder(Location.targetLocation);
    return util.requestPromise(url, cacheDuration, backupDuration);
  },

  showAirQuality: function showAirQuality(): void {
    Air.getAirQuality().then(function(data: any) {
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
