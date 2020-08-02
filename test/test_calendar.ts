import {expect} from 'chai';
import sinon = require('sinon');

import calendar = require('../codemancer/js/calendar');
const calFixture = JSON.parse('{"kind":"calendar#events","summary":"Test","updated":"2019-04-11T05:39:28.525Z","timeZone":"America/Los_Angeles","accessRole":"owner","defaultReminders":[],"items":[{"kind":"calendar#event","id":"abcd","status":"confirmed","htmlLink":"https://www.google.com/calendar/event?eid=abcd","created":"2019-03-29T19:48:29.000Z","updated":"2019-04-11T05:39:28.525Z","summary":"Summary","location":"Location","creator":{"email":"Creator.Email","displayName":"Creator.DisplayName","self":true},"organizer":{"email":"Organizer.Email","displayName":"Organizer.DisplayName","self":true},"start":{"dateTime":"2019-04-14T12:00:00-07:00"},"end":{"dateTime":"2019-04-14T15:00:00-07:00"},"iCalUID":"id@google.com","sequence":2,"extendedProperties":{"private":{"everyoneDeclinedDismissed":"-1","eventAttendeeList":"[]"}},"reminders":{"useDefault":true}}]}');

describe('isToday', () => {
  beforeEach(() => {
    this.clock = sinon.useFakeTimers();
  });
  afterEach(() => {
    this.clock.restore();
  });
  it('should return true for today', () => {
    const d = new Date();
    this.clock.tick(d.getTime());
    const today = calendar.isToday(d);
    expect(today).to.be.true;
  });
  it('should return false for tomorrow', () => {
    const d = new Date(2019, 2, 13, 22, 5);
    this.clock.tick(d.getTime() - 24 * 60 * 60 * 1000);
    const today = calendar.isToday(d);
    expect(today).to.be.false;
  });
});

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
    const calEvent = {when: d, allDay: false};
    const f = calendar.formatTime(calEvent);
    expect(f).to.equal('10:05 PM');
  });
  it('should return no time if the time is allDay', () => {
    const d = new Date(2019, 2, 13, 22, 5);
    this.clock.tick(d.getTime());
    const calEvent = {when: d, allDay: true};
    const f = calendar.formatTime(calEvent);
    expect(f).to.equal('');
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
    const show = calendar.showCalEvent(calEvent);
    expect(show).to.be.true;
  });
  it('should show event by default', () => {
    const calEvent = calFixture['items'][0];
    delete calEvent.organizer;
    const show = calendar.showCalEvent(calEvent);
    expect(show).to.be.true;
  });
});
