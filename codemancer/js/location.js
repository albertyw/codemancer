const $ = require('jquery');
const Q = require('q');

const targetLocation = {
    wfo: 'MTR', x: '88', y: '128',
    lat: 37.778519, lng: -122.40564,
};
const geocodingAPIKey = process.env.GEOCODING_API_KEY;

function unique(array) {
    return Array.from(new Set(array));
}

const Location = {
    targetLocation: targetLocation,

    getDisplayName: function(location) {
        return Q.when($.ajax({
            url : 'https://maps.googleapis.com/maps/api/geocode/json',
            data: {
                latlng: location.lat +','+ location.lng,
                sensor: false,
                key: geocodingAPIKey,
            },
            dataType: 'json'
        }))
            .then(function(data) {
                if (data.status === 'OK') {
                    return Location.parseDisplayName(data);
                } else {
                    throw new Error('Failed to geocode');
                }
            });
    },

    parseDisplayName: function(data) {
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
            locData.pop(2);
        }
        return locData.join(', ');
    }
};

module.exports = Location;
