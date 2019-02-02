const expect = require("chai").expect;

const calendar = require("../codemancer/js/calendar");

describe("trimString", function() {
    it("should be available", function() {
        const trimmedString = calendar.trimString(" asdf  ");
        expect(trimmedString).to.be.equal("asdf");
    });
});
