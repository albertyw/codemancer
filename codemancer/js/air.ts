import $ from 'jquery';
import varsnap from 'varsnap';

import {location} from './location.js';
import {LocationData} from '../../server/location.js';
import {AirnowResponse} from '../../server/handlers.js';
import {requestPromise} from './util.js';

const airnowProxyURL = '/airnow/';
const cacheDuration = 20 * 60 * 1000;
const backupDuration = 3 * 60 * 60 * 1000;

export class Air {
  #dom = $('#air-message');

  // TODO: add varsnap here
  static #urlBuilder(locationData: LocationData): string {
    let url = airnowProxyURL;
    url += '?latitude=' + encodeURIComponent(locationData.lat);
    url += '&longitude=' + encodeURIComponent(locationData.lng);
    return url;
  }

  @varsnap.decorate
  showAirQuality(): void {
    const dom = this.#dom;
    location.getLocation()
      .then(Air.#urlBuilder)
      .then((url: string) => {
        return <Promise<AirnowResponse[]>>requestPromise(url, cacheDuration, backupDuration);
      })
      .then(function(data: AirnowResponse[]) {
        if (data[0].Category.Number > 2) {
          const message = 'Air Quality: ' + data[0].Category.Name;
          dom.text(message);
        }
      });
  }

}

export function load(): void {
  const air = new Air();
  air.showAirQuality();
}
