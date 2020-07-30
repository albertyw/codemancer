import LogFit = require('logfit');

if (process.env.LOGFIT_TOKEN) {

  const LogFitConfig = {
    source: process.env.LOGFIT_TOKEN,
  };

  const logfit = new LogFit(LogFitConfig);
  logfit.report();
}
