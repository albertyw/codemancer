const $ = require('jquery');
const Q = require('q');

const Rollbar = require('./rollbar');
const Location = require('./location');

const weatherRefreshInterval = 20 * 60 * 1000;
// Icons are from https://erikflowers.github.io/weather-icons/
const weatherIconConversions = {
    'Mostly Clear': '\uf00d',
    'Sunny': '\uf00d',
    'Mostly Sunny': '\uf00d',
    'Partly Cloudy': '\uf002',
};
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

    urlBuilder: function(location) {
        // Documentation at https://www.weather.gov/documentation/services-web-api#/
        const url = 'https://api.weather.gov/gridpoints/' + location.wfo + '/'
            + location.x + ',' + location.y + '/forecast/hourly';
        return url;
    },

    atLocation: function () {
        return Q.when($.ajax({
            url: Weather.urlBuilder(Location.targetLocation),
            type: 'GET',
            dataType: 'json'
        }))
            .then(function(data) {
                return Location.getDisplayName(Location.targetLocation).then(function(name) {
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
        w2.currentTemp = Math.round(chainAccessor(data, ['properties', 'periods', 0, 'temperature']));
        w2.minTemp = w2.currentTemp;
        w2.maxTemp = w2.currentTemp;
        w2.conditionSequence = [chainAccessor(data, ['properties', 'periods', 0, 'shortForecast'])];
        for (let i = 0; i < weatherLookForwardHours; i++) {
            if (i >= data.properties.periods.length) {
                break;
            }
            const period = data.properties.periods[i];
            const temp = Math.round(chainAccessor(period, ['temperature']));
            w2.minTemp = Math.min(w2.minTemp, temp);
            w2.maxTemp = Math.max(w2.maxTemp, temp);

            const condition = period.shortForecast;
            if(w2.conditionSequence[w2.conditionSequence.length-1] != condition) {
                w2.conditionSequence.push(condition);
            }
        }
        for (let i=0; i < w2.conditionSequence.length; i++) {
            w2.conditionSequence[i] = Weather.conditionIcon(w2.conditionSequence[i]);
        }

        deferred.resolve(w2);
        return deferred.promise;
    },

    conditionIcon: function (condition){
        const weatherIconCode = weatherIconConversions[condition];
        if (weatherIconCode === undefined) {
            Rollbar.error('cannot find image for "' + condition + '"');
            return '\uf04c';
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
        el.find('.condition').html(data.conditionSequence[0]);
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
        Rollbar.error(reason);
    });
    setInterval(main, weatherRefreshInterval);
}

module.exports = {
    load: main,
    Weather: Weather,
};
