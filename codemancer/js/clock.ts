import $ from 'jquery';

import { getMockDate } from './util.js';

interface timeParts {
  day: string;
  date: number;
  month: string;
  hour: string;
  minute: string;
  second: string;
}

export class Clock {
  #parts: timeParts = {
    day: '',
    date: undefined,
    month: '',
    hour: '',
    minute: '',
    second: '',
  };
  #running = undefined;
  #el = {
    time: $('#time'),
    date: $('#date'),
  };
  static weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  static months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  timeParts(): timeParts {
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
  }

  static prependZero(num: number, visible: boolean): string {
    if(num < 10) {
      if(visible) {
        return '0' + num;
      }
      return '<span class="invisible">0</span>' + num;
    }
    return '' + num;
  }

  static dateTemplate(parts: timeParts): string {
    return parts.day + ', ' + parts.month + ' ' + parts.date;
  }

  refresh(): void {
    const parts = this.timeParts();
    const oldParts = this.#parts;

    this.#el.date.html(Clock.dateTemplate(parts));

    const units = ['hour', 'minute', 'second'];
    for (let i=0; i<units.length; i++) {
      const unit = units[i];
      if( parts[unit] !== oldParts[unit] ){
        this.#el.time.find('.' + unit).html(parts[unit]);
      }
    }

    this.#parts = parts;
  }

  start(): void {
    if (this.#running) {
      clearInterval(this.#running);
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    function tick() {
      const delayTime = 1000;

      self.refresh();

      self.#running = setTimeout(function(){
        window.requestAnimationFrame( tick );
      }, delayTime);
    }

    tick();
  }
};

export const clock = new Clock();

export function load(): void {
  clock.start();
}
