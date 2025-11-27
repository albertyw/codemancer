import suncalc from 'suncalc';

import renderGradient from './gradient.js';
import { location } from '../location.js';
import { LocationData } from '../../../server/location.js';

export function load() {
  location.getLocation().then((locationData: LocationData) => {
    const sunPos = suncalc.getPosition(new Date(), locationData.lat, locationData.lng);

    const [gradient, topVec, bottomVec] = renderGradient(sunPos.altitude);

    const top = `rgb(${topVec[0]}, ${topVec[1]}, ${topVec[2]})`;
    const bottom = `rgb(${bottomVec[0]}, ${bottomVec[1]}, ${bottomVec[2]})`;
    console.log('Background gradient:', { gradient, top, bottom });

    document.getElementsByTagName('body')[0].style.background = gradient;
  });
}
