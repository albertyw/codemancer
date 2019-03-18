const Rollbar = require('rollbar');
const console = require('console');

const rollbarMock = {
    error: function(e) { console.error(e); }
};
let rollbarClient = undefined;

function getRollbar() {
    if (!process.env.ROLLBAR_CLIENT_ACCESS) {
        rollbarClient = rollbarMock;
    }
    if (rollbarClient) {
        return rollbarClient;
    }

    const rollbarConfig = {
        accessToken: process.env.ROLLBAR_CLIENT_ACCESS,
        captureUncaught: true,
        payload: {
            environment: process.env.ENVIRONMENT,
        }
    };
    rollbarClient = Rollbar.init(rollbarConfig);
    return rollbarClient;
}

getRollbar();

module.exports = rollbarClient;
