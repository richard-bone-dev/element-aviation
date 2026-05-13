# Weekly rota planner

Static rota-planning prototype for a 3-person private aviation client services team.

## Files

- `index.html` - app shell and controls.
- `styles.css` - responsive layout, grid styling, and warning highlights.
- `app.js` - config, rota data, rendering, validation, scoring, and exports.
- `README.md` - this guide.

## How to use

Open `index.html` in a browser. No build step, server, framework, or package install is required.

US Eastern is the master time zone for all rota decisions. The visible grid searches from 03:00 to 22:00 Eastern so DP's early UK fixed hours can be seen, then displays from the first staffed slot through 22:00 Eastern. Business coverage validation still runs only from 08:00 to 22:00 Eastern. RS and DP are UK-based, so the grid shows UK local equivalents where UK staff are assigned. AS is Miami-based.

Use the week navigation controls above the grid to move between weeks. The weekday rota pattern remains editable for the displayed week, and weekend/on-call cover follows its configured RS/AS rotation unless a manual assignment is set for that week.

The Fairness panel appears above the rota grid so weekly balance is visible without adding clutter to the side panel. All panels that use the `data-panel` pattern are collapsible from their header button, including validation, fairness, block editor, weekend/on-call, config, and debug panels. Collapsed state persists in `localStorage` with keys such as `rota.panel.fairness.collapsed`.

## Editing the rota

Use the block editor to add or replace a day/time block. Clicking a grid slot also opens a quick editor for that 30-minute slot.

Weekend/on-call cover is shown below the weekday grid as a collapsible section. The side panel lets you change the eligible on-call owner for the currently displayed week.

The editable JSON panel contains the full rota object, including:

- people;
- time zones;
- weekday coverage rules;
- peak coverage rules;
- visible grid rules, separate from business and peak coverage rules;
- RS peak-cover rescue and break rules;
- availability rules;
- DP fixed working blocks and contract hours;
- DP fixed-hours debug table showing UK source times, converted Eastern times, visible clipping, and whether each block counts toward fixed scheduled hours;
- childcare unavailable blocks;
- `rotations.weekdayEarlyStarts` for the weekday early-start rotation;
- `rotations.weekdayEvenings` for the weekday late-shift rotation;
- `rotations.weekendOnCall` for the weekend/on-call rotation;
- computed assignment tokens such as `DEFAULT_CORE_ASSIGNMENTS` and `WEEKDAY_EVENING_OWNER`;
- scoring weights;
- right-column panel order;
- weekday schedule blocks.

After changing the JSON, click **Apply JSON** to re-render the app.

## Current assumptions

- Weekday cover requires at least 1 person from 08:00 to 22:00 Eastern, Monday-Friday.
- Peak weekday cover ideally has 2 people from 11:00 to 17:00 Eastern, Monday-Friday. This is an under-ideal warning, not a reason to force unsafe assignments.
- The visible rota grid searches from 03:00 Eastern and ends at 22:00 Eastern, but empty leading rows are trimmed so the displayed grid starts at the first slot with a person chip. Slots before 08:00 Eastern are display-only and do not create missing-coverage warnings.
- AS has childcare constraints from 08:00 to 09:30 Eastern and from 16:30 to 18:00 Eastern.
- AS is not assigned working cover during childcare windows; if AS is the late-shift owner, RS generated rescue/cover is shown during the affected 16:30-18:00 Eastern slots.
- DP is UK-based and has fixed working blocks stored in UK local time: Monday-Friday 09:00-15:00 UK, Monday-Wednesday 18:00-20:00 UK, and Saturday 09:00-12:00 UK. These blocks are converted into the Eastern grid and clipped to the visible 03:00-22:00 Eastern window.
- DP's fixed blocks total 39 hours against a 42-hour weekly contract target, leaving 3 hours of remaining contract capacity. Extra DP hours are optional/manual/overtime capacity and are not auto-filled.
- RS can be added automatically as peak-cover rescue where 11:00-17:00 Eastern would otherwise be below ideal, with a configurable afternoon break to avoid an unsafe continuous day.
- Weekday early-shift rotation means Monday-Friday, 09:30 to 16:30 Eastern.
- Weekday early-start duty alternates weekly between RS and AS and is normally derived as the opposite of the weekday late-shift owner.
- Weekday late-shift rotation means Monday-Friday, 11:00 to 22:00 Eastern. When AS is the late-shift owner she also has a 10:00-11:00 Eastern fairness-start block, while remaining excluded from childcare windows.
- Weekday late-shift duty alternates weekly between RS and AS.
- RS and AS have rest protection after a 22:00 Eastern finish.
- Weekend/on-call rotation runs Friday 22:00 to Monday 04:00 Eastern and alternates between RS and AS based on the weekday early-shift owner.
- Week commencing 11 May 2026 anchors the rotation: AS is early/on-call and RS is late; week commencing 18 May 2026 flips to RS early/on-call and AS late.
- DP works Saturday 04:00-07:00 Eastern as fixed UK-based weekend work and is not eligible for weekend/on-call cover.

## Validation

The app warns when:

- 08:00-22:00 Eastern has no weekday cover;
- 11:00-17:00 Eastern has fewer than the ideal 2 people;
- RS has no adequate break on a long or early-plus-late day;
- RS has too many separate working blocks in one day;
- RS has an excessive continuous working span;
- a DP fixed UK working block is missing from the rendered Eastern schedule;
- AS is assigned during either childcare unavailable block;
- DP is assigned outside fixed UK hours without manual/overtime marking;
- DP is assigned to weekend/on-call cover or to weekend work outside the approved Saturday 04:00-07:00 Eastern fixed block;
- weekend/on-call rotation assigns the wrong RS/AS person;
- weekday early-start rotation assigns the wrong RS/AS person;
- weekday late-shift rotation assigns the wrong RS/AS person;
- the same person is assigned weekday early starts and weekday late shifts in the same week;
- a UK-based person has a high-burden late finish;
- RS or AS finishes at 22:00 Eastern and is scheduled for an early next-day start.

## Fairness scoring

The fairness table reports:

- total assigned hours;
- fixed hours;
- optional/additional hours;
- contract target hours;
- remaining contract capacity;
- difference versus contract target;
- peak hours;
- RS peak-cover rescue hours;
- late-shift hours, including AS's 10:00 fairness-start block when configured;
- early-start hours;
- weekend/on-call hours;
- break count;
- longest continuous working span;
- fragmented-day warning count;
- childcare override count;
- late finish count;
- early-after-late warning count;
- weighted burden score.

Adjust weights in `app.js` or the editable JSON panel to match the team's preferred fairness model.

## Export

Use **Export JSON** for the full planning model and **Export CSV** for day/time assignment rows suitable for review before entering the agreed rota into an operational roster system.
