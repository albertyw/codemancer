const LogFit = require('logfit');

var LogFitConfig = {
    source: process.env.LOGFIT_TOKEN,
};

const logfit = new LogFit(LogFitConfig);
logfit.report();
