import {expect} from require('chai');

import pageRefresher = require('../codemancer/js/refresh');

describe('pageRefresher', () => {
  it('returns a refresh time', () => {
    const timer = pageRefresher();
    expect(timer).to.be.at.least(0);
  });
});
