import {expect} from 'chai';
import { TimeParts } from '../codemancer/js/clock.js';

describe('TimeParts', () => {
  it('formats date in the given timezone', () => {
    const date = new Date('2024-03-15T20:00:00Z'); // noon PT (UTC-8)
    const parts = new TimeParts(date, 'America/Los_Angeles');
    expect(parts.dateFormatted()).to.equal('Friday, March 15');
  });
});

describe('timeParts.prependZero', () => {
  it('prepends zero when needed', () => {
    expect(TimeParts.prependZero(1, true)).to.equal('01');
    expect(TimeParts.prependZero(9, true)).to.equal('09');
    expect(TimeParts.prependZero(10, true)).to.equal('10');
    expect(TimeParts.prependZero(90, true)).to.equal('90');
    expect(TimeParts.prependZero(100, true)).to.equal('100');
  });
});
