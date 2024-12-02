import '../css/animations.css';
import '../css/application.css';
import '../css/weather.css';

import $ from 'jquery';

import getRollbar from './rollbar.js';
getRollbar();

import { prepare as backgroundColorPrepare } from './background.js';
backgroundColorPrepare();

import { load as backgroundColorLoad } from './background.js';
import { load as clockLoad } from './clock.js';
import { load as weatherLoad } from './weather.js';
import { load as locationLoad } from './location.js';
$(backgroundColorLoad);
$(clockLoad);
$(weatherLoad);
$(locationLoad);

import bindDemo from './demo.js';
bindDemo();

import './logfit.js';
import './ganalytics.js';

import pageRefresher from './refresh.js';
pageRefresher();

import { load as airLoad } from './air.js';
$(airLoad);
