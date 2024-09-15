import $ from 'jquery';
import SunCalc from 'suncalc';

import getRollbar from './rollbar.js';
import {getMockDate} from './util.js';
import varsnap from './varsnap.js';
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
  '1440':[0,0,0]
};

let colorsTimestamp = Object.keys(colors);
let updateBackgroundColorPeriod = 5 * 60 * 1000;
let updateBackgroundColorInterval: number|undefined = undefined;

export function changeUpdateBackgroundColorPeriod(period: number): number {
  const original = updateBackgroundColorPeriod;
  updateBackgroundColorPeriod = period;
  return original;
}

const generateColorsArray = function generateColorsArray(){
  location.getLocation()
    .then((locationData: LocationData) => {
      const times = SunCalc.getTimes(new Date(), locationData.lat, locationData.lng);
      const sunriseDate = new Date(times.sunrise.toLocaleString('en-US', {timeZone: locationData.timezone}));
      const sunsetDate = new Date(times.sunset.toLocaleString('en-US', {timeZone: locationData.timezone}));
      const sunrise = dateToMinutes(sunriseDate);
      const sunset = dateToMinutes(sunsetDate);
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
      updateBackgroundColor();
    })
    .catch((error) => {
      getRollbar().error(error);
    });
};

const dateToMinutes = function dateToMinutes(date) {
  const timestamp = date.getHours() * 60 + date.getMinutes();
  return timestamp;
};

const componentToHex = varsnap(function componentToHex(c) {
  const hex = c.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
});

const rgbToHex = varsnap(function rgbToHex(r, g, b) {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
});

function currentTimestamp() {
  const currentDate = getMockDate();
  return dateToMinutes(currentDate);
}

const getCurrentColor = function getCurrentColor(current) {
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
  return rgbToHex(currentColor[0], currentColor[1], currentColor[2]);
};

export function updateBackgroundColor(): void {
  const current = currentTimestamp();
  const currentColor = getCurrentColor(current);
  document.body.style.backgroundColor = currentColor;
  if (updateBackgroundColorInterval === undefined) {
    updateBackgroundColorInterval = window.setInterval(function() {
      updateBackgroundColor();
    }, updateBackgroundColorPeriod);
  }
}

updateBackgroundColor();
$(generateColorsArray);
