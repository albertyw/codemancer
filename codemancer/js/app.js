const weatherRefreshInterval = 20 * 60 * 1000;
const weatherIconConversions = {
  "chanceflurries": "p",
  "chancesnow": "p",
  "/ig/images/weather/flurries.gif": "]",
  "chancesleet": "4",
  "chancerain": "7",
  "chancetstorms": "x",
  "tstorms": "z",
  "nt_tstorms": "z",
  "clear": "v",
  "sunny": "v",
  "cloudy": "`",
  "flurries": "]",
  "nt_flurries": "]",
  "fog": "g",
  "hazy": "g",
  "nt_fog": "g",
  "nt_hazy": "g",
  "mostlycloudy": "1",
  "partlysunny": "1",
  "partlycloudy": "1",
  "mostlysunny": "1",
  "sleet": "3",
  "nt_sleet": "3",
  "rain": "6",
  "nt_rain": "6",
  "snow": "o",
  "nt_snow": "o",
  // Night Specific
  "nt_chanceflurries": "a",
  "nt_chancerain": "8",
  "nt_chancesleet": "5",
  "nt_chancesnow": "[",
  "nt_chancetstorms": "c",
  "nt_clear": "/",
  "nt_sunny": "/",
  "nt_cloudy": "2",
  "nt_mostlycloudy": "2",
  "nt_partlysunny": "2",
  "nt_partlycloudy": "2",
  "nt_mostlysunny": "2"
};
const targetLocation = {lat: 37.778519, lng: -122.40564};

const Loader = {
  loader: $('#loader'),
  show: function() {
    this.loader.siblings('div').hide();
    this.loader.show();
  },
  hide: function() {
    this.loader.hide();
  }
};

const Storage = {
  options: {
    key: "options",
    defaults: {
      lang: "EN",
      animation: true,
      textColor: "light-text"
    }
  }
};

const Location = {
  getDisplayName: function(location) {
    return Q.when($.ajax({
      url : "https://maps.googleapis.com/maps/api/geocode/json",
      data: {"latlng": location.lat +","+ location.lng, sensor:false},
      dataType: "json"
    }))
    .then(function(data) {
      if (data.status === "OK") {
        return Location.parseDisplayName(data);
      } else {
        throw new Error("Failed to geocode");
      }
    });
  },

  parseDisplayName: function(data) {
    const result=data.results[0].address_components;
    const info=[];
    for(let i=0;i<result.length;++i) {
      const type = result[i].types[0];
      if(type==="country"){
        info.push(result[i].long_name);
      } else if(type==="administrative_area_level_1"){
        info.push(result[i].short_name);
      } else if(type==="locality"){
        info.unshift(result[i].long_name);
      }
    }
    const locData = _.uniq(info);
    if (locData.length === 3) {
      locData.pop(2);
    }
    return locData.join(", ");
  }
};

