import $ = require('jquery');

require('./rollbar');
require('./google');
import clock = require('./clock');
$(clock.start);

import weather = require('./weather');
import location = require('./location');
$(weather.load);
$(location.load);

import demo = require('./demo');
demo.bindDemo();

require('./calendar');
require('./logfit');

import pageRefresher = require('./refresh');
pageRefresher();
