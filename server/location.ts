import {
  Client as GoogleMapsClient,
  ReverseGeocodeResponse,
  ReverseGeocodeResponseData,
  TimeZoneResponse,
} from '@googlemaps/google-maps-services-js';

import getRollbar from '../codemancer/js/rollbar.js';
import { unique } from '../codemancer/js/util.js';
import varsnap from '../codemancer/js/varsnap.js';

export interface LocationData {
  lat: number;
  lng: number;
  timezone: string;
  displayName: string;
}

const googleMapsClient = new GoogleMapsClient({});

export class Location {
  static getLocation(latitude: number, longitude: number): Promise<LocationData> {
    const locationData: LocationData = {
      lat: latitude,
      lng: longitude,
      timezone: '',
      displayName: '',
    };
    const geocodingKey = process.env.GEOCODING_API_KEY_BACKEND || '';
    const geocodePromise = googleMapsClient.reverseGeocode({
      params: {
        latlng: [locationData.lat, locationData.lng],
        key: geocodingKey,
      },
    }).then((response: ReverseGeocodeResponse) => {
      if (response.data.status === 'OK') {
        locationData.displayName = Location.parseDisplayName(response.data);
      } else {
        getRollbar().error('Failed to geocode', response);
      }
    }).catch((error) => {
      getRollbar().error('Failed to geocode', error);
    });
    const timezonePromise = googleMapsClient.timezone({
      params: {
        location: [latitude, longitude],
        timestamp: Math.floor(Date.now() / 1000),
        key: geocodingKey,
      },
    }).then((response: TimeZoneResponse) => {
      if (response.data.status === 'OK') {
        locationData.timezone = response.data.timeZoneId;
      } else {
        getRollbar().error('Failed to get timezone', response);
      }
    }).catch((error) => {
      getRollbar().error('Failed to get timezone', error);
    });
    return Promise.all([geocodePromise, timezonePromise]).then(() => locationData);
  }

  static parseDisplayName(data: ReverseGeocodeResponseData): string {
    return varsnap(function parseDisplayName(data: ReverseGeocodeResponseData): string {
      const result=data.results[0].address_components;
      const info=[];
      for(let i=0;i<result.length;++i) {
        const type = result[i].types[0];
        if(type==='country'){
          info.push(result[i].long_name);
        } else if(type==='administrative_area_level_1'){
          info.push(result[i].short_name);
        } else if(type==='locality'){
          info.unshift(result[i].long_name);
        }
      }
      const locData = unique(info);
      if (locData.length === 3) {
        locData.pop();
      }
      return locData.join(', ');
    })(data);
  }
};
