const rollbar = require('rollbar-browser');
var rollbarConfig = {
    accessToken: process.env.ROLLBAR_CLIENT_ACCESS,
    captureUncaught: true,
    payload: {
        environment: process.env.ENVIRONMENT,
    }
};
const Rollbar = rollbar.init(rollbarConfig);
window.Rollbar = Rollbar;

require('./google');
require('./clock');

const runOnload = require('./util').runOnload;
const weather = require('./weather');
runOnload(weather);

const demo = require('./demo');
require('./calendar');
require('./logfit');

const pageRefresher = require('./refresh');
pageRefresher();
window.toggleDemo = demo.toggleDemo;
