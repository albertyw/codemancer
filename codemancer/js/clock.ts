import $ from 'jquery';

import { getMockDate } from './util.js';
import { targetLocation, location } from './location.js';


export class TimeParts {
  date: Date;
  #tzParts: { [key: string]: string } | undefined;

  static weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  static months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  constructor(date: Date, timezone?: string) {
    this.date = date;
    if (timezone) {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
      }).formatToParts(date);
      this.#tzParts = Object.fromEntries(parts.map(p => [p.type, p.value]));
    }
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
    if (this.#tzParts) {
      return `${this.#tzParts.weekday}, ${this.#tzParts.month} ${this.#tzParts.day}`;
    }
    const day = TimeParts.weekdays[this.date.getDay()];
    const month = TimeParts.months[this.date.getMonth()];
    const date = this.date.getDate();
    return day + ', ' + month + ' ' + date;
  }

  hour(): string {
    if (this.#tzParts) {
      return TimeParts.prependZero(parseInt(this.#tzParts.hour), false);
    }
    let hour = this.date.getHours() % 12;
    if(hour === 0) {
      hour = 12;
    }
    return TimeParts.prependZero(hour, false);
  }

  minute(): string {
    if (this.#tzParts) {
      return TimeParts.prependZero(parseInt(this.#tzParts.minute), true);
    }
    return TimeParts.prependZero(this.date.getMinutes(), true);
  }

  second(): string {
    if (this.#tzParts) {
      return TimeParts.prependZero(parseInt(this.#tzParts.second), true);
    }
    return TimeParts.prependZero(this.date.getSeconds(), true);
  }
}

let clockTimezone = targetLocation.timezone;

export class Clock {
  #running: ReturnType<typeof setTimeout>|undefined = undefined;
  #updatePeriod: number = 1000; // 1 second
  #el = {
    time: $('#time'),
    date: $('#date'),
  };

  timeParts(): TimeParts {
    return new TimeParts(getMockDate(), clockTimezone);
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
      self.refresh();

      self.#running = setTimeout(function(){
        window.requestAnimationFrame( tick );
      }, self.#updatePeriod);
    }

    tick();
  }

  changePeriod(newPeriod: number): number {
    const originalUpdatePeriod = this.#updatePeriod;
    this.#updatePeriod = newPeriod;
    this.start();
    return originalUpdatePeriod;
  }
};

export const clock = new Clock();

export function load(): void {
  clock.start();
  location.getLocation().then(data => {
    if (data.timezone) {
      clockTimezone = data.timezone;
    }
  });
}
