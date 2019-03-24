const swal = require('sweetalert');

const util = require('./util');

// Client ID and API key from the Developer Console
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const API_KEY = process.env.GOOGLE_API_KEY;

// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
const IGNORED_CALENDARS  = ['p#weather@group.v.calendar.google.com'];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
const DEFAULT_EVENT_SUMMARY = 'Busy';

const authorizeButton = document.getElementById('authorize_button');
const signoutButton = document.getElementById('signout_button');
const calendarContent = document.getElementById('calendar-content');
const calendarLookForwardMS = 24*60*60*1000;

let authClicks = 0;
const AUTH_DEBUG_INFO = `If google authentication is not working, check that
you are allowing cookies for google domains`;

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  if (!API_KEY || !CLIENT_ID) return;
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
  }, function(error) {
    appendPre('Could not connect to Google Calendar');
    console.error(JSON.stringify(error, null, 2)); // eslint-disable-line
  });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'inline';
    listUpcomingEvents();
  } else {
    authorizeButton.style.display = 'inline';
    signoutButton.style.display = 'none';
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick() {
  authClicks += 1;
  gapi.auth2.getAuthInstance().signIn();
  if(authClicks >= 2) {
    // User has tried authing at least twice and may need debugging
    swal({
      text: AUTH_DEBUG_INFO,
      icon: 'warning',
    });
  }
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick() {
  authClicks -= 1;
  gapi.auth2.getAuthInstance().signOut();
  calendarContent.innerText = '';
  calendarContent.classList.add('hidden');
}

/**
 * Append a pre element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
  const textContent = document.createTextNode(message + '\n');
  calendarContent.appendChild(textContent);

  calendarContent.classList.remove('hidden');
}

/**
 * Print the summary and start datetime/date of the next ten events in
 * the authorized user's calendar. If no events are found an
 * appropriate message is printed.
 */
function listUpcomingEvents() {
  const eventArrays = [];
  gapi.client.calendar.calendarList.list({
  }).then(function(response) {
    const calendars = response.result.items;
    let calendarsFound = 0;
    for(let i=0; i<calendars.length; i++) {
      const calendar = calendars[i];
      if(!showCal(calendar)) {
        continue;
      }
      calendarsFound++;
      const calendarId = calendar.id;
      const timeMin = new Date();
      const timeMax = new Date();
      timeMax.setTime(timeMax.getTime() + calendarLookForwardMS);
      gapi.client.calendar.events.list({
        'calendarId': calendarId,
        'timeMin': timeMin.toISOString(),
        'timeMax': timeMax.toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 10,
        'orderBy': 'startTime'
      }).then(function(response) {
        const calendarEvents = response.result.items.filter(showCalEvent);
        eventArrays.push(calendarEvents);
        if(calendarsFound === eventArrays.length) {
          displayEvents(eventArrays);
        }
      });
    }
  });
}

function getFirstEvents(eventArrays, eventCount) {
  const events = [];
  while(events.length < eventCount) {
    let minTime = 'z';
    let minTimeCalendar = 0;
    for(let i=0; i<eventArrays.length; i++) {
      if(eventArrays[i].length === 0) {
        continue;
      }
      let when = eventArrays[i][0].start.dateTime;
      if (!when) {
        when = eventArrays[i][0].start.date;
      }
      if(when < minTime) {
        minTime = when;
        minTimeCalendar = i;
      }
    }
    if(minTime === 'z') {
      break;
    }
    const nextEvent = eventArrays[minTimeCalendar].shift();
    events.push(nextEvent);
  }
  return events;
}

function displayEvents(eventArrays) {
  const events = getFirstEvents(eventArrays, 10);
  if (events.length === 0) {
    appendPre('No upcoming events found.');
    return;
  }

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    let eventStart = event.start.dateTime;
    if (!eventStart) {
      eventStart = event.start.date;
    }
    const when = new Date();
    when.setTime(Date.parse(eventStart));
    const eventName = trimString(event.summary || DEFAULT_EVENT_SUMMARY);
    appendPre(eventName + ' (' + formatTime(when) + ')');
  }
}

function formatTime(d) {
  const date = d.toDateString();
  const hour = (d.getHours() + 11) % 12 + 1;
  const minutes = ('0' + d.getMinutes().toString()).slice(-2);
  const period = d.getHours() < 12 ? 'AM' : 'PM';
  const time = hour + ':' + minutes + ' ' + period;
  const dString = date + ' ' + time;
  return dString;
}

function showCal(calendar) {
  if(calendar.accessRole !== 'owner') {
    return false;
  }
  if(!calendar.selected) {
    return false;
  }
  if(IGNORED_CALENDARS.includes(calendar.id)) {
    return false;
  }
  return true;
}

function showCalEvent(calEvent) {
  // Show event if accepted as an attendee
  if (calEvent.attendees) {
    for(let i=0; i<calEvent.attendees.length; i++) {
      const attendee = calEvent.attendees[i];
      if(!attendee.self) {
        continue;
      }
      return attendee.responseStatus === 'accepted';
    }
  }

  // Show event if organized by self that have no attendees
  if (calEvent.organizer && calEvent.organizer.self) {
    return true;
  }

  // Show event by default
  return true;
}

function trimString(s) {
  return s.replace(/^\s+|\s+$/g, '');
}

util.runOnload(handleClientLoad);

module.exports = {
  formatTime: formatTime,
  trimString: trimString
};
