import {expect} from 'chai';
import { TimeParts } from '../codemancer/js/clock.js';

describe('TimeParts.weekdays', () => {
  it('has weekdays', () => {
    expect(TimeParts.weekdays.length).to.equal(7);
  });
});

describe('TimeParts.months', () => {
  it('has months', () => {
    expect(TimeParts.months.length).to.equal(12);
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
