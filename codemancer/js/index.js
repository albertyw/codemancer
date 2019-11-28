const $ = require('jquery');

require('./rollbar');
require('./google');
const clock = require('./clock');
$(clock.start);

const loadWeather = require('./weather').load;
$(loadWeather);

const demo = require('./demo');
require('./calendar');
require('./logfit');

const pageRefresher = require('./refresh');
pageRefresher();
window.toggleDemo = demo.toggleDemo;
