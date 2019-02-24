const expect = require('chai').expect;

const pageRefresher = require('../codemancer/js/refresh');

describe('pageRefresher', () => {
    it('returns a refresh time', () => {
        const timer = pageRefresher();
        expect(timer).to.be.at.least(0);
    });
});
