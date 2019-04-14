const expect = require('chai').expect;

const calendar = require('../codemancer/js/calendar');
const calFixture = require('./calendar_fixture.json');

describe('formatTime', () => {
  it('should return a formatted time', () => {
    const d = new Date(2019, 2, 13, 22, 5);
    const f = calendar.formatTime(d, false);
    expect(f).to.equal('Wed Mar 13 2019 10:05 PM');
  });
  it('should return only the date when the time is allDay', () => {
    const d = new Date(2019, 2, 13, 22, 5);
    const f = calendar.formatTime(d, true);
    expect(f).to.equal('Wed Mar 13 2019');
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
