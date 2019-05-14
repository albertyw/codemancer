const expect = require('chai').expect;

const clock = require('../codemancer/js/clock');

describe('Clock.weekdays', function() {
  it('has weekdays', () => {
    expect(clock.Clock.weekdays.length).to.equal(7);
  });
});

describe('Clock.months', function() {
  it('has months', () => {
    expect(clock.Clock.months.length).to.equal(12);
  });
});
