import $ from 'jquery';

import getRollbar from './rollbar.js';
import { requestPromise } from './util.js';
import { LocationData } from '../../server/location.js';

const baseURL = '/location/';
const cacheDuration = 24 * 60 * 60 * 1000;
const backupDuration = 7 * 24 * 60 * 60 * 1000;

const sanFranciscoLocation: LocationData = {
  // Generated from https://api.weather.gov/points/37.78,-122.41
  wfo: 'MTR', x: '85', y: '105',
  lat: 37.78, lng: -122.41,
  timezone: 'America/Los_Angeles',
  displayName: '',
};
export const targetLocation = sanFranciscoLocation;
/*
const losAltosLocation: LocationData = {
  // Generated from https://api.weather.gov/points/37.39,-122.11
  wfo: 'MTR', x: '92', y: '86',
  lat: 37.39, lng: -122.11,
  timezone: 'America/Los_Angeles',
  displayName: '',
};
export const targetLocation = losAltosLocation;
*/


export class Location {
  #locationData: Promise<LocationData>|undefined = undefined;

  getLocation(): Promise<LocationData> {
    if (this.#locationData !== undefined) {
      return this.#locationData;
    }
    this.#locationData = new Promise<GeolocationCoordinates>((resolve, reject) => {
      return navigator.geolocation.getCurrentPosition((position) => {
        return resolve(position.coords);
      }, (error) => {
        getRollbar().error('Failed to get geolocation', error);
        reject(error);
      });
    }).then((coordinates: GeolocationCoordinates) => {
      const url = new URL(baseURL, window.location.href);
      url.searchParams.set('latitude', coordinates.latitude.toString());
      url.searchParams.set('longitude', coordinates.longitude.toString());
      return requestPromise(url.href, cacheDuration, backupDuration);
    }).catch((error) => {
      getRollbar().error('Failed to geocode', error);
      this.#locationData = undefined;
      return {displayName: ''} as LocationData;
    }) as Promise<LocationData>;
    return this.#locationData;
  }

  #renderLocation(location: LocationData): void {
    const cityElement = $('#city');
    cityElement.html(location.displayName);
  }

  showLocation(): void {
    this.getLocation().
      then(this.#renderLocation);
  }
}

export const location = new Location();

export function load(): void {
  location.showLocation();
}
