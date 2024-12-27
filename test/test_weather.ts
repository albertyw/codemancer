import {expect} from 'chai';
import sinon from 'sinon';

import getRollbar from '../codemancer/js/rollbar.js';
import { Weather } from '../codemancer/js/weather.js';
const weatherFixture = JSON.parse('{"properties":{"periods":[{"temperature":54,"shortForecast":"Rain Showers Likely"},{"temperature":54,"shortForecast":"Rain Showers Likely"},{"temperature":53,"shortForecast":"Rain Showers Likely"},{"temperature":53,"shortForecast":"Showers And Thunderstorms Likely"},{"temperature":53,"shortForecast":"Showers And Thunderstorms Likely"},{"temperature":53,"shortForecast":"Showers And Thunderstorms Likely"},{"temperature":53,"shortForecast":"Showers And Thunderstorms Likely"},{"temperature":53,"shortForecast":"Showers And Thunderstorms Likely"},{"temperature":54,"shortForecast":"Showers And Thunderstorms Likely"},{"temperature":54,"shortForecast":"Showers And Thunderstorms Likely"},{"temperature":55,"shortForecast":"Showers And Thunderstorms Likely"},{"temperature":56,"shortForecast":"Showers And Thunderstorms Likely"},{"temperature":56,"shortForecast":"Showers And Thunderstorms Likely"},{"temperature":57,"shortForecast":"Showers And Thunderstorms Likely"},{"temperature":56,"shortForecast":"Showers And Thunderstorms Likely"},{"temperature":56,"shortForecast":"Chance Rain Showers"},{"temperature":56,"shortForecast":"Chance Rain Showers"},{"temperature":55,"shortForecast":"Chance Rain Showers"},{"temperature":54,"shortForecast":"Chance Rain Showers"},{"temperature":54,"shortForecast":"Chance Rain Showers"},{"temperature":53,"shortForecast":"Chance Rain Showers"},{"temperature":52,"shortForecast":"Slight Chance Rain Showers"},{"temperature":52,"shortForecast":"Slight Chance Rain Showers"},{"temperature":52,"shortForecast":"Slight Chance Rain Showers"},{"temperature":52,"shortForecast":"Slight Chance Rain Showers"},{"temperature":51,"shortForecast":"Slight Chance Rain Showers"},{"temperature":51,"shortForecast":"Slight Chance Rain Showers"},{"temperature":51,"shortForecast":"Partly Sunny"},{"temperature":51,"shortForecast":"Partly Sunny"},{"temperature":50,"shortForecast":"Partly Sunny"},{"temperature":51,"shortForecast":"Partly Sunny"},{"temperature":52,"shortForecast":"Partly Sunny"},{"temperature":52,"shortForecast":"Partly Sunny"},{"temperature":53,"shortForecast":"Partly Cloudy"},{"temperature":54,"shortForecast":"Partly Cloudy"},{"temperature":55,"shortForecast":"Partly Cloudy"},{"temperature":56,"shortForecast":"Partly Cloudy"},{"temperature":57,"shortForecast":"Partly Cloudy"},{"temperature":57,"shortForecast":"Partly Cloudy"},{"temperature":57,"shortForecast":"Partly Cloudy"},{"temperature":56,"shortForecast":"Partly Cloudy"},{"temperature":55,"shortForecast":"Partly Cloudy"},{"temperature":54,"shortForecast":"Partly Cloudy"},{"temperature":54,"shortForecast":"Partly Cloudy"},{"temperature":53,"shortForecast":"Partly Cloudy"},{"temperature":53,"shortForecast":"Mostly Sunny"},{"temperature":52,"shortForecast":"Mostly Sunny"},{"temperature":52,"shortForecast":"Mostly Sunny"},{"temperature":52,"shortForecast":"Mostly Sunny"},{"temperature":51,"shortForecast":"Mostly Sunny"},{"temperature":51,"shortForecast":"Mostly Sunny"},{"temperature":51,"shortForecast":"Slight Chance Light Rain"},{"temperature":51,"shortForecast":"Slight Chance Light Rain"},{"temperature":51,"shortForecast":"Slight Chance Light Rain"},{"temperature":51,"shortForecast":"Slight Chance Light Rain"},{"temperature":51,"shortForecast":"Slight Chance Light Rain"},{"temperature":52,"shortForecast":"Slight Chance Light Rain"},{"temperature":53,"shortForecast":"Chance Light Rain"},{"temperature":53,"shortForecast":"Chance Light Rain"},{"temperature":54,"shortForecast":"Chance Light Rain"},{"temperature":55,"shortForecast":"Chance Light Rain"},{"temperature":56,"shortForecast":"Chance Light Rain"},{"temperature":55,"shortForecast":"Chance Light Rain"},{"temperature":55,"shortForecast":"Light Rain Likely"},{"temperature":55,"shortForecast":"Light Rain Likely"},{"temperature":54,"shortForecast":"Light Rain Likely"},{"temperature":53,"shortForecast":"Light Rain Likely"},{"temperature":53,"shortForecast":"Light Rain Likely"},{"temperature":52,"shortForecast":"Light Rain Likely"},{"temperature":52,"shortForecast":"Chance Rain Showers"},{"temperature":52,"shortForecast":"Chance Rain Showers"},{"temperature":52,"shortForecast":"Chance Rain Showers"},{"temperature":51,"shortForecast":"Chance Rain Showers"},{"temperature":51,"shortForecast":"Chance Rain Showers"},{"temperature":51,"shortForecast":"Chance Rain Showers"},{"temperature":50,"shortForecast":"Mostly Sunny"},{"temperature":50,"shortForecast":"Mostly Sunny"},{"temperature":50,"shortForecast":"Mostly Sunny"},{"temperature":51,"shortForecast":"Mostly Sunny"},{"temperature":52,"shortForecast":"Mostly Sunny"},{"temperature":52,"shortForecast":"Mostly Sunny"},{"temperature":53,"shortForecast":"Partly Cloudy"},{"temperature":54,"shortForecast":"Partly Cloudy"},{"temperature":56,"shortForecast":"Partly Cloudy"},{"temperature":57,"shortForecast":"Partly Cloudy"},{"temperature":58,"shortForecast":"Partly Cloudy"},{"temperature":58,"shortForecast":"Partly Cloudy"},{"temperature":57,"shortForecast":"Mostly Clear"},{"temperature":57,"shortForecast":"Mostly Clear"},{"temperature":55,"shortForecast":"Mostly Clear"},{"temperature":54,"shortForecast":"Mostly Clear"},{"temperature":53,"shortForecast":"Mostly Clear"},{"temperature":52,"shortForecast":"Mostly Clear"},{"temperature":52,"shortForecast":"Sunny"},{"temperature":51,"shortForecast":"Sunny"},{"temperature":51,"shortForecast":"Sunny"},{"temperature":50,"shortForecast":"Sunny"},{"temperature":50,"shortForecast":"Sunny"},{"temperature":50,"shortForecast":"Sunny"},{"temperature":49,"shortForecast":"Sunny"},{"temperature":49,"shortForecast":"Sunny"},{"temperature":49,"shortForecast":"Sunny"},{"temperature":50,"shortForecast":"Sunny"},{"temperature":50,"shortForecast":"Sunny"},{"temperature":52,"shortForecast":"Sunny"},{"temperature":53,"shortForecast":"Mostly Cloudy"},{"temperature":54,"shortForecast":"Mostly Cloudy"},{"temperature":56,"shortForecast":"Mostly Cloudy"},{"temperature":58,"shortForecast":"Mostly Cloudy"},{"temperature":59,"shortForecast":"Mostly Cloudy"},{"temperature":59,"shortForecast":"Mostly Cloudy"},{"temperature":58,"shortForecast":"Mostly Cloudy"},{"temperature":58,"shortForecast":"Mostly Cloudy"},{"temperature":56,"shortForecast":"Mostly Cloudy"},{"temperature":55,"shortForecast":"Mostly Cloudy"},{"temperature":55,"shortForecast":"Mostly Cloudy"},{"temperature":54,"shortForecast":"Mostly Cloudy"},{"temperature":54,"shortForecast":"Slight Chance Rain Showers"},{"temperature":53,"shortForecast":"Slight Chance Rain Showers"},{"temperature":53,"shortForecast":"Slight Chance Rain Showers"},{"temperature":52,"shortForecast":"Slight Chance Rain Showers"},{"temperature":52,"shortForecast":"Slight Chance Rain Showers"},{"temperature":51,"shortForecast":"Slight Chance Rain Showers"},{"temperature":51,"shortForecast":"Chance Rain Showers"},{"temperature":51,"shortForecast":"Chance Rain Showers"},{"temperature":51,"shortForecast":"Chance Rain Showers"},{"temperature":52,"shortForecast":"Chance Rain Showers"},{"temperature":52,"shortForecast":"Chance Rain Showers"},{"temperature":53,"shortForecast":"Chance Rain Showers"},{"temperature":54,"shortForecast":"Chance Rain Showers"},{"temperature":55,"shortForecast":"Chance Rain Showers"},{"temperature":56,"shortForecast":"Chance Rain Showers"},{"temperature":57,"shortForecast":"Chance Rain Showers"},{"temperature":58,"shortForecast":"Chance Rain Showers"},{"temperature":57,"shortForecast":"Chance Rain Showers"},{"temperature":57,"shortForecast":"Chance Rain Showers"},{"temperature":57,"shortForecast":"Chance Rain Showers"},{"temperature":56,"shortForecast":"Chance Rain Showers"},{"temperature":55,"shortForecast":"Chance Rain Showers"},{"temperature":54,"shortForecast":"Chance Rain Showers"},{"temperature":54,"shortForecast":"Chance Rain Showers"},{"temperature":53,"shortForecast":"Chance Rain Showers"},{"temperature":53,"shortForecast":"Chance Rain Showers"},{"temperature":52,"shortForecast":"Chance Rain Showers"},{"temperature":52,"shortForecast":"Chance Rain Showers"},{"temperature":52,"shortForecast":"Chance Rain Showers"},{"temperature":51,"shortForecast":"Chance Rain Showers"},{"temperature":51,"shortForecast":"Chance Rain Showers"},{"temperature":51,"shortForecast":"Chance Rain Showers"},{"temperature":51,"shortForecast":"Chance Rain Showers"},{"temperature":52,"shortForecast":"Chance Rain Showers"},{"temperature":52,"shortForecast":"Chance Rain Showers"},{"temperature":53,"shortForecast":"Chance Rain Showers"},{"temperature":54,"shortForecast":"Chance Rain Showers"},{"temperature":54,"shortForecast":"Chance Rain Showers"},{"temperature":56,"shortForecast":"Chance Rain Showers"}]}}');
const weatherSummary = JSON.parse('["Sunny","Mostly Sunny","Partly Sunny","Mostly Cloudy","Cloudy","Clear","Mostly Clear","Partly Cloudy","Increasing Clouds","Decreasing Clouds","Becoming Cloudy","Clearing","Gradual Clearing","Clearing Late","Becoming Sunny","Patchy Fog","Dense Fog","Areas Fog","Fog","Blowing Snow","Blowing Dust","Blowing Sand","Patchy Haze","Areas Haze","Haze","Patchy Ice Crystals","Areas Ice Crystals","Ice Crystals","Patchy Ice Fog","Areas Ice Fog","Ice Fog","Patchy Freezing Fog","Areas Freezing Fog","Freezing Fog","Freezing Spray","Patchy Smoke","Areas Smoke","Smoke","Patchy Frost","Areas Frost","Frost","Patchy Ash","Areas Ash","Volcanic Ash","Slight Chance Sleet","Chance Sleet","Sleet Likely","Sleet","Slight Chance Rain Showers","Chance Rain Showers","Rain Showers Likely","Rain Showers","Slight Chance Rain","Chance Rain","Rain Likely","Rain","Heavy Rain","Slight Chance Drizzle","Chance Drizzle","Drizzle Likely","Drizzle","Slight Chance Snow Showers","Chance Snow Showers","Snow Showers Likely","Snow Showers","Slight Chance Flurries","Chance Flurries","Flurries Likely","Flurries","Slight Chance Snow","Chance Snow","Snow Likely","Snow","Blizzard","Slight Chance Rain/Snow","Chance Rain/Snow","Rain/Snow Likely","Rain/Snow","Slight Chance Freezing Rain","Chance Freezing Rain","Freezing Rain Likely","Freezing Rain","Slight Chance Freezing Drizzle","Chance Freezing Drizzle","Freezing Drizzle Likely","Freezing Drizzle","Slight Chance Wintry Mix","Chance Wintry Mix","Wintry Mix Likely","Wintry Mix","Slight Chance Rain/Freezing Rain","Chance Rain/Freezing Rain","Rain/Freezing Rain Likely","Rain/Freezing Rain","Slight Chance Wintry Mix","Chance Wintry Mix","Wintry Mix Likely","Wintry Mix","Slight Chance Rain/Sleet","Chance Rain/Sleet","Rain/Sleet Likely","Rain/Sleet","Slight Chance Snow/Sleet","Chance Snow/Sleet","Snow/Sleet Likely","Snow/Sleet","Isolated Thunderstorms","Slight Chance Thunderstorms","Chance Thunderstorms","Thunderstorms Likely","Thunderstorms","Severe Tstms","Water Spouts","Windy","Blustery","Breezy","Hot","Cold","none"]');

