import {Client as GoogleMapsClient, ReverseGeocodeResponse} from '@googlemaps/google-maps-services-js';

import getRollbar = require('../codemancer/js/rollbar');
import util = require('../codemancer/js/util');
import varsnap = require('../codemancer/js/varsnap');

export interface LocationData {
  wfo: string;
  x: string;
  y: string;
  lat: number;
  lng: number;
  timezone: string;
  displayName: string;
}

const sanFranciscoLocation: LocationData = {
  // Generated from https://api.weather.gov/points/37.78,-122.41
  wfo: 'MTR', x: '85', y: '105',
  lat: 37.78, lng: -122.41,
  timezone: 'America/Los_Angeles',
  displayName: '',
};
export const targetLocation = sanFranciscoLocation;

const googleMapsClient = new GoogleMapsClient({});

export const Location = {
  getLocation: function(): Promise<LocationData> {
    return googleMapsClient.reverseGeocode({
      params: {
        latlng: [targetLocation.lat, targetLocation.lng],
        key: process.env.GEOCODING_API_KEY_BACKEND,
      },
    }).then((response: ReverseGeocodeResponse) => {
      if (response.data.status === 'OK') {
        targetLocation.displayName = Location.parseDisplayName(response.data);
      } else {
        getRollbar().error('Failed to geocode', response);
      }
      return targetLocation;
    }, (error) => {
      getRollbar().error('Failed to geocode', error);
      return targetLocation;
    }).catch((error) => {
      getRollbar().error('Failed to geocode', error);
      return targetLocation;
    });
  },

  parseDisplayName: varsnap(function parseDisplayName(data: any): string {
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
    const locData = util.unique(info);
    if (locData.length === 3) {
      locData.pop();
    }
    return locData.join(', ');
  }),
};
