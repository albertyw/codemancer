const expect = require('chai').expect;
const sinon = require('sinon');

const Rollbar = require('../codemancer/js/rollbar');
const weather = require('../codemancer/js/weather');
const Location = require('../codemancer/js/location');
const weatherFixture = require('./weather_fixture.json');

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
    const data = weather.Weather.parse(weatherFixture);
    // expect(data.city).to.not.be.empty;
    expect(data.currentTemp).to.equal(54);
    expect(data.minTemp).to.equal(52);
    expect(data.maxTemp).to.equal(57);
    expect(data.worstCondition).to.equal('\uf00e');
    expect(data.conditionSequence).to.not.be.empty;
  });
});

describe('Weather.conditionIcon', () => {
  beforeEach(() => {
    sinon.spy(Rollbar, 'error');
  });
  afterEach(() => {
    Rollbar.error.restore();
  });
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
    const icon = weather.Weather.conditionIcon('asdf');
    expect(icon).to.equal('\uf04c');
    expect(Rollbar.error.calledWithExactly('cannot find image for "asdf"')).to.be.true;
  });
});
