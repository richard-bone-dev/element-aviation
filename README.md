# Weekly rota planner

Static rota-planning prototype for a 3-person private aviation client services team.

## Files

- `index.html` - app shell and controls.
- `styles.css` - responsive layout and rota grid styling.
- `app.js` - editable rota JSON, rendering, validation, scoring, and exports.
- `README.md` - this guide.

## How to use

Open `index.html` in a browser. No build step, server, database, framework, or package install is required.

The rota uses US Eastern time as the master schedule. RS and DP are UK-based, so the grid shows UK local equivalents for assigned UK coverage.

Use the week navigation controls above the grid to move between weeks. The weekday rota pattern remains editable for the displayed week, and the weekend/on-call owner updates from the weekend rotation unless a manual assignment is set for that week.

## Editing the rota

Use the block editor to add or replace a day/time block. Clicking a grid slot also opens a quick editor for that 30-minute slot.

Weekend/on-call cover is shown below the weekday grid as a collapsible section. The side panel also lets you change the on-call owner for the currently displayed week.

The editable JSON panel contains the full rota object:

- people;
- time zones;
- availability assumptions;
- coverage rules;
- weekend rotation;
- scoring weights;
- weekday schedule blocks.

After changing the JSON, click **Apply JSON** to re-render the app.

## Validation

The app warns when:

- 08:00-22:00 ET has no cover;
- 11:00-18:00 ET has fewer than 2 people;
- AS is assigned during the childcare block;
- AS is assigned after 18:30 ET without override;
- a UK team member has an unsafe late-to-early turnaround.

## Fairness scoring

The fairness table reports:

- total assigned hours;
- peak hours;
- evening hours;
- weekend/on-call hours;
- weighted burden score.

Adjust weights in `app.js` or the editable JSON panel to match the team's preferred fairness model.

## Export

Use **Export JSON** for the full planning model and **Export CSV** for day/time assignment rows suitable for review before entering the agreed rota into Outlook, Salesforce, Teams Shifts, or another operational system.
