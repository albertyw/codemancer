import '../css/animations.css';
import '../css/application.css';
import '../css/weather.css';

import $ = require('jquery');

require('./rollbar');
import clock = require('./clock');
$(clock.style);

import weather = require('./weather');
import location = require('./location');
$(weather.main);
$(location.load);

import demo = require('./demo');
demo.bindDemo();

require('./logfit');
require('./ganalytics');

import pageRefresher = require('./refresh');
pageRefresher();

import air = require('./air');
$(air.main);
