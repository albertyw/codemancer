const process = require('process');
const varsnap = require('varsnap');
varsnap.config = {
  varsnap: process.env.VARSNAP,
  env: process.env.ENVIRONMENT,
  producerToken: process.env.VARSNAP_PRODUCER_TOKEN,
  consumerToken: process.env.VARSNAP_CONSUMER_TOKEN,
};

module.exports = varsnap;
