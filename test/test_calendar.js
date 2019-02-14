const expect = require('chai').expect;

const calendar = require('../codemancer/js/calendar');

describe('formatTime', () => {
    it('should return a formatted time', () => {
        const d = new Date(2019, 2, 13, 22, 5);
        const f = calendar.formatTime(d);
        expect(f).to.equal('Wed Mar 13 2019 10:05 PM');
    });
});

describe('trimString', function() {
    it('should return a trimmed string', function() {
        const trimmedString = calendar.trimString(' asdf  ');
        expect(trimmedString).to.be.equal('asdf');
    });
});
