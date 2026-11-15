import {expect} from 'chai';
import sinon from 'sinon';
import axios from 'axios';

import Storage from '../codemancer/js/storage.js';
import {requestTimeout} from '../codemancer/js/util.js';
import {getAirQualityData, getWeatherData} from '../server/weather.js';

// Stubbing axios.get keeps these tests off the network; the server-side cache
// is cleared between tests so each one reaches the stub.
describe('weather', function() {
  let axiosGet: sinon.SinonStub;
  let env: string | undefined;
  beforeEach(function() {
    env = process.env.ENV;
    process.env.ENV = 'production';
    axiosGet = sinon.stub(axios, 'get').resolves({data: {stubbed: true}});
  });
  afterEach(function() {
    axiosGet.restore();
    Storage.clear();
    process.env.ENV = env;
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

    it('times out instead of hanging on a slow upstream', async function() {
      await getWeatherData(37.8, -122.4);
      expect(axiosGet.firstCall.args[1]).to.deep.equal({timeout: requestTimeout});
    });

    it('serves cached data without calling upstream again', async function() {
      await getWeatherData(37.8, -122.4);
      const data = await getWeatherData(37.8, -122.4);
      expect(data).to.deep.equal({stubbed: true});
      expect(axiosGet.callCount).to.equal(1);
    });

    it('falls back to cached data when upstream fails', async function() {
      const clock = sinon.useFakeTimers({now: Date.now(), toFake: ['Date']});
      try {
        await getWeatherData(37.8, -122.4);
        clock.tick(10 * 60 * 1000);
        axiosGet.rejects(new Error('timeout'));
        const data = await getWeatherData(37.8, -122.4);
        expect(data).to.deep.equal({stubbed: true});
        expect(axiosGet.callCount).to.equal(2);
      } finally {
        clock.restore();
      }
    });
  });
});
