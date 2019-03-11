const expect = require('chai').expect;

const Location = require('../codemancer/js/location');

describe('Location.targetLocation', () => {
    it('returns data', () => {
        expect(Location.targetLocation.wfo).to.not.be.empty;
        expect(Location.targetLocation.x).to.not.be.empty;
        expect(Location.targetLocation.y).to.not.be.empty;
        expect(Location.targetLocation.lat).to.be.a('number');
        expect(Location.targetLocation.lng).to.be.a('number');
    });
});
