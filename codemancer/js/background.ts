import SunCalc from 'suncalc';

import getRollbar from './rollbar.js';
import {getMockDate} from './util.js';
import { location } from './location.js';
import { LocationData } from '../../server/location.js';

const fullNight = [0, 0, 0];
const fullDay = [0, 204, 255];
const brightEvening = [255, 110, 30];
const midEvening = [255, 155, 0];
const lateEvening = [0, 0, 255];

const colors = {
  '0':[0,0,0],
  '235':[0,0,0],
  '295':[0,0,255],
  '355':[255,155,0],
  '415':[255,110,30],
  '475':[0,204,255],
  '1096':[0,204,255],
  '1156':[255,110,30],
  '1216':[255,155,0],
  '1276':[0,0,255],
  '1336':[0,0,0],
  '1440':[0,0,0],
};

let colorsTimestamp = Object.keys(colors);

export class BackgroundColor {
  #updatePeriod = 5 * 60 * 1000;
  #updateInterval: number|undefined = undefined;

  changeUpdateBackgroundColorPeriod(period: number): number {
    const original = this.#updatePeriod;
    this.#updatePeriod = period;
    return original;
  }

  generateColorsArray(): void {
    location.getLocation()
      .then((locationData: LocationData) => {
        const times = SunCalc.getTimes(new Date(), locationData.lat, locationData.lng);
        const sunriseDate = new Date(times.sunrise.toLocaleString('en-US', {timeZone: locationData.timezone}));
        const sunsetDate = new Date(times.sunset.toLocaleString('en-US', {timeZone: locationData.timezone}));
        const sunrise = BackgroundColor.dateToMinutes(sunriseDate);
        const sunset = BackgroundColor.dateToMinutes(sunsetDate);
        colors[(sunrise - 120).toString()] = fullNight;
        colors[(sunrise - 60).toString()] = lateEvening;
        colors[sunrise.toString()] = midEvening;
        colors[(sunrise + 60).toString()] = brightEvening;
        colors[(sunrise + 120).toString()] = fullDay;
        colors[(sunset - 120).toString()] = fullDay;
        colors[(sunset - 60).toString()] = brightEvening;
        colors[sunset.toString()] = midEvening;
        colors[(sunset + 60).toString()] = lateEvening;
        colors[(sunset + 120).toString()] = fullNight;
        colorsTimestamp = Object.keys(colors);
        this.update();
      })
      .catch((error) => {
        getRollbar().error(error);
      });
  }

  static dateToMinutes(date): number {
    const timestamp = date.getHours() * 60 + date.getMinutes();
    return timestamp;
  }

  // TODO: add varsnap here
  static componentToHex(c) {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }

  // TODO: add varsnap here
  static rgbToHex(r, g, b) {
    return '#' + BackgroundColor.componentToHex(r) + BackgroundColor.componentToHex(g) + BackgroundColor.componentToHex(b);
  }

  static currentTimestamp() {
    const currentDate = getMockDate();
    return BackgroundColor.dateToMinutes(currentDate);
  }

  static getCurrentColor(current) {
    let before = 0;
    let after = 0;
    for (let i=0; i<colorsTimestamp.length; i++) {
      if (colorsTimestamp[i] <= current && colorsTimestamp[i+1] > current) {
        before = parseInt(colorsTimestamp[i], 10);
        after = parseInt(colorsTimestamp[i+1], 10);
        break;
      }
    }
    const percentage = (current - before) / (after - before);
    const colorBefore = colors[before];
    const colorAfter = colors[after];
    const currentColor = [0, 0, 0];
    for (let i=0; i<colorBefore.length; i++) {
      currentColor[i] = colorBefore[i] + (colorAfter[i] - colorBefore[i]) * percentage;
      currentColor[i] = Math.round(currentColor[i]);
    }
    return BackgroundColor.rgbToHex(currentColor[0], currentColor[1], currentColor[2]);
  }

  update(): void {
    const current = BackgroundColor.currentTimestamp();
    const currentColor = BackgroundColor.getCurrentColor(current);
    document.body.style.backgroundColor = currentColor;
    if (this.#updateInterval === undefined) {
      this.#updateInterval = window.setInterval(() => {
        this.update();
      }, this.#updatePeriod);
    }
  }
}

export const backgroundColor = new BackgroundColor();

export function prepare(): void {
  backgroundColor.update();
}

export function load(): void {
  backgroundColor.generateColorsArray();
}
