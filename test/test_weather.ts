import {expect} from 'chai';
import sinon from 'sinon';

import getRollbar from '../codemancer/js/rollbar.js';
import { Weather } from '../codemancer/js/weather.js';

const weatherFixture = {
  current: {
    time: '2026-06-14T06:00',
    temperature_2m: 53,
    weathercode: 95,
  },
  hourly: {
    time: [
      '2026-06-14T00:00', '2026-06-14T01:00', '2026-06-14T02:00',
      '2026-06-14T03:00', '2026-06-14T04:00', '2026-06-14T05:00',
      '2026-06-14T06:00', '2026-06-14T07:00', '2026-06-14T08:00',
      '2026-06-14T09:00', '2026-06-14T10:00', '2026-06-14T11:00',
      '2026-06-14T12:00', '2026-06-14T13:00', '2026-06-14T14:00',
      '2026-06-14T15:00', '2026-06-14T16:00', '2026-06-14T17:00',
      '2026-06-14T18:00', '2026-06-14T19:00', '2026-06-14T20:00',
      '2026-06-14T21:00', '2026-06-14T22:00', '2026-06-14T23:00',
    ],
    temperature_2m: [
      54, 54, 53, 53, 53, 53, 53, 53, 54, 54, 55, 56,
      56, 57, 56, 56, 56, 55, 54, 54, 53, 52, 52, 52,
    ],
    weathercode: [
      61, 61, 61, 95, 95, 95, 95, 95, 95, 95, 95, 95,
      95, 95, 95, 80, 80, 80, 80, 80, 80, 51, 51, 51,
    ],
  },
};

describe('Weather.parse', () => {
  it('returns data', () => {
    const weather = new Weather();
    const data = weather.parse(weatherFixture);
    // currentTemp comes from the current block, not hourly[0].
    expect(data.currentTemp).to.equal(53);
    expect(data.minTemp).to.equal(52);
    expect(data.maxTemp).to.equal(57);
    // Thunderstorm (95) is the most severe code in the fixture.
    expect(data.worstCondition).to.equal(weather.conditionIcon(95));
    expect(data.conditionSequence).to.not.be.empty;
  });
});

describe('Weather.worstConditions', () => {
  it('returns the worst condition', () => {
    const weather = new Weather();
    // Higher code is more severe: thunderstorm (95) beats overcast (3) and clear (0).
    expect(weather.worstCondition([3, 95, 0])).to.equal(95);
  });
  it('returns undefined if there are no conditions', () => {
    const weather = new Weather();
    expect(weather.worstCondition([])).to.equal(undefined);
  });
});

describe('Weather.conditionIcon', () => {
  beforeEach(function() {
    this.weather = new Weather();
    this.rollbarError = sinon.spy(getRollbar(), 'error');
  });
  afterEach(function() {
    this.rollbarError.restore();
  });
  it('returns an icon for a known code', function() {
    expect(this.weather.conditionIcon(0)).to.not.equal('');
    expect(this.rollbarError.callCount).to.equal(0);
  });
  it('returns default icon and logs error for unknown code', function() {
    expect(this.weather.conditionIcon(999)).to.not.equal('');
    expect(this.rollbarError.calledWithExactly('cannot find icon for WMO code 999')).to.be.true;
  });
  it('returns icons for all defined WMO codes', function() {
    const knownCodes = [0,1,2,3,45,48,51,53,55,56,57,61,63,65,66,67,71,73,75,77,80,81,82,85,86,95,96,99];
    for (const code of knownCodes) {
      expect(this.weather.conditionIcon(code)).to.not.equal('', `code ${code}`);
    }
    expect(this.rollbarError.callCount).to.equal(0);
  });
});

describe('Weather.validate', () => {
  it('returns default for missing hourly', () => {
    const result = Weather.validate({} as any);
    expect(result.hourly.temperature_2m).to.deep.equal([0]);
  });
  it('returns default for empty arrays', () => {
    const result = Weather.validate({
      current: { time: '', temperature_2m: 0, weathercode: 0 },
      hourly: { time: [], temperature_2m: [], weathercode: [] },
    });
    expect(result.hourly.temperature_2m).to.deep.equal([0]);
  });
  it('returns data for valid response', () => {
    const result = Weather.validate(weatherFixture);
    expect(result).to.equal(weatherFixture);
  });
});
