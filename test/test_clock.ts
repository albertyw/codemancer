import {expect} from 'chai';
import { Clock, TimeParts } from '../codemancer/js/clock.js';

describe('Clock.weekdays', () => {
  it('has weekdays', () => {
    expect(Clock.weekdays.length).to.equal(7);
  });
});

describe('Clock.months', () => {
  it('has months', () => {
    expect(Clock.months.length).to.equal(12);
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
