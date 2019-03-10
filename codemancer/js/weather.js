const $ = require('jquery');
const Q = require('q');

const weatherRefreshInterval = 20 * 60 * 1000;
const weatherIconConversions = {
    'chanceflurries': 'p',
    'chancesnow': 'p',
    '/ig/images/weather/flurries.gif': ']',
    'chancesleet': '4',
    'chancerain': '7',
    'chancetstorms': 'x',
    'tstorms': 'z',
    'nt_tstorms': 'z',
    'clear': 'v',
    'sunny': 'v',
    'cloudy': '`',
    'flurries': ']',
    'nt_flurries': ']',
    'fog': 'g',
    'hazy': 'g',
    'nt_fog': 'g',
    'nt_hazy': 'g',
    'mostlycloudy': '1',
    'partlysunny': '1',
    'partlycloudy': '1',
    'mostlysunny': '1',
    'sleet': '3',
    'nt_sleet': '3',
    'rain': '6',
    'nt_rain': '6',
    'snow': 'o',
    'nt_snow': 'o',
    // Night Specific
    'nt_chanceflurries': 'a',
    'nt_chancerain': '8',
    'nt_chancesleet': '5',
    'nt_chancesnow': '[',
    'nt_chancetstorms': 'c',
    'nt_clear': '/',
    'nt_sunny': '/',
    'nt_cloudy': '2',
    'nt_mostlycloudy': '2',
    'nt_partlysunny': '2',
    'nt_partlycloudy': '2',
    'nt_mostlysunny': '2'
};
const targetLocation = {lat: 37.778519, lng: -122.40564};
const weatherLookForwardHours = 24;

function chainAccessor(data, properties) {
    let value = data;
    for(let x=0; x<properties.length; x++) {
        value = value && value[properties[x]];
    }
    return value;
}

const Weather = {

    $el: {
        now : $('.now'),
        city : $('#city')
    },

    urlBuilder: function(type, location) {
        const url = 'https://api.wunderground.com/api/d1bfeac98cad347b/' +
            type + '/lang:EN/q/' + location.lat + ',' + location.lng + '.json';
        return url;
    },

    atLocation: function () {
        return Q.when($.ajax({
            url: Weather.urlBuilder('hourly/', targetLocation),
            type: 'GET',
            dataType: 'json'
        }))
            .then(function(data) {
                return Location.getDisplayName(targetLocation).then(function(name) {
                    data.locationDisplayName = name;
                    return data;
                });
            })
            .then(Weather.parse);
    },

    parse: function(data) {
        const deferred = Q.defer();

        // Lets only keep what we need.
        const w2 = {};
        w2.city = data.locationDisplayName;
        w2.currentTemp = Math.round(chainAccessor(data, ['hourly_forecast', 0, 'temp', 'english']));
        w2.minTemp = w2.currentTemp;
        w2.maxTemp = w2.currentTemp;
        w2.conditionSequence = [chainAccessor(data, ['hourly_forecast', 0, 'wx'])];
        w2.conditionCodeSequence = [Weather.condition(chainAccessor(data, ['hourly_forecast', 0, 'icon_url']))];
        for (let i = 0; i < weatherLookForwardHours; i++) {
            if (i >= data.hourly_forecast.length) {
                break;
            }
            const df = data.hourly_forecast[i];
            const temp = Math.round(chainAccessor(df, ['temp', 'english']));
            w2.minTemp = Math.min(w2.minTemp, temp);
            w2.maxTemp = Math.max(w2.maxTemp, temp);

            const condition = df.condition;
            const conditionCode = Weather.condition(df.icon_url);
            if(w2.conditionSequence[w2.conditionSequence.length-1] != condition) {
                w2.conditionSequence.push(condition);
                w2.conditionCodeSequence.push(conditionCode);
            }
        }

        deferred.resolve(w2);
        return deferred.promise;
    },

    condition: function (url){
        const matcher = /\/(\w+).gif$/;
        let code = matcher.exec(url);
        if (code) {
            code = code[1];
        } else {
            // We can't find the code
            code = null;
        }
        const weatherIconCode = weatherIconConversions[code];
        if (weatherIconCode === undefined) {
            return 'T';
        }
        return weatherIconCode;
    },

    render: function(wd) {
        // Set Current Information
        Weather.renderDay(Weather.$el.now, wd);
        Weather.$el.city.html(wd.city).show();

        // Show Weather
        $('#weather-inner').removeClass('hidden').show();
    },

    renderDay: function(el, data) {
        el.attr('title', data.conditionSequence[0]);
        el.find('.condition').html(data.conditionCodeSequence[0]);
        el.find('.min-temp').html(data.minTemp);
        el.find('.current-temp').html(data.currentTemp);
        el.find('.max-temp').html(data.maxTemp);
    },

    load: function() {
        return Weather.atLocation();
    }
};

function main() {
    const loader = Weather.load().then(function(data) {
        Weather.render(data);
    });

    loader.fail(function(reason) {
        window.Rollbar.error(reason);
    });
    setInterval(main, weatherRefreshInterval);
}

module.exports = main;
