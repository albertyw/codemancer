window.AppDate = Date;

const rollbar = require('rollbar-browser');
var rollbarConfig = {
    accessToken: window.ROLLBAR_ACCESS_TOKEN,
    captureUncaught: true,
    payload: {
        environment: window.ENVIRONMENT,
    }
};
const Rollbar = rollbar.init(rollbarConfig);
window.Rollbar = Rollbar;

require('./google');
require('./clock');
require('./weather');
require('./refresh');
const demo = require('./demo');
require('./calendar');

window.toggleDemo = demo.toggleDemo;
