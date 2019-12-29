const Rollbar = require('rollbar');
const console = require('console');

const rollbarClientAccess = process.env.ROLLBAR_CLIENT_ACCESS;
const rollbarServerAccess = process.env.ROLLBAR_SERVER_ACCESS;
const rollbarMock = {
  error: function(e) { console.error(e); },
  errorHandler: function() {
    return (err, req, res, next) => {
      this.error(err);
      return next(err, req, res);
    };
  },
};
let rollbarAccess = undefined;
let rollbarClient = undefined;

function getRollbar(rollbarAccess) {
  if (!rollbarAccess) {
    return rollbarMock;
  }

  const rollbarConfig = {
    accessToken: process.env.ROLLBAR_CLIENT_ACCESS,
    captureUncaught: true,
    payload: {
      environment: process.env.ENV,
    }
  };
  return Rollbar.init(rollbarConfig);
}

function getRollbarAccess() {
  if (typeof window === 'undefined') {
    rollbarAccess = rollbarServerAccess;
  } else {
    rollbarAccess = rollbarClientAccess;
  }
  return rollbarAccess;
}

function setupRollbar() {
  const access = getRollbarAccess();
  rollbarClient = getRollbar(access);
}
setupRollbar();

module.exports = rollbarClient;
