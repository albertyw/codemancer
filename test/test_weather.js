const expect = require('chai').expect;

const weather = require('../codemancer/js/weather');
const Location = require('../codemancer/js/location');

describe('Weather.urlBuilder', () => {
    it('returns a url', () => {
        const url = weather.Weather.urlBuilder(Location.targetLocation);
        expect(url).to.contain('api.weather.gov');
        expect(url).to.contain(Location.targetLocation.wfo);
        expect(url).to.contain(Location.targetLocation.x);
        expect(url).to.contain(Location.targetLocation.y);
    });
});
