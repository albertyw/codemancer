import $ from 'jquery';

import { backgroundColor } from './horizon/background.js';
import { clock } from './clock.js';
import { toggleDemo } from './util.js';
import { weather } from './weather.js';

let originalUpdateBackgroundColorPeriod = 1000;
let originalUpdateClockPeriod = 1000;

function startDemo() {
  const demoPeriod = 1000 / 6; // 6 updates per second; 1 update per 10 minutes of demo time
  originalUpdateBackgroundColorPeriod = backgroundColor.changePeriod(demoPeriod);
  originalUpdateClockPeriod = clock.changePeriod(demoPeriod);
  weather.hide();
}

function stopDemo() {
  backgroundColor.changePeriod(originalUpdateBackgroundColorPeriod);
  clock.changePeriod(originalUpdateClockPeriod);
  weather.load();
}

function toggleDemoClick() {
  const demoOn = toggleDemo();
  if (demoOn) {
    startDemo();
  } else {
    stopDemo();
  }
}

export default function bindDemo(): void {
  $('#toggle_demo').click(toggleDemoClick);
}
