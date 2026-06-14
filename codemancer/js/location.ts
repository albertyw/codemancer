import $ from 'jquery';

import getRollbar from './rollbar.js';
import { requestPromise } from './util.js';
import { LocationData } from '../../server/location.js';

const baseURL = '/location/';
const cacheDuration = 24 * 60 * 60 * 1000;
const backupDuration = 7 * 24 * 60 * 60 * 1000;

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
      const params = new URLSearchParams({
        latitude: coordinates.latitude.toString(),
        longitude: coordinates.longitude.toString(),
      });
      const url = `${baseURL}?${params.toString()}`;
      return requestPromise(url, cacheDuration, backupDuration);
    }).then((data) => {
      return data;
    }, (error) => {
      getRollbar().error('Failed to geocode', error);
      return {};
    }).catch((error) => {
      getRollbar().error('Failed to geocode', error);
      return {};
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
