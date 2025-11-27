import $ from 'jquery';

import { backgroundColor } from './horizon/background.js';
import { toggleDemo } from './util.js';

let originalUpdateBackgroundColorPeriod = 1000;

function startDemo() {
  originalUpdateBackgroundColorPeriod = backgroundColor.changeUpdateBackgroundColorPeriod(500);
}

function stopDemo() {
  backgroundColor.changeUpdateBackgroundColorPeriod(originalUpdateBackgroundColorPeriod);
}

function toggleDemoClick() {
  const demoOn = toggleDemo();
  if (demoOn) {
    stopDemo();
  } else {
    startDemo();
  }
}

export default function bindDemo(): void {
  $('#toggle_demo').click(toggleDemoClick);
}
