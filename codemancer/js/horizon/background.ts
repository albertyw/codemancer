import * as suncalc from 'suncalc';

import renderGradient from './gradient.js';
import { location, targetLocation } from '../location.js';
import { LocationData } from '../../../server/location.js';
import { getMockDate } from '../util.js';

export class BackgroundColor {
  locationData: LocationData = targetLocation;

  #updateInterval: number | undefined = undefined;
  #updatePeriod: number = 5 * 60 * 1000; // 5 minutes

  #update(): void {
    const sunPos = suncalc.getPosition(getMockDate(), this.locationData.lat, this.locationData.lng);

    const altitudeRadians = sunPos.altitude / 360 * 2 * Math.PI;
    const [gradient, topVec, bottomVec] = renderGradient(altitudeRadians);

    const top = `rgb(${topVec[0]}, ${topVec[1]}, ${topVec[2]})`;
    const bottom = `rgb(${bottomVec[0]}, ${bottomVec[1]}, ${bottomVec[2]})`;
    console.log('Background gradient:', { gradient, top, bottom });

    document.getElementsByTagName('body')[0].style.background = gradient;
  }

  start(): void {
    if (this.#updateInterval !== undefined) {
      window.clearInterval(this.#updateInterval);
    }
    this.#update();
    this.#updateInterval = window.setInterval(() => {
      this.#update();
    }, this.#updatePeriod);
  }

  changePeriod(newPeriod: number): number {
    const originalUpdatePeriod = this.#updatePeriod;
    this.#updatePeriod = newPeriod;
    this.start();
    return originalUpdatePeriod;
  }
}

export const backgroundColor = new BackgroundColor();

export function updateBackground(locationData: Promise<LocationData>): void {
  locationData.then((data: LocationData) => {
    backgroundColor.locationData = data;
    backgroundColor.start();
  });
}

export function load() {
  updateBackground(location.getLocation());
}
