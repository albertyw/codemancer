import $ from 'jquery';

import {location} from './location.js';
import {LocationData} from '../../server/location.js';
import getRollbar from './rollbar.js';
import {requestPromise} from './util.js';

const airnowProxyURL = '/airnow/';
const cacheDuration = 20 * 60 * 1000;
const backupDuration = 3 * 60 * 60 * 1000;

interface AirQualityResponse {
  current: {
    us_aqi: number;
  };
}

// US AQI breakpoints per EPA standard
function aqiCategoryName(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

export class Air {
  #dom = $('#air-message');

  // TODO: add varsnap here
  static #urlBuilder(locationData: LocationData): string {
    let url = airnowProxyURL;
    url += '?latitude=' + encodeURIComponent(locationData.lat);
    url += '&longitude=' + encodeURIComponent(locationData.lng);
    return url;
  }

  load(locationData: Promise<LocationData>): void {
    const dom = this.#dom;
    locationData
      .then(Air.#urlBuilder)
      .then((url: string): Promise<AirQualityResponse> => {
        return <Promise<AirQualityResponse>>requestPromise(url, cacheDuration, backupDuration);
      })
      .then(function(data: AirQualityResponse) {
        if (!data?.current || typeof data.current.us_aqi !== 'number') {
          getRollbar().error('Unexpected air quality response', data);
          return;
        }
        const aqi = data.current.us_aqi;
        if (aqi > 100) {
          dom.text('Air Quality: ' + aqiCategoryName(aqi));
        }
      });
  }

}

export const air = new Air();

export function load(): void {
  air.load(location.getLocation());
}
