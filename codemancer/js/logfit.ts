if (process.env.LOGFIT_TOKEN) {
  const LogFit = require('logfit');

  const LogFitConfig = {
    source: process.env.LOGFIT_TOKEN,
  };

  const logfit = new LogFit(LogFitConfig);
  logfit.report();
}
