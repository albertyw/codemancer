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

const runOnLoad = require('./util').runOnLoad;
const weather = require('./weather');
runOnLoad(weather);

const pageRefresher = require('./refresh');
const demo = require('./demo');
require('./calendar');

pageRefresher();
window.toggleDemo = demo.toggleDemo;
