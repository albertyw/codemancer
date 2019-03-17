const rollbar = require('rollbar-browser');

let Rollbar = undefined;

function getRollbar() {
    if (!process.env.ROLLBAR_CLIENT_ACCESS) {
        return undefined;
    }
    if (Rollbar) {
        return Rollbar;
    }

    const rollbarConfig = {
        accessToken: process.env.ROLLBAR_CLIENT_ACCESS,
        captureUncaught: true,
        payload: {
            environment: process.env.ENVIRONMENT,
        }
    };
    Rollbar = rollbar.init(rollbarConfig);
    return Rollbar;
}

getRollbar();

module.exports = Rollbar;
