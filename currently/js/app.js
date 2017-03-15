var Loader = {
  loader: $('#loader'),
  show: function() {
    this.loader.siblings('div').hide();
    this.loader.show();
  },
  hide: function() {
    this.loader.hide();
  }
};

var ErrorHandler = {
  $el: {
    error: $("#error"),
    weather: $("#weather-inner"),
    city: $("#city")
  },

  show: function(message) {
    Loader.hide();
    ErrorHandler.$el.error.html(message);
    ErrorHandler.$el.error.show();
    ErrorHandler.$el.weather.hide();
    ErrorHandler.$el.city.hide();
  },

  hide: function() {
    ErrorHandler.$el.error.hide();
    ErrorHandler.$el.weather.show();
  },

  offline: function() {
    ErrorHandler.show($("#offlineError").html());
  },
};

var Storage = {
  options: {
    key: "options",
    location: "sync",
    defaults: {
      unitType: "f",
      clock: 12,
      seconds: true,
      lang: "EN",
      location: {}, // Used to store you own location.
      animation: true,
      textColor: "light-text",
      color: "blue-bg"
    }
  },
};

var Location = {
  getDisplayName: function(location) {
    return Q.when($.ajax({
      url : "https://maps.googleapis.com/maps/api/geocode/json",
      data: {"latlng": location.lat +","+ location.lng, sensor:false},
      dataType: "json"
    }))
    .then(function(data) {
      if (data.status === "OK") {
        var result=data.results[0].address_components;
        var info=[];
        for(var i=0;i<result.length;++i) {
            if(result[i].types[0]=="country"){
              info.push(result[i].long_name);
            }

            if(result[i].types[0]=="administrative_area_level_1"){
              info.push(result[i].short_name);
            }

            if(result[i].types[0]=="locality"){
              info.unshift(result[i].long_name);
            }

        }
        var locData = _.uniq(info);
        if (locData.length === 3) {
          locData.pop(2);
        }
        return locData.join(", ");
      } else {
        throw new Error("Failed to geocode");
      }
    });
  },

  current: function() {
    var deferred = Q.defer();
    if (navigator.geolocation) {
      var positionOptions = {
        enableHighAccuracy: false,
        timeout: Infinity,
        maximumAge: 30 * 60 * 1000
      };
      navigator.geolocation.getCurrentPosition(
        function(position) {
          deferred.resolve({lat: position.coords.latitude, lng: position.coords.longitude});
          // deferred.resolve({lat: -222, lng: 2})
        }, function() {
          deferred.reject(new Error("Couldn't find location"));
        },
        positionOptions
      );
    } else {
      deferred.reject(new Error("Geolocation is missing"));
    }
    return deferred.promise;
  }

};

