import $ from 'jquery';

import { getMockDate } from './util.js';


class TimeParts {
  day: string;
  date: number;
  month: string;
  hour: string;
  minute: string;
  second: string;

  constructor(date: Date) {
    this.day = Clock.weekdays[date.getDay()];
    this.date = date.getDate();
    this.month = Clock.months[date.getMonth()];
    this.hour = Clock.prependZero(date.getHours(), false);
    this.minute = Clock.prependZero(date.getMinutes(), true);
    this.second = Clock.prependZero(date.getSeconds(), true);
  }

  dateTemplate(): string {
    return this.day + ', ' + this.month + ' ' + this.date;
  }
}

export class Clock {
  #parts: TimeParts;
  #running = undefined;
  #el = {
    time: $('#time'),
    date: $('#date'),
  };
  static weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  static months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  timeParts(): TimeParts {
    const date = getMockDate();
    let hour = date.getHours();

    hour = hour % 12;
    if(hour === 0) {
      hour = 12;
    }
    return new TimeParts(date);
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

  refresh(): void {
    const parts = this.timeParts();
    const oldParts = this.#parts;

    this.#el.date.html(parts.dateTemplate());

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
