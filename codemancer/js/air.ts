import $ from 'jquery';

import {Location} from './location.js';
import {LocationData} from '../../server/location.js';
import {requestPromise} from './util.js';

const airnowProxyURL = '/airnow/';
const cacheDuration = 20 * 60 * 1000;
const backupDuration = 3 * 60 * 60 * 1000;

export const Air = {
  dom: $('#air-message'),

  // TODO: add varsnap here
  urlBuilder: function urlBuilder(locationData: LocationData): string {
    let url = airnowProxyURL;
    url += '?latitude=' + encodeURIComponent(locationData.lat);
    url += '&longitude=' + encodeURIComponent(locationData.lng);
    return url;
  },

  showAirQuality: function showAirQuality(): void {
    Location.getLocation()
      .then(Air.urlBuilder)
      .then((url: string) => {
        return requestPromise(url, cacheDuration, backupDuration);
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
