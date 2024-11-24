import Rollbar from 'rollbar';

const rollbarClientAccess = process.env.ROLLBAR_CLIENT_ACCESS;
const rollbarServerAccess = process.env.ROLLBAR_SERVER_ACCESS;
const rollbarMock = {
  error: function(...e) {
    console.error(e);
  },
  errorHandler: function() {
    return (err, req, res, next) => {
      this.error(err);
      return next(err, req, res);
    };
  },
};

function getRollbarAccess() {
  if (typeof window === 'undefined') {
    return rollbarServerAccess;
  }
  return rollbarClientAccess;
}

let rollbarClient = undefined;

export default function getRollbar() {
  if (rollbarClient) {
    return rollbarClient;
  }
  const rollbarAccess = getRollbarAccess();
  if (!rollbarAccess) {
    return rollbarMock;
  }

  const rollbarConfig = {
    accessToken: process.env.ROLLBAR_CLIENT_ACCESS,
    captureUncaught: true,
    captureUnhandledRejections: true,
    payload: {
      environment: process.env.ENV,
      client: {
        javascript: {
          source_map_enabled: true,
          code_version: process.env.GIT_VERSION,
          guess_uncaught_frames: true,
        },
      },
    }
  };
  rollbarClient = Rollbar.init(rollbarConfig);
  return rollbarClient;
}
