import {expect} from 'chai';

import pageRefresher from '../codemancer/js/refresh.js';

describe('pageRefresher', () => {
  it('returns a refresh time', () => {
    const timer = pageRefresher();
    expect(timer).to.be.at.least(0);
  });
});
