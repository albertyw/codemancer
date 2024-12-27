import SunCalc from 'suncalc';

import getRollbar from './rollbar.js';
import {getMockDate} from './util.js';
import { location } from './location.js';
import { LocationData } from '../../server/location.js';

type Color = [number, number, number];
const fullNight: Color = [0, 0, 0];
const fullDay: Color = [0, 204, 255];
const brightEvening: Color = [255, 110, 30];
const midEvening: Color = [255, 155, 0];
const lateEvening: Color = [0, 0, 255];

export class BackgroundColor {
  #colors: {[key: string]: Color} = {
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
  #colorsTimestamp = Object.keys(this.#colors);

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
        this.#colors[(sunrise - 120).toString()] = fullNight;
        this.#colors[(sunrise - 60).toString()] = lateEvening;
        this.#colors[sunrise.toString()] = midEvening;
        this.#colors[(sunrise + 60).toString()] = brightEvening;
        this.#colors[(sunrise + 120).toString()] = fullDay;
        this.#colors[(sunset - 120).toString()] = fullDay;
        this.#colors[(sunset - 60).toString()] = brightEvening;
        this.#colors[sunset.toString()] = midEvening;
        this.#colors[(sunset + 60).toString()] = lateEvening;
        this.#colors[(sunset + 120).toString()] = fullNight;
        this.#colorsTimestamp = Object.keys(this.#colors);
        this.update();
      })
      .catch((error) => {
        getRollbar().error(error);
      });
  }

  static dateToMinutes(date: Date): number {
    const timestamp = date.getHours() * 60 + date.getMinutes();
    return timestamp;
  }

  // TODO: add varsnap here
  static componentToHex(c: number): string {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }

  // TODO: add varsnap here
  static rgbToHex(r: number, g: number, b: number): string {
    return '#' + BackgroundColor.componentToHex(r) + BackgroundColor.componentToHex(g) + BackgroundColor.componentToHex(b);
  }

  static currentTimestamp(): number {
    const currentDate = getMockDate();
    return BackgroundColor.dateToMinutes(currentDate);
  }

  getCurrentColor(current: number): string {
    let before = 0;
    let after = 0;
    for (let i=0; i<this.#colorsTimestamp.length; i++) {
      before = parseInt(this.#colorsTimestamp[i], 10);
      after = parseInt(this.#colorsTimestamp[i+1], 10);
      if (before <= current && after > current) {
        break;
      }
    }
    const percentage = (current - before) / (after - before);
    const colorBefore = this.#colors[before];
    const colorAfter = this.#colors[after];
    const currentColor = [0, 0, 0];
    for (let i=0; i<colorBefore.length; i++) {
      currentColor[i] = colorBefore[i] + (colorAfter[i] - colorBefore[i]) * percentage;
      currentColor[i] = Math.round(currentColor[i]);
    }
    return BackgroundColor.rgbToHex(currentColor[0], currentColor[1], currentColor[2]);
  }

  update(): void {
    const current = BackgroundColor.currentTimestamp();
    const currentColor = this.getCurrentColor(current);
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
