import {expect} from 'chai';
import sinon from 'sinon';
import axios from 'axios';

import {getAirQualityData, getWeatherData} from '../server/weather.js';

// Under Node the Storage cache is a no-op, so requestPromise always falls
// through to axios.get. Stubbing it keeps these tests off the network.
describe('weather', function() {
  let axiosGet: sinon.SinonStub;
  beforeEach(function() {
    axiosGet = sinon.stub(axios, 'get').resolves({data: {stubbed: true}});
  });
  afterEach(function() {
    axiosGet.restore();
  });

  describe('getAirQualityData', function() {
    it('requests the air quality API with the given coordinates', async function() {
      const data = await getAirQualityData(37.8, -122.4);
      expect(data).to.deep.equal({stubbed: true});
      const url = new URL(axiosGet.firstCall.args[0]);
      expect(url.origin + url.pathname).to.equal('https://air-quality-api.open-meteo.com/v1/air-quality');
      expect(url.searchParams.get('latitude')).to.equal('37.8');
      expect(url.searchParams.get('longitude')).to.equal('-122.4');
      expect(url.searchParams.get('current')).to.equal('us_aqi');
    });
  });

  describe('getWeatherData', function() {
    it('requests the forecast API with the given coordinates', async function() {
      const data = await getWeatherData(37.8, -122.4);
      expect(data).to.deep.equal({stubbed: true});
      const url = new URL(axiosGet.firstCall.args[0]);
      expect(url.origin + url.pathname).to.equal('https://api.open-meteo.com/v1/forecast');
      expect(url.searchParams.get('latitude')).to.equal('37.8');
      expect(url.searchParams.get('longitude')).to.equal('-122.4');
      expect(url.searchParams.get('temperature_unit')).to.equal('fahrenheit');
      expect(url.searchParams.get('forecast_days')).to.equal('2');
      expect(url.searchParams.get('timezone')).to.equal('auto');
    });
  });
});
