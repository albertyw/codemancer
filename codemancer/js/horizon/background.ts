import suncalc from 'suncalc';

import renderGradient from './gradient.js';
import { location } from '../location.js';
import { targetLocation, LocationData } from '../../../server/location.js';
import { getMockDate } from '../util.js';

export class BackgroundColor {
  locationData: LocationData = targetLocation;

  #updateInterval: number | undefined = undefined;
  #updatePeriod: number = 5 * 60 * 1000; // 5 minutes

  update(): void {
    const sunPos = suncalc.getPosition(getMockDate(), this.locationData.lat, this.locationData.lng);

    const [gradient, topVec, bottomVec] = renderGradient(sunPos.altitude);

    const top = `rgb(${topVec[0]}, ${topVec[1]}, ${topVec[2]})`;
    const bottom = `rgb(${bottomVec[0]}, ${bottomVec[1]}, ${bottomVec[2]})`;
    console.log('Background gradient:', { gradient, top, bottom });

    document.getElementsByTagName('body')[0].style.background = gradient;

    this.setupRefresh();
  }

  setupRefresh(): void {
    if (this.#updateInterval !== undefined) {
      window.clearInterval(this.#updateInterval);
    }
    this.#updateInterval = window.setInterval(() => {
      this.update();
    }, this.#updatePeriod);
  }

  changeUpdateBackgroundColorPeriod(newPeriod: number): number {
    const originalUpdatePeriod = this.#updatePeriod;
    this.#updatePeriod = newPeriod;
    this.setupRefresh();
    return originalUpdatePeriod;
  }
}

export const backgroundColor = new BackgroundColor();

export function load() {
  location.getLocation().then((locationData: LocationData) => {
    backgroundColor['locationData'] = locationData;
    backgroundColor.update();
  });
}
