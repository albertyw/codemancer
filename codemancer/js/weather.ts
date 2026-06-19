import $ from 'jquery';

import getRollbar from './rollbar.js';
import { location} from './location.js';
import { LocationData } from '../../server/location.js';
import { requestPromise } from './util.js';

const baseURL = '/weather';
const weatherRefreshInterval = 20 * 60 * 1000;

// WMO weather interpretation codes (WW) → weather-icons unicode.
// Icons are from https://erikflowers.github.io/weather-icons/
// Codes are from https://open-meteo.com/en/docs
const wmoIconMap: {[key: number]: string} = {
  0: '\uf00d',   // Clear sky
  1: '\uf00d',   // Mainly clear
  2: '\uf002',   // Partly cloudy
  3: '\uf013',   // Overcast
  45: '\uf014',  // Fog
  48: '\uf014',  // Depositing rime fog
  51: '\uf009',  // Light drizzle
  53: '\uf009',  // Moderate drizzle
  55: '\uf009',  // Dense drizzle
  56: '\uf017',  // Light freezing drizzle
  57: '\uf017',  // Dense freezing drizzle
  61: '\uf008',  // Slight rain
  63: '\uf008',  // Moderate rain
  65: '\uf04e',  // Heavy rain
  66: '\uf017',  // Light freezing rain
  67: '\uf017',  // Heavy freezing rain
  71: '\uf01b',  // Slight snowfall
  73: '\uf01b',  // Moderate snowfall
  75: '\uf064',  // Heavy snowfall
  77: '\uf064',  // Snow grains
  80: '\uf009',  // Slight rain showers
  81: '\uf008',  // Moderate rain showers
  82: '\uf04e',  // Violent rain showers
  85: '\uf017',  // Slight snow showers
  86: '\uf064',  // Heavy snow showers
  95: '\uf01e',  // Thunderstorm
  96: '\uf01e',  // Thunderstorm with slight hail
  99: '\uf01e',  // Thunderstorm with heavy hail
};

const weatherLookForwardHours = 24;
interface ResponseData {
  current: {
    time: string;
    temperature_2m: number;
    weathercode: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weathercode: number[];
  };
}
const defaultWeatherData: ResponseData = {
  current: {
    time: '',
    temperature_2m: 0,
    weathercode: 0,
  },
  hourly: {
    time: [],
    temperature_2m: [0],
    weathercode: [0],
  },
};
interface WeatherData {
  currentTemp: number;
  minTemp: number;
  maxTemp: number;
  conditionSequence: string[];
  worstCondition: string;
}

export class Weather {
  #el = {
    now : $('#weather-now'),
    city : $('#city'),
  };

  static urlBuilder(location: LocationData): string {
    const url = new URL(baseURL, window.location.href);
    url.searchParams.set('latitude', String(location.lat));
    url.searchParams.set('longitude', String(location.lng));
    return url.toString();
  };

  static validate(data: ResponseData): ResponseData {
    if (!data.current || typeof data.current.temperature_2m !== 'number' || typeof data.current.weathercode !== 'number') {
      return defaultWeatherData;
    }
    if (!data.hourly || !Array.isArray(data.hourly.time) || !Array.isArray(data.hourly.temperature_2m) || !Array.isArray(data.hourly.weathercode)) {
      return defaultWeatherData;
    }
    if (data.hourly.temperature_2m.length === 0 || data.hourly.weathercode.length === 0) {
      return defaultWeatherData;
    }
    return data;
  };

  parse(data: ResponseData): WeatherData {
    const times = data.hourly.time;
    const temps = data.hourly.temperature_2m;
    const codes = data.hourly.weathercode;
    const currentTemp = Math.round(data.current.temperature_2m);
    const w2: WeatherData = {
      currentTemp: currentTemp,
      minTemp: currentTemp,
      maxTemp: currentTemp,
      conditionSequence: [this.conditionIcon(data.current.weathercode)],
      worstCondition: '',
    };
    // hourly times are local (timezone=auto) and start at midnight, so find the
    // current hour and look forward from now rather than from the start of day.
    const currentHour = data.current.time.slice(0, 13);
    let start = times.findIndex(time => time.slice(0, 13) === currentHour);
    if (start < 0) {
      start = 0;
    }
    const windowCodes: number[] = [data.current.weathercode];
    for (let i = start; i < start + weatherLookForwardHours && i < temps.length; i++) {
      const temp = Math.round(temps[i]);
      w2.minTemp = Math.min(w2.minTemp, temp);
      w2.maxTemp = Math.max(w2.maxTemp, temp);
      windowCodes.push(codes[i]);
      const icon = this.conditionIcon(codes[i]);
      if (w2.conditionSequence[w2.conditionSequence.length - 1] !== icon) {
        w2.conditionSequence.push(icon);
      }
    }
    w2.worstCondition = this.conditionIcon(this.worstCondition(windowCodes));
    return w2;
  };

  // Higher WMO codes are more severe weather.
  worstCondition(codes: number[]): number {
    let worst = codes[0];
    for (const code of codes) {
      if (code > worst) {
        worst = code;
      }
    }
    return worst;
  };

  conditionIcon(code: number): string {
    const icon = wmoIconMap[code];
    if (icon !== undefined) {
      return icon;
    }
    getRollbar().error('cannot find icon for WMO code ' + String(code));
    return '\uf04c';
  };

  render(wd: WeatherData): void {
    // Set Current Information
    this.#el.now.find('.condition').html(wd.worstCondition);
    this.#el.now.find('.min-temp').html(String(wd.minTemp));
    this.#el.now.find('.current-temp').html(String(wd.currentTemp));
    this.#el.now.find('.max-temp').html(String(wd.maxTemp));

    // Show Weather
    $('#weather-inner').removeClass('hidden');
    this.#el.now.addClass('animated bouncein smooth');
  };

  hide(): void {
    $('#weather-inner').addClass('hidden');
    this.#el.now.removeClass('animated bouncein smooth');
  }

  load(locationData: Promise<LocationData>): Promise<void> {
    return locationData
      .then(data => Weather.urlBuilder(data))
      .then((url: string) => {
        return <Promise<ResponseData>>requestPromise(url, 0, 0);
      })
      .then((data: ResponseData) => Weather.validate(data))
      .then((data: ResponseData): WeatherData => this.parse(data))
      .then(data => this.render(data));
  };
};

export const weather = new Weather();

export function load(): void {
  weather.load(location.getLocation())
    .catch(error => { getRollbar().error(error); });
  setInterval(load, weatherRefreshInterval);
}
