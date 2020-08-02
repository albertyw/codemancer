import {expect} from require('chai');
import varsnap = require('varsnap');

require('../codemancer/js/background');
// require('../server/util');

context('Varsnap', function() {
  this.timeout(30 * 1000);
  it('runs with production', async function() {
    const status = await varsnap.runTests();
    expect(status).to.be.true;
  });
});
