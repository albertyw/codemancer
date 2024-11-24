import $ from 'jquery';

import { getMockDate } from './util.js';

export const Clock = {
  _parts : {
    day: '',
    date: undefined,
    month: '',
    hour: '',
    minute: '',
    second: '',
  },
  _running : undefined,

  $el : {
    time : $('#time'),
    date : $('#date'),
  },

  weekdays : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
  months : ['January','February','March','April','May','June','July','August','September','October','November','December'],

  timeParts: function(): any {
    const date = getMockDate();
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
      hour: Clock.prependZero(hour, false),
      minute: Clock.prependZero(date.getMinutes(), true),
      second: Clock.prependZero(date.getSeconds(), true),
    };
  },

  prependZero : function prependZero(num: number, visible: boolean): string {
    if(num < 10) {
      if(visible) {
        return '0' + num;
      }
      return '<span class="invisible">0</span>' + num;
    }
    return '' + num;
  },

  dateTemplate: function dateTemplate(parts: any): string{
    return parts.day + ', ' + parts.month + ' ' + parts.date;
  },

  refresh: function(): void {
    const parts = Clock.timeParts();
    const oldParts = Clock._parts;

    Clock.$el.date.html(Clock.dateTemplate(parts));

    const units = ['hour', 'minute', 'second'];
    for (let i=0; i<units.length; i++) {
      const unit = units[i];
      if( parts[unit] !== oldParts[unit] ){
        Clock.$el.time.find('.' + unit).html(parts[unit]);
      }
    }

    Clock._parts = parts;
  },

  start: function(): void {
    if (Clock._running) {
      clearInterval(Clock._running);
    }

    function tick() {
      const delayTime = 1000;

      Clock.refresh();

      Clock._running = setTimeout(function(){
        window.requestAnimationFrame( tick );
      }, delayTime);
    }

    tick();
  }
};

export function style(): void {
  // Kick off the clock
  Clock.start();
  const $main = $('main');

  // Text Color
  if ($main.is('[class*=\'-text\']')) {
    $main[0].className = $main[0].className.replace(/\w*-text/g, '');
  }
  $main.addClass('light-text');
}
