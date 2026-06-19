import '../css/animations.css';
import '../css/application.css';
import '../css/weather.css';

import $ from 'jquery';

import getRollbar from './rollbar.js';
getRollbar();

import { load as backgroundLoad, updateBackground } from './horizon/background.js';
$(backgroundLoad);

import { load as clockLoad, loadTimezone } from './clock.js';
import { load as weatherLoad, weather } from './weather.js';
import { load as locationLoad, location } from './location.js';
import { load as airLoad, air } from './air.js';
$(clockLoad);
$(weatherLoad);
$(locationLoad);

function refreshLocation(): void {
  const locationData = location.loadLocation();
  loadTimezone(locationData);
  updateBackground(locationData);
  weather.load(locationData).catch(error => { getRollbar().error(error); });
  air.load(locationData);
}

$(() => {
  $('#load_location').on('click', refreshLocation);

  if (navigator.permissions === undefined || navigator.permissions.query === undefined) {
    // Permissions API unavailable; fall back to cached/default location
    return;
  }

  navigator.permissions.query({ name: 'geolocation' }).then(result => {
    if (result.state === 'granted') {
      refreshLocation();
    }
  }).catch(() => {
    // Permissions API unavailable; fall back to cached/default location
  });
});

import bindDemo from './demo.js';
bindDemo();

import './logfit.js';
import './ganalytics.js';

import pageRefresher from './refresh.js';
pageRefresher();

$(airLoad);
