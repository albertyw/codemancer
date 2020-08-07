import $ = require('jquery');

import util = require('./util');
import varsnap = require('./varsnap');

const sunRiseSetAPI = 'https://api.sunrise-sunset.org/json?lat=37.778519&lng=-122.40564&formatted=0';
const sunRiseSetExpiration = 24 * 60 * 60 * 1000;

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

const generateColorsArray = varsnap(function generateColorsArray(){
  util.requestPromise(sunRiseSetAPI, sunRiseSetExpiration)
    .then((xhrData) => {
      const data = parseData(xhrData);
      const sunrise = dateToMinutes(data['sunrise']);
      const sunset = dateToMinutes(data['sunset']);
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
      console.error(error);
    });
});

const parseData = varsnap(function parseData(data) {
  data = data.results;
  Object.keys(data).forEach(function(key) {
    if (key !== 'day_length') {
      data[key] = new Date(data[key]);
    }
  });
  return data;
});

const dateToMinutes = varsnap(function dateToMinutes(date) {
  const timestamp = date.getHours() * 60 + date.getMinutes();
  return timestamp;
});

const componentToHex = varsnap(function componentToHex(c) {
  const hex = c.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
});

const rgbToHex = varsnap(function rgbToHex(r, g, b) {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
});

function currentTimestamp() {
  const currentDate = util.getMockDate();
  return dateToMinutes(currentDate);
}

const getCurrentColor = varsnap(function getCurrentColor(current) {
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
});

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
