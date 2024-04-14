import varsnap from 'varsnap';

varsnap.updateConfig({
  varsnap: process.env.VARSNAP === 'true',
  env: process.env.ENV,
  branch: process.env.GIT_BRANCH,
  producerToken: process.env.VARSNAP_PRODUCER_TOKEN,
  consumerToken: process.env.VARSNAP_CONSUMER_TOKEN,
});

export default varsnap;
