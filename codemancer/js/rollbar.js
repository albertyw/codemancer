const rollbar = require('rollbar-browser');
const console = require('console');

let Rollbar = {
    error: function(e) { console.error(e); }
};

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
