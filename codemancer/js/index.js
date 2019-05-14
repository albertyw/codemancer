require('./rollbar');
require('./google');
const runOnload = require('./util').runOnload;
const clock = require('./clock');
runOnload(clock.start);

const loadWeather = require('./weather').load;
runOnload(loadWeather);

const demo = require('./demo');
require('./calendar');
require('./logfit');

const pageRefresher = require('./refresh');
pageRefresher();
window.toggleDemo = demo.toggleDemo;
