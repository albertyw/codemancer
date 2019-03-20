const expect = require('chai').expect;

const weather = require('../codemancer/js/weather');
const Location = require('../codemancer/js/location');

describe('chainAccessor', () => {
    it('returns properties in an array', () => {
        const x = ['a', ['b', 'c']];
        expect(weather.chainAccessor(x, [0]), 'a');
        expect(weather.chainAccessor(x, [1]), ['b', 'c']);
        expect(weather.chainAccessor(x, [1, 0]), 'b');
    });
    it('returns properties in a map', () => {
        const x = {a: {b: 1, c: 2}};
        expect(weather.chainAccessor(x, ['a']), {b: 1, c: 2});
        expect(weather.chainAccessor(x, ['a', 'b']), 1);
    });
});

describe('Weather.urlBuilder', () => {
    it('returns a url', () => {
        const url = weather.Weather.urlBuilder(Location.targetLocation);
        expect(url).to.contain('api.weather.gov');
        expect(url).to.contain(Location.targetLocation.wfo);
        expect(url).to.contain(Location.targetLocation.x);
        expect(url).to.contain(Location.targetLocation.y);
    });
});
