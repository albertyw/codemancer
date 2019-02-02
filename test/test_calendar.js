const expect = require("chai").expect;

const calendar = require("../codemancer/js/calendar");

describe("trimString", function() {
    it("should return a trimmed string", function() {
        const trimmedString = calendar.trimString(" asdf  ");
        expect(trimmedString).to.be.equal("asdf");
    });
});