var Weather = {

  $el: {
    now : $('.now'),
    forecast : $('#weather li'),
    city : $('#city')
  },

  urlBuilder: function(type, location, lang) {
    var url = "https://api.wunderground.com/api/dc203fba39f6674e/" + type + "/";

    if (lang) {
      url = url + "lang:" + lang + "/";
    }

    return url + "q/" + location.lat + "," + location.lng + ".json";
  },

  atLocation: function (location) {
    var lang = Storage.options.defaults.lang;
    return Q.when($.ajax({
      url: Weather.urlBuilder("conditions/forecast/", location, lang),
      type: 'GET',
      dataType: "json"
    }))
    .then(function(data) {
      return Location.getDisplayName(location).then(function(name) {
        data.locationDisplayName = name;
        return data;
      });
    })
    .then(Weather.parse);
  },

  parse: function(data) {
    var unitType = Storage.options.defaults.unitType;
    var deferred = Q.defer();
    var startUnitType = "f";

    // Lets only keep what we need.
    var w2 = {
      city: data.locationDisplayName,
      weatherUrl: data.current_observation.forecast_url,
      current: {
        condition: data.current_observation.weather,
        conditionCode: Weather.condition(data.current_observation.icon_url),
        temp: Weather.tempConvert(data.current_observation.temp_f, startUnitType, unitType)
      },
      forecast: []
    };

    for (var i = Weather.$el.forecast.length - 1; i >= 0; i--) {
      var df = data.forecast.simpleforecast.forecastday[i];
      w2.forecast[i] = {
        day: df.date.weekday,
        condition: df.conditions,
        conditionCode: Weather.condition(df.icon_url),
        high: Weather.tempConvert(df.high.fahrenheit, startUnitType, unitType),
        low: Weather.tempConvert(df.low.fahrenheit, startUnitType, unitType)
      };
    }
    deferred.resolve(w2);
    return deferred.promise;
  },

  condition: function (url){
    var matcher = /\/(\w+).gif$/;
    var code = matcher.exec(url);
    if (code) {
      code = code[1];
    } else {
      // We can't find the code
      code = null;
    }
    switch(code) {

      case "chanceflurries":
      case "chancesnow":
        return "p";

      case "/ig/images/weather/flurries.gif":
        return "]";

      case "chancesleet":
        return "4";

      case "chancerain":
        return "7";

      case "chancetstorms":
        return "x";

      case "tstorms":
      case "nt_tstorms":
        return "z";

      case "clear":
      case "sunny":
        return "v";

      case "cloudy":
        return "`";

      case "flurries":
      case "nt_flurries":
        return "]";

      case "fog":
      case "hazy":
      case "nt_fog":
      case "nt_hazy":
        return "g";

      case "mostlycloudy":
      case "partlysunny":
      case "partlycloudy":
      case "mostlysunny":
        return "1";

      case "sleet":
      case "nt_sleet":
        return "3";

      case "rain":
      case "nt_rain":
        return "6";

      case "snow":
      case "nt_snow":
        return "o";

      // Night Specific

      case "nt_chanceflurries":
        return "a";

      case "nt_chancerain":
        return "8";

      case "nt_chancesleet":
        return "5";

      case "nt_chancesnow":
        return "[";

      case "nt_chancetstorms":
        return "c";

      case "nt_clear":
      case "nt_sunny":
        return "/";

      case "nt_cloudy":
        return "2";

      case "nt_mostlycloudy":
      case "nt_partlysunny":
      case "nt_partlycloudy":
      case "nt_mostlysunny":
        return "2";


      default:
        console.log("MISSING", code);
        return "T";
    }
  },

  render: function(wd) {
    // Set Current Information
    Weather.renderDay(Weather.$el.now, wd.current);
    Weather.$el.city.html(wd.city).show();

    // Show Weather & Hide Loader
    $('#weather-inner').removeClass('hidden').show();

    // Show Forecast
    Weather.$el.forecast.each(function(i, el) {
      var $el = $(el);
        if (Storage.options.defaults.animation) {
          $el.css("-webkit-animation-delay",150 * i +"ms").addClass('animated fadeInUp');
        }
      var dayWeather = wd.forecast[i];
      Weather.renderDay($el, dayWeather);
    });

    // Change link to weather underground
    $('a.wunder').attr('href', Weather.link(wd));
  },

  link: function(data) {
    return data.weatherUrl + "?apiref=846edca2fe64735c";
  },

  renderDay: function(el, data) {
    el.attr("title", data.condition);
    el.find('.weather').html(data.conditionCode);
    if (!_.isUndefined(data.high) && !_.isUndefined(data.low)) {
      el.find('.high').html(data.high);
      el.find('.low').html(data.low);
    } else {
      el.find('.temp').html(data.temp);
    }
    if(data.day) {
      el.find('.day').html(data.day);
    }
  },

  tempConvert: function(temp, startType, endType) {
    temp = Math.round(parseFloat(temp));
    if (startType === "f") {
      if (endType === 'c') {
        return Math.round((5/9)*(temp-32));
      } else {
        return temp;
      }
    } else {
      if (endType === 'c') {
        return temp;
      } else {
        return Math.round((9/5) * temp + 32);
      }
    }
  },

  load: function() {
    Loader.show();
    var deferred = Q.defer();
    var l = Location.current();
    deferred.resolve(l);
    deferred = deferred.promise.then(Weather.atLocation);
    return deferred;
  }
};

var Clock = {
  $el : {
    digital : {
      time : $('#time'),
      date : $('#date')
    },
    analog: {
      second : $('#secondhand'),
      minute : $('#minutehand'),
      hour : $('#hourhand')
    }
  },

  weekdays : ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
  months : ["January","February","March","April","May","June","July","August","September","October","November","December"],

  timeParts: function(options) {
    var date = new Date(),
        hour = date.getHours();

    if (options.clock === 12) {
      if(hour > 12) {
          hour = hour - 12;
      } else if(hour === 0) {
        hour = 12;
      }
    }
    return {
      // Digital
      day: Clock.weekdays[date.getDay()],
      date: date.getDate(),
      month: Clock.months[date.getMonth()],
      hour: Clock.appendZero(hour),
      minute: Clock.appendZero(date.getMinutes()),
      second: Clock.appendZero(date.getSeconds()),

      // Analog
      secondAngle: date.getSeconds() * 6,
      minuteAngle: date.getMinutes() * 6,
      hourAngle: ((date.getHours() % 12) + date.getMinutes()/60) * 30
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
    var parts = Clock.timeParts(options);
    var oldParts = Clock._parts || {};

    Clock.$el.digital.date.html(Clock.dateTemplate(parts));

    _.each(['hour', 'minute', 'second'], function(unit){
      if( parts[unit] !== oldParts[unit] ){
        Clock.$el.digital.time.find('.' + unit).text(parts[unit]);
        Clock.$el.analog[unit].attr("transform", Clock.transformTemplate(parts[unit + 'Angle']));
      }
    });

    Clock._parts = parts;
  },

  start: function(options) {
    if (Clock._running) {
      clearInterval(Clock._running);
    }

    function tick() {
      var delayTime = 500;

      Clock.refresh(options);

      Clock._running = setTimeout(function(){
        window.requestAnimationFrame( tick );
      }, delayTime);
    }

    tick();
  }
};

function style() {
  var options = Storage.options.defaults;
  // Kick off the clock
  Clock.start(options);
  var $main = $('#main');

  // background Color
  if (!$main.hasClass(options.color)) {
    if ($main.is("[class*='-bg']")) {
      $main[0].className = $main[0].className.replace(/\w*-bg/g, '');
    }
    $main.addClass(options.color);
  }

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

  if (!options.seconds) {
    $('#main').addClass('no-seconds');
  }
}

function main() {
  var loader = Weather.load().then(function(data) {
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
