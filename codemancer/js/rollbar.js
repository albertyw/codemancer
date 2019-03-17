const rollbar = require('rollbar-browser');
const console = require('console');

const RollbarMock = {
    error: function(e) { console.error(e); }
};
let Rollbar = undefined;

function getRollbar() {
    if (!process.env.ROLLBAR_CLIENT_ACCESS) {
        Rollbar = RollbarMock;
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
