const expect = require('chai').expect; // eslint-disable-line no-unused-vars

const pageRefresher = require('../codemancer/js/refresh'); // eslint-disable-line no-unused-vars

describe('pageRefresher', () => {
    it('returns a refresh time', () => {
        const timer = pageRefresher();
        expect(timer).to.be.at.least(0);
    });
});
