import $ from 'jquery';

import { getMockDate } from './util.js';


export class TimeParts {
  date: Date;

  static weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  static months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  constructor(date: Date) {
    this.date = date;
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

  dateFormatted(): string {
    const day = TimeParts.weekdays[this.date.getDay()];
    const month = TimeParts.months[this.date.getMonth()];
    const date = this.date.getDate();
    return day + ', ' + month + ' ' + date;
  }

  hour(): string {
    let hour = this.date.getHours() % 12;
    if(hour === 0) {
      hour = 12;
    }
    return TimeParts.prependZero(hour, false);
  }

  minute(): string {
    return TimeParts.prependZero(this.date.getMinutes(), true);
  }

  second(): string {
    return TimeParts.prependZero(this.date.getSeconds(), true);
  }
}

export class Clock {
  #running: ReturnType<typeof setTimeout>|undefined = undefined;
  #el = {
    time: $('#time'),
    date: $('#date'),
  };

  timeParts(): TimeParts {
    const date = getMockDate();
    return new TimeParts(date);
  }

  refresh(): void {
    const parts = this.timeParts();

    if(parts.dateFormatted() !== this.#el.date.html()) {
      this.#el.date.html(parts.dateFormatted());
    }

    if(parts.hour() !== this.#el.time.find('.hour').html()) {
      this.#el.time.find('.hour').html(parts.hour());
    }

    if(parts.minute() !== this.#el.time.find('.minute').html()) {
      this.#el.time.find('.minute').html(parts.minute());
    }

    if(parts.second() !== this.#el.time.find('.second').html()) {
      this.#el.time.find('.second').html(parts.second());
    }
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
