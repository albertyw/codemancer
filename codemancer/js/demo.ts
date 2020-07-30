import $ = require('jquery');

import background = require('./background');
import util = require('./util');

let originalUpdateBackgroundColorPeriod = 1000;

function startDemo() {
  originalUpdateBackgroundColorPeriod = background.changeUpdateBackgroundColorPeriod(500);
}

function stopDemo() {
  background.changeUpdateBackgroundColorPeriod(originalUpdateBackgroundColorPeriod);
}

function toggleDemo() { // eslint-disable-line no-unused-vars
  const demoOn = util.toggleDemo();
  if (demoOn) {
    stopDemo();
  } else {
    startDemo();
  }
}

export function bindDemo() {
  $('#toggle_demo').click(toggleDemo);
}
