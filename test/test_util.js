const expect = require('chai').expect; // eslint-disable-line no-unused-vars

const util = require('../codemancer/js/util'); // eslint-disable-line no-unused-vars

describe('toggleDemo', () => {
  let demoStatus = util.toggleDemo();
  expect(demoStatus).to.be.true;
  demoStatus = util.toggleDemo();
  expect(demoStatus).to.be.false;
});
