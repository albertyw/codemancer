const $ = require('jquery');

const util = require('./util');
const varsnap = require('./varsnap');

const Clock = {
  $el : {
    digital : {
      time : $('#time'),
      date : $('#date')
    }
  },

  weekdays : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
  months : ['January','February','March','April','May','June','July','August','September','October','November','December'],

  timeParts: function() {
    const date = util.getMockDate();
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
      hour: Clock.prependZero(hour),
      minute: Clock.prependZero(date.getMinutes()),
      second: Clock.prependZero(date.getSeconds()),
    };
  },

  prependZero : varsnap(function preprendZero(num) {
    if(num < 10) {
      return '0' + num;
    }
    return '' + num;
  }),

  dateTemplate: varsnap(function dateTemplate(parts){
    return parts.day + ', ' + parts.month + ' ' + parts.date;
  }),

  transformTemplate: varsnap(function transformTemplate(angle){
    return 'rotate(' + angle + ',50,50)';
  }),

  refresh: function() {
    const parts = Clock.timeParts();
    const oldParts = Clock._parts || {};

    Clock.$el.digital.date.html(Clock.dateTemplate(parts));

    const units = ['hour', 'minute', 'second'];
    for (let i=0; i<units.length; i++) {
      const unit = units[i];
      if( parts[unit] !== oldParts[unit] ){
        Clock.$el.digital.time.find('.' + unit).text(parts[unit]);
      }
    }

    Clock._parts = parts;
  },

  start: function() {
    if (Clock._running) {
      clearInterval(Clock._running);
    }

    function tick() {
      const delayTime = 500;

      Clock.refresh();

      Clock._running = setTimeout(function(){
        window.requestAnimationFrame( tick );
      }, delayTime);
    }

    tick();
  }
};

function style() {
  // Kick off the clock
  Clock.start();
  const $main = $('main');

  // Text Color
  if ($main.is('[class*=\'-text\']')) {
    $main[0].className = $main[0].className.replace(/\w*-text/g, '');
  }
  $main.addClass('light-text');
}

module.exports = {
  Clock: Clock,
  start: style
};
