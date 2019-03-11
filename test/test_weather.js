const expect = require('chai').expect; // eslint-disable-line no-unused-vars

const weather = require('../codemancer/js/weather'); // eslint-disable-line no-unused-vars

describe('Weather.urlBuilder', () => {
    it('has a targetLocation', () => {
        expect(weather.targetLocation.wfo).to.not.be.empty;
        expect(weather.targetLocation.x).to.not.be.empty;
        expect(weather.targetLocation.y).to.not.be.empty;
    });
    it('returns a url', () => {
        const url = weather.Weather.urlBuilder(weather.targetLocation);
        expect(url).to.contain('api.weather.gov');
    });
});
