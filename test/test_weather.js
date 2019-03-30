const expect = require('chai').expect;
const Q = require('q');
const sinon = require('sinon');

const Rollbar = require('../codemancer/js/rollbar');
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

describe('Weather.conditionIcon', () => {
  it('returns an icon code', () => {
    const icon = weather.Weather.conditionIcon('Rain');
    expect(icon).to.equal('\uf008');
  });
  it('can strip descriptors', () => {
    const icon = weather.Weather.conditionIcon('Slight Chance Rain');
    expect(icon).to.equal('\uf008');
  });
  it('does not strip descriptors unless needed', () => {
    const icon1 = weather.Weather.conditionIcon('Cloudy');
    const icon2 = weather.Weather.conditionIcon('Mostly Cloudly');
    expect(icon1).to.not.equal(icon2);
  });
  it('returns a default icon code if condition is unknown', () => {
    sinon.spy(Rollbar, 'error');
    const icon = weather.Weather.conditionIcon('asdf');
    expect(icon).to.equal('\uf04c');
    expect(Rollbar.error.calledWithExactly('cannot find image for "asdf"')).to.be.true;
  });
});
