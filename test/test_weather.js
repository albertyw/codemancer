const expect = require('chai').expect;
const Q = require('q');

const weather = require('../codemancer/js/weather');
const Location = require('../codemancer/js/location');
const weatherFixture = require('./weather_fixture.json');

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

describe('Weather.parse', () => {
  it('returns data', () => {
    return Q.fcall(() => { return weatherFixture; }).then(weather.Weather.parse).then((data) => {
      // expect(data.city).to.not.be.empty;
      expect(data.currentTemp).to.equal(54);
      expect(data.minTemp).to.equal(52);
      expect(data.maxTemp).to.equal(57);
      expect(data.conditionSequence).to.not.be.empty;
    });
  });
});
