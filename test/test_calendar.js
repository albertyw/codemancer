const expect = require('chai').expect;
const sinon = require('sinon');

const calendar = require('../codemancer/js/calendar');
const calFixture = require('./calendar_fixture.json');

describe('formatTime', () => {
  beforeEach(() => {
    this.clock = sinon.useFakeTimers();
  });
  afterEach(() => {
    this.clock.restore();
  });
  it('should return a formatted time for today', () => {
    const d = new Date(2019, 2, 13, 22, 5);
    this.clock.tick(d.getTime());
    const f = calendar.formatTime(d, false);
    expect(f).to.equal('10:05 PM');
  });
  it('should return only the date when the time is allDay', () => {
    const d = new Date(2019, 2, 13, 22, 5);
    this.clock.tick(d.getTime());
    const f = calendar.formatTime(d, true);
    expect(f).to.equal('Today');
  });
});

describe('showCal', () => {
  it('should not show calendar if not owner', () => {
    const c = calFixture;
    c.accessRole = 'viewer';
    expect(calendar.showCal(c)).to.be.false;
  });

  it('should not show calendar if not selected', () => {
    const c = calFixture;
    c.selected = false;
    expect(calendar.showCal(c)).to.be.false;
  });

  it('should not show ignored calendars', () => {
    const c = calFixture;
    c.id = 'p#weather@group.v.calendar.google.com';
    expect(calendar.showCal(c)).to.be.false;
  });

  it('should show calendars by default', () => {
    const c = calFixture;
    c.accessRole = 'owner';
    c.selected = true;
    c.id = 'abcd@google.om';
    expect(calendar.showCal(calFixture)).to.be.true;
  });
});

describe('showCalEvent', () => {
  it('should show event if self has accepted invite', () => {
    const calEvent = calFixture['items'][0];
    calEvent.attendees = [{}];
    calEvent.attendees[0].self = true;
    calEvent.attendees[0].responseStatus = 'accepted';
    let show = calendar.showCalEvent(calEvent);
    expect(show).to.be.true;

    calEvent.attendees[0].responseStatus = 'declined';
    show = calendar.showCalEvent(calEvent);
    expect(show).to.be.false;
  });
  it('should show event based on organizer', () => {
    const calEvent = calFixture['items'][0];
    delete calEvent.attendees;
    calEvent.organizer.self = true;
    let show = calendar.showCalEvent(calEvent);
    expect(show).to.be.true;
  });
  it('should show event by default', () => {
    const calEvent = calFixture['items'][0];
    delete calEvent.organizer;
    let show = calendar.showCalEvent(calEvent);
    expect(show).to.be.true;
  });
});
