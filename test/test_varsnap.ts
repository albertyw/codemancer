import {expect} from 'chai';
import varsnap from 'varsnap';

// import '../codemancer/js/background.js';
// import '../server/util.js';

context('Varsnap', function() {
  this.timeout(30 * 1000);
  it('runs with production', async function() {
    const status = await varsnap.runTests();
    expect(status).to.be.true;
  });
});