const Weather = {

  $el: {
    now : $('.now'),
    forecast : $('#weather li'),
    city : $('#city')
  },

  urlBuilder: function(type, location, lang) {
    let url = "https://api.wunderground.com/api/d1bfeac98cad347b/" + type + "/";

    if (lang) {
      url = url + "lang:" + lang + "/";
    }

    return url + "q/" + location.lat + "," + location.lng + ".json";
  },

  atLocation: function () {
    const lang = Storage.options.defaults.lang;
    return Q.when($.ajax({
      url: Weather.urlBuilder("hourly/", targetLocation, lang),
      type: 'GET',
      dataType: "json"
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
    const w2 = {
      city: data.locationDisplayName,
      current: {
        condition: data.hourly_forecast[0].wx,
        conditionCode: Weather.condition(data.hourly_forecast[0].icon_url),
        temp: Math.round(data.hourly_forecast[0].temp.english)
      },
      forecast: []
    };

    for (let i = Weather.$el.forecast.length - 1; i >= 0; i--) {
      const df = data.hourly_forecast[(i+1)*3];
      w2.forecast[i] = {
        hour: df.FCTTIME.civil,
        condition: df.condition,
        conditionCode: Weather.condition(df.icon_url),
        temp: Math.round(df.temp.english),
      };
    }
    deferred.resolve(w2);
    return deferred.promise;
  },

  condition: function (url){
    const matcher = /\/(\w+).gif$/;
    var code = matcher.exec(url);
    if (code) {
      code = code[1];
    } else {
      // We can't find the code
      code = null;
    }
    const weatherIconCode = weatherIconConversions[code];
    if (weatherIconCode === undefined) {
        return "T";
    }
    return weatherIconCode;
  },

  render: function(wd) {
    // Set Current Information
    Weather.renderDay(Weather.$el.now, wd.current);
    Weather.$el.city.html(wd.city).show();

    // Show Weather & Hide Loader
    $('#weather-inner').removeClass('hidden').show();

    // Show Forecast
    Weather.$el.forecast.each(function(i, el) {
      const $el = $(el);
        if (Storage.options.defaults.animation) {
          $el.css("-webkit-animation-delay",150 * i +"ms").addClass('animated fadeInUp');
        }
      const dayWeather = wd.forecast[i];
      Weather.renderDay($el, dayWeather);
    });
  },

  renderDay: function(el, data) {
    el.attr("title", data.condition);
    el.find('.weather').html(data.conditionCode);
    el.find('.temp').html(data.temp);
    if(data.hour) {
      el.find('.hour').html(data.hour);
    }
  },

  load: function() {
    Loader.show();
    return Weather.atLocation();
  }
};

const Clock = {
  $el : {
    digital : {
      time : $('#time'),
      date : $('#date')
    }
  },

  weekdays : ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
  months : ["January","February","March","April","May","June","July","August","September","October","November","December"],

  timeParts: function(options) {
    const date = new Date();
    let hour = date.getHours();

    hour = hour % 12;
    if(hour === 0) {
      hour = 12;
    }
    return {
      // Digital
      day: Clock.weekdays[date.getDay()],
      date: date.getDate(),
      month: Clock.months[date.getMonth()],
      hour: Clock.appendZero(hour),
      minute: Clock.appendZero(date.getMinutes()),
      second: Clock.appendZero(date.getSeconds()),
    };
  },

  appendZero : function(num) {
    if(num < 10) {
      return "0" + num;
    }
    return num;
  },

  dateTemplate: function(parts){
    return parts.day + ", " + parts.month + " " + parts.date;
  },

  transformTemplate: function(angle){
    return "rotate(" + angle + ",50,50)";
  },

  refresh: function(options) {
    const parts = Clock.timeParts(options);
    const oldParts = Clock._parts || {};

    Clock.$el.digital.date.html(Clock.dateTemplate(parts));

    _.each(['hour', 'minute', 'second'], function(unit){
      if( parts[unit] !== oldParts[unit] ){
        Clock.$el.digital.time.find('.' + unit).text(parts[unit]);
      }
    });

    Clock._parts = parts;
  },

  start: function(options) {
    if (Clock._running) {
      clearInterval(Clock._running);
    }

    function tick() {
      const delayTime = 500;

      Clock.refresh(options);

      Clock._running = setTimeout(function(){
        window.requestAnimationFrame( tick );
      }, delayTime);
    }

    tick();
  }
};

function style() {
  const options = Storage.options.defaults;
  // Kick off the clock
  Clock.start(options);
  const $main = $('#main');

  // Text Color
  if (!$main.hasClass(options.textColor)) {
    if ($main.is("[class*='-text']")) {
      $main[0].className = $main[0].className.replace(/\w*-text/g, '');
    }
    $main.addClass(options.textColor);
  }

  // Remove animation
  if (!options.animation) {
    $(".animated").removeClass('animated');
    $(".fadeIn").removeClass('fadeIn');
    $(".fadeInDown").removeClass('fadeInDown');
  }
}

function main() {
  const loader = Weather.load().then(function(data) {
    Loader.hide(0);
    Weather.render(data);
  });

  loader.fail(function(reason) {
    console.error(reason);
  });
}

// Start your engine....
style();
main();
setInterval(main, weatherRefreshInterval);