describe('Weather.parse', () => {
  it('returns data', () => {
    const weather = new Weather();
    const data = weather.parse(weatherFixture);
    // expect(data.city).to.not.be.empty;
    expect(data.currentTemp).to.equal(54);
    expect(data.minTemp).to.equal(52);
    expect(data.maxTemp).to.equal(57);
    expect(data.worstCondition).to.equal('\uf00e');
    expect(data.conditionSequence).to.not.be.empty;
  });
});

describe('Weather.worstConditions', () => {
  it('returns the worst condition', () => {
    const weather = new Weather();
    const conditions = ['\uf013', '\uf00e', '\uf00d'];
    expect(weather.worstCondition(conditions)).to.equal('\uf00e');
  });
  it('returns undefined if there are no conditions', () => {
    const weather = new Weather();
    expect(weather.worstCondition([])).to.equal(undefined);
  });
});

describe('Weather.conditionIcon', () => {
  beforeEach(function() {
    this.weather = new Weather();
    this.rollbarError = sinon.spy(getRollbar(), 'error');
  });
  afterEach(function() {
    this.rollbarError.restore();
  });
  it('returns an icon code', function() {
    const icon = this.weather.conditionIcon('Rain');
    expect(icon).to.equal('\uf008');
  });
  it('can strip descriptors', function() {
    const icon = this.weather.conditionIcon('Slight Chance Rain');
    expect(icon).to.equal('\uf008');
  });
  it('does not strip descriptors unless needed', function() {
    const icon1 = this.weather.conditionIcon('Cloudy');
    const icon2 = this.weather.conditionIcon('Mostly Cloudly');
    expect(icon1).to.not.equal(icon2);
  });
  it('works with a variety of conditions', function() {
    const icon = this.weather.conditionIcon('Occasional Very Light Rain');
    expect(icon).to.not.equal('');
    expect(this.rollbarError.callCount).to.equal(0);
  });
  it('returns a default icon code if condition is unknown', function() {
    const icon = this.weather.conditionIcon('asdf');
    expect(icon).to.equal('\uf04c');
    expect(this.rollbarError.calledWithExactly('cannot find image for "asdf"')).to.be.true;
  });
  it('works with all published conditions', function() {
    // data from https://graphical.weather.gov/xml/xml_fields_icon_weather_conditions.php
    for (const condition of weatherSummary) {
      const icon = this.weather.conditionIcon(condition);
      if (condition === 'none') {
        expect(icon).to.equal('\uf04c', condition);
      } else {
        expect(icon).to.not.equal('\uf04c', condition);
      }
    }
  });
});
