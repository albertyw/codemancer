// Client ID and API key from the Developer Console
const CLIENT_ID = "51833028115-pss6t7ckon9v6qu4bu87sqemktjhp745.apps.googleusercontent.com";
const API_KEY = "AIzaSyBh1lCQdVjeVmeL5ewoEx7IgbG3Si3-rhM";

// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const IGNORED_CALENDARS  = ["p#weather@group.v.calendar.google.com"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";
const DEFAULT_EVENT_SUMMARY = "Busy";

const authorizeButton = document.getElementById("authorize_button");
const signoutButton = document.getElementById("signout_button");
const calendarContent = document.getElementById("calendar-content");
const calendarLookForwardMS = 24*60*60*1000;

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
    gapi.load("client:auth2", initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
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
        appendPre("Could not connect to Google Calendar");
        console.error(JSON.stringify(error, null, 2)); // eslint-disable-line
    });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.style.display = "none";
        signoutButton.style.display = "block";
        listUpcomingEvents();
    } else {
        authorizeButton.style.display = "block";
        signoutButton.style.display = "none";
    }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick() {
    gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick() {
    gapi.auth2.getAuthInstance().signOut();
}

/**
 * Append a pre element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
    const textContent = document.createTextNode(message + "\n");
    calendarContent.appendChild(textContent);

    calendarContent.classList.remove("hidden");
}

/**
 * Print the summary and start datetime/date of the next ten events in
 * the authorized user"s calendar. If no events are found an
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
                "calendarId": calendarId,
                "timeMin": timeMin.toISOString(),
                "timeMax": timeMax.toISOString(),
                "showDeleted": false,
                "singleEvents": true,
                "maxResults": 10,
                "orderBy": "startTime"
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
        let minTime = "z";
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
        if(minTime === "z") {
            break;
        }
        const nextEvent = eventArrays[minTimeCalendar].shift();
        events.push(nextEvent);
    }
    return events;
}

function displayEvents(eventArrays) {
    const events = getFirstEvents(eventArrays, 10);
    appendPre("Upcoming events:");

    if (events.length === 0) {
        appendPre("No upcoming events found.");
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
        appendPre(eventName + " (" + formatTime(when) + ")");
    }
}

function formatTime(d) {
    const date = d.toDateString();
    const time = (d.getHours() % 12) + ":" + ("0"+d.getMinutes()).slice(-2);
    const dString = date + " " + time;
    return dString;
}

function showCal(calendar) {
    if(!calendar.selected) {
        return false;
    }
    if(IGNORED_CALENDARS.includes(calendar.id)) {
        return false;
    }
    return true;
}

function showCalEvent(calEvent) {
    // Show event if organized by self
    if (calEvent.organizer && calEvent.organizer.self) {
        return true;
    }

    // Show event if accepted as an attendee
    if (calEvent.attendees) {
        for(let i=0; i<calEvent.attendees.length; i++) {
            const attendee = calEvent.attendees[i];
            if(!attendee.self) {
                continue;
            }
            return attendee.responseStatus === "accepted";
        }
    }

    // Show event by default
    return true;
}

function runOnload(onloadFunc) {
    if(window.attachEvent) {
        window.attachEvent("onload", onloadFunc);
    } else {
        if(window.onload) {
            const currOnload = window.onload;
            const newOnload = function(evt) {
                currOnload(evt);
                onloadFunc(evt);
            };
            window.onload = newOnload;
        } else {
            window.onload = onloadFunc;
        }
    }
}

function trimString(s) {
    return s.replace(/^\s+|\s+$/g, "");
}

runOnload(handleClientLoad);
