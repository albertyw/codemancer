import $ = require('jquery');

require('./rollbar');
require('./google');
import clock = require('./clock');
$(clock.style);

import weather = require('./weather');
import location = require('./location');
$(weather.main);
$(location.load);

import demo = require('./demo');
demo.bindDemo();

require('./calendar');
require('./logfit');

import pageRefresher = require('./refresh');
pageRefresher();

import air = require('./air');
$(air.main);
