import $ from 'jquery';

import { BackgroundColor } from './background.js';
import { toggleDemo } from './util.js';

let originalUpdateBackgroundColorPeriod = 1000;

function startDemo() {
  originalUpdateBackgroundColorPeriod = BackgroundColor.changeUpdateBackgroundColorPeriod(500);
}

function stopDemo() {
  BackgroundColor.changeUpdateBackgroundColorPeriod(originalUpdateBackgroundColorPeriod);
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
