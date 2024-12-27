import Rollbar from 'rollbar';

interface RollbarClient {
  error: (...e: any[]) => void;
  errorHandler: () => (err: any, req: any, res: any, next: any) => any;
}

const rollbarClientAccess = process.env.ROLLBAR_CLIENT_ACCESS;
const rollbarServerAccess = process.env.ROLLBAR_SERVER_ACCESS;
const rollbarMock: RollbarClient = {
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

let rollbarClient: RollbarClient|undefined = undefined;

export default function getRollbar(): RollbarClient {
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
    },
  };
  rollbarClient = Rollbar.init(rollbarConfig);
  return rollbarClient;
}
