const expect = require('chai').expect;

const clock = require('../codemancer/js/clock');

describe('Clock.weekdays', () => {
  it('has weekdays', () => {
    expect(clock.Clock.weekdays.length).to.equal(7);
  });
});

describe('Clock.months', () => {
  it('has months', () => {
    expect(clock.Clock.months.length).to.equal(12);
  });
});

describe('Clock.prependZero', () => {
  it('prepends zero when needed', () => {
    expect(clock.Clock.prependZero(1)).to.equal('01');
    expect(clock.Clock.prependZero(9)).to.equal('09');
    expect(clock.Clock.prependZero(10)).to.equal('10');
    expect(clock.Clock.prependZero(90)).to.equal('90');
    expect(clock.Clock.prependZero(100)).to.equal('100');
  });
});
