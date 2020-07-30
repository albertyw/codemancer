import process = require('process');
import varsnap = require('varsnap');

varsnap.updateConfig({
  varsnap: process.env.VARSNAP,
  env: process.env.ENV,
  producerToken: process.env.VARSNAP_PRODUCER_TOKEN,
  consumerToken: process.env.VARSNAP_CONSUMER_TOKEN,
});

module.exports = varsnap;
