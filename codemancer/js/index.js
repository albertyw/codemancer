require('./rollbar');
require('./google');
require('./clock');

const runOnload = require('./util').runOnload;
const loadWeather = require('./weather').load;
runOnload(loadWeather);

const demo = require('./demo');
require('./calendar');
require('./logfit');

const pageRefresher = require('./refresh');
pageRefresher();
window.toggleDemo = demo.toggleDemo;
