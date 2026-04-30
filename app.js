const ROTA_DATA = {
  config: {
    weekStart: '2026-04-27',
    masterTimeZone: 'America/New_York',
    ukTimeZone: 'Europe/London',
    slotMinutes: 30,
    days: [
      { id: 'mon', label: 'Monday', dateOffset: 0 },
      { id: 'tue', label: 'Tuesday', dateOffset: 1 },
      { id: 'wed', label: 'Wednesday', dateOffset: 2 },
      { id: 'thu', label: 'Thursday', dateOffset: 3 },
      { id: 'fri', label: 'Friday', dateOffset: 4 }
    ],
    people: [
      {
        id: 'RS',
        name: 'RS',
        location: 'UK-based',
        homeTimeZone: 'Europe/London',
        isUkBased: true,
        colorClass: 'rs'
      },
      {
        id: 'DP',
        name: 'DP',
        location: 'UK-based',
        homeTimeZone: 'Europe/London',
        isUkBased: true,
        colorClass: 'dp'
      },
      {
        id: 'AS',
        name: 'AS',
        location: 'Miami-based',
        homeTimeZone: 'America/New_York',
        isUkBased: false,
        colorClass: 'as',
        availability: {
          typicalStart: '09:45',
          childcare: { start: '15:45', end: '17:30' },
          generallyUnavailableAfter: '18:30'
        }
      }
    ],
    coverageRules: {
      standard: { start: '08:00', end: '22:00', minPeople: 1 },
      peak: { start: '11:00', end: '18:00', minPeople: 2 },
      weekendOnCall: { startDay: 'fri', start: '22:00', endDay: 'mon', end: '08:00' }
    },
    turnaroundRules: {
      ukLateFinishAtOrAfter: '22:00',
      nextDayEarlyStartAtOrBefore: '10:00',
      minimumRestHours: 10
    },
    weekendRotation: {
      baseWeekStart: '2026-04-27',
      assignedTo: 'RS',
      rotationOrder: ['RS', 'DP', 'AS'],
      backupOrder: ['DP', 'AS', 'RS'],
      assignments: {
        '2026-04-27': 'RS'
      },
      estimatedHours: 58
    },
    scoringWeights: {
      assignedHour: 1,
      peakHour: 0.5,
      eveningHour: 1.2,
      weekendOnCallHour: 0.35,
      childcareConflict: 4,
      lateToEarlyTurnaround: 6
    }
  },
  schedule: {
    mon: [
      { start: '08:00', end: '10:00', people: ['RS'] },
      { start: '10:00', end: '11:00', people: ['RS', 'AS'] },
      { start: '11:00', end: '15:30', people: ['RS', 'AS'] },
      { start: '15:30', end: '18:00', people: ['RS', 'DP'] },
      { start: '18:00', end: '22:00', people: ['DP'] }
    ],
    tue: [
      { start: '08:00', end: '10:00', people: ['DP'] },
      { start: '10:00', end: '11:00', people: ['DP', 'AS'] },
      { start: '11:00', end: '15:30', people: ['DP', 'AS'] },
      { start: '15:30', end: '18:00', people: ['RS', 'DP'] },
      { start: '18:00', end: '22:00', people: ['RS'] }
    ],
    wed: [
      { start: '08:00', end: '10:00', people: ['RS'] },
      { start: '10:00', end: '11:00', people: ['RS', 'AS'] },
      { start: '11:00', end: '15:30', people: ['RS', 'AS'] },
      { start: '15:30', end: '18:00', people: ['RS', 'DP'] },
      { start: '18:00', end: '22:00', people: ['DP'] }
    ],
    thu: [
      { start: '08:00', end: '10:00', people: ['DP'] },
      { start: '10:00', end: '11:00', people: ['DP', 'AS'] },
      { start: '11:00', end: '15:30', people: ['DP', 'AS'] },
      { start: '15:30', end: '18:00', people: ['RS', 'DP'] },
      { start: '18:00', end: '22:00', people: ['RS'] }
    ],
    fri: [
      { start: '08:00', end: '10:00', people: ['RS'] },
      { start: '10:00', end: '11:00', people: ['RS', 'AS'] },
      { start: '11:00', end: '15:30', people: ['RS', 'AS'] },
      { start: '15:30', end: '18:00', people: ['DP', 'AS'] },
      { start: '18:00', end: '22:00', people: ['DP'] }
    ]
  }
};

let rota = cloneRota(ROTA_DATA);
let activeDialogSlot = null;

const gridEl = document.getElementById('grid');
const warningsEl = document.getElementById('warnings');
const fairnessEl = document.getElementById('fairness');
const configEditorEl = document.getElementById('configEditor');
const configStatusEl = document.getElementById('configStatus');
const editDayEl = document.getElementById('editDay');
const peopleChecksEl = document.getElementById('peopleChecks');
const weekendPanelEl = document.getElementById('weekendPanel');
const weekendSummaryEl = document.getElementById('weekendSummary');
const weekRangeEl = document.getElementById('weekRange');
const dialogEl = document.getElementById('cellDialog');

document.addEventListener('DOMContentLoaded', init);

function init() {
  renderDayOptions();
  renderPeopleChecks(peopleChecksEl, 'form-person');
  bindEvents();
  renderAll();
}

function cloneRota(value) {
  return JSON.parse(JSON.stringify(value));
}

function bindEvents() {
  document.getElementById('assignmentForm').addEventListener('submit', saveBlockFromForm);
  document.getElementById('clearBlock').addEventListener('click', clearBlockFromForm);
  document.getElementById('applyConfig').addEventListener('click', applyConfig);
  document.getElementById('exportJson').addEventListener('click', exportJson);
  document.getElementById('exportCsv').addEventListener('click', exportCsv);
  document.getElementById('previousWeek').addEventListener('click', () => moveWeek(-1));
  document.getElementById('currentWeek').addEventListener('click', goToCurrentWeek);
  document.getElementById('nextWeek').addEventListener('click', () => moveWeek(1));
  document.getElementById('dialogCancel').addEventListener('click', () => dialogEl.close());
  document.getElementById('dialogSave').addEventListener('click', saveDialogSlot);
}

function renderAll() {
  renderWeekNavigation();
  renderGrid();
  renderWeekendSummary();
  renderWeekendPanel();
  const validation = validateRota();
  renderWarnings(validation);
  renderFairness(validation);
  configEditorEl.value = JSON.stringify(rota, null, 2);
}

function renderWeekNavigation() {
  const start = parseIsoDate(rota.config.weekStart);
  const end = parseIsoDate(rota.config.weekStart);
  end.setUTCDate(end.getUTCDate() + 6);
  weekRangeEl.textContent = `${formatDateLabel(start)} - ${formatDateLabel(end)}`;
}

function moveWeek(direction) {
  const date = parseIsoDate(rota.config.weekStart);
  date.setUTCDate(date.getUTCDate() + direction * 7);
  rota.config.weekStart = toIsoDate(date);
  renderAll();
}

function goToCurrentWeek() {
  rota.config.weekStart = mondayForDate(new Date());
  ensureWeekendRotationShape();
  renderAll();
}

function renderDayOptions() {
  editDayEl.innerHTML = '';
  rota.config.days.forEach((day) => {
    const option = document.createElement('option');
    option.value = day.id;
    option.textContent = day.label;
    editDayEl.appendChild(option);
  });
}

function renderPeopleChecks(container, prefix, selected = [], override = false) {
  container.innerHTML = '';
  rota.config.people.forEach((person) => {
    const label = document.createElement('label');
    label.className = 'checkbox-row';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = person.id;
    input.id = `${prefix}-${person.id}`;
    input.checked = selected.includes(person.id);
    const span = document.createElement('span');
    span.textContent = `${person.id} (${person.location})`;
    label.append(input, span);
    container.appendChild(label);
  });

  if (prefix === 'dialog-person') {
    document.getElementById('dialogOverride').checked = override;
  }
}

function renderGrid() {
  const slots = makeSlots(rota.config.coverageRules.standard.start, rota.config.coverageRules.standard.end);
  const grid = document.createElement('div');
  grid.className = 'rota-grid';

  const corner = document.createElement('div');
  corner.className = 'grid-head';
  corner.innerHTML = '<strong>ET</strong><span>UK equivalent</span>';
  grid.appendChild(corner);

  rota.config.days.forEach((day) => {
    const head = document.createElement('div');
    head.className = 'grid-head';
    head.innerHTML = `<strong>${day.label}</strong><span>${dateForDay(day)}</span>`;
    grid.appendChild(head);
  });

  slots.forEach((slot) => {
    const timeCell = document.createElement('div');
    timeCell.className = 'time-cell';
    timeCell.innerHTML = `<strong>${slot.start}-${slot.end}</strong><span>UK ${formatLocalRange(0, slot.start, slot.end, rota.config.ukTimeZone)}</span>`;
    grid.appendChild(timeCell);

    rota.config.days.forEach((day) => {
      const assignment = getAssignmentForSlot(day.id, slot.start, slot.end);
      const slotIssues = validateSlot(day.id, slot.start, slot.end, assignment.people, assignment.override);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = ['slot-cell', isPeak(slot.start, slot.end) ? 'peak' : '', slotIssues.error ? 'issue' : '', slotIssues.warning ? 'warning' : ''].filter(Boolean).join(' ');
      button.addEventListener('click', () => openSlotDialog(day.id, slot.start, slot.end, assignment));

      const chips = document.createElement('span');
      chips.className = 'slot-content';
      assignment.people.forEach((personId) => {
        const person = personById(personId);
        const chip = document.createElement('span');
        chip.className = `person-chip ${person.colorClass}`;
        chip.textContent = personId;
        chips.appendChild(chip);
      });

      const note = document.createElement('span');
      note.className = 'slot-note';
      note.textContent = buildSlotNote(day, slot.start, slot.end, assignment.people);
      button.append(chips, note);
      grid.appendChild(button);
    });
  });

  gridEl.innerHTML = '';
  gridEl.appendChild(grid);
}

function renderWeekendPanel() {
  ensureWeekendRotationShape();
  const rotation = rota.config.weekendRotation;
  const owner = getWeekendOwnerForWeek(rota.config.weekStart);
  const wrapper = document.createElement('div');
  wrapper.className = 'weekend-control';

  const label = document.createElement('label');
  label.textContent = 'Assigned on-call owner for this week';
  const select = document.createElement('select');
  rota.config.people.forEach((person) => {
    const option = document.createElement('option');
    option.value = person.id;
    option.textContent = `${person.id} (${person.location})`;
    option.selected = owner === person.id;
    select.appendChild(option);
  });
  select.addEventListener('change', () => {
    setWeekendOwnerForWeek(rota.config.weekStart, select.value);
    renderAll();
  });
  label.appendChild(select);

  const meta = document.createElement('div');
  meta.className = 'weekend-meta';
  meta.textContent = `${weekendRangeLabel()} - Estimated burden: ${rotation.estimatedHours} on-call hours.`;
  wrapper.append(label, meta);
  weekendPanelEl.innerHTML = '';
  weekendPanelEl.appendChild(wrapper);
}

function renderWeekendSummary() {
  ensureWeekendRotationShape();
  const ownerId = getWeekendOwnerForWeek(rota.config.weekStart);
  const owner = personById(ownerId) || rota.config.people[0];
  const weekendRule = rota.config.coverageRules.weekendOnCall;
  const override = Boolean(rota.config.weekendRotation.assignments[rota.config.weekStart]);
  const fridayDate = dateForOffset(4);
  const mondayDate = dateForOffset(7);

  weekendSummaryEl.innerHTML = `
    <details>
      <summary>
        <span class="weekend-title">
          Weekend on-call
          <span class="person-chip ${owner.colorClass}">${owner.id}</span>
        </span>
        <span class="weekend-meta">${weekendRangeLabel()}${override ? ' - manual assignment' : ' - rotation'}</span>
      </summary>
      <div class="weekend-detail">
        <p>${owner.id} is assigned from Friday 22:00 ET to Monday 08:00 ET for the displayed week.</p>
        <div class="weekend-times" aria-label="Weekend cover dates">
          <div class="weekend-time-block">
            <strong>Start ET</strong>
            <span>${formatDateLabel(fridayDate)} ${weekendRule.start}</span>
          </div>
          <div class="weekend-time-block">
            <strong>End ET</strong>
            <span>${formatDateLabel(mondayDate)} ${weekendRule.end}</span>
          </div>
          <div class="weekend-time-block">
            <strong>UK equivalent</strong>
            <span>${formatWeekendLocalRange(rota.config.ukTimeZone)}</span>
          </div>
        </div>
      </div>
    </details>
  `;
}

function renderWarnings(validation) {
  warningsEl.innerHTML = '';
  if (!validation.warnings.length) {
    const ok = document.createElement('div');
    ok.className = 'warning-item ok';
    ok.textContent = 'No validation warnings for the current rota.';
    warningsEl.appendChild(ok);
    return;
  }

  validation.warnings.forEach((warning) => {
    const item = document.createElement('div');
    item.className = `warning-item ${warning.level === 'warning' ? 'caution' : ''}`;
    item.textContent = warning.message;
    warningsEl.appendChild(item);
  });
}

function renderFairness(validation) {
  const scores = calculateFairness(validation);
  const rows = scores.map((score) => `
    <tr>
      <td>${score.id}</td>
      <td>${score.assigned.toFixed(1)}</td>
      <td>${score.peak.toFixed(1)}</td>
      <td>${score.evening.toFixed(1)}</td>
      <td>${score.weekend.toFixed(1)}</td>
      <td><span class="score-pill">${score.score.toFixed(1)}</span></td>
    </tr>
  `).join('');

  fairnessEl.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Person</th>
          <th>Total</th>
          <th>Peak</th>
          <th>Evening</th>
          <th>On-call</th>
          <th>Burden</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function saveBlockFromForm(event) {
  event.preventDefault();
  const block = {
    start: document.getElementById('editStart').value,
    end: document.getElementById('editEnd').value,
    people: selectedPeople(peopleChecksEl)
  };
  if (document.getElementById('asOverride').checked) {
    block.overrides = { ASAfter1830: true };
  }
  upsertBlock(editDayEl.value, block);
  renderAll();
}

function clearBlockFromForm() {
  const dayId = editDayEl.value;
  const start = document.getElementById('editStart').value;
  const end = document.getElementById('editEnd').value;
  rota.schedule[dayId] = (rota.schedule[dayId] || []).filter((block) => !(block.start === start && block.end === end));
  renderAll();
}

function openSlotDialog(dayId, start, end, assignment) {
  activeDialogSlot = { dayId, start, end };
  const day = rota.config.days.find((item) => item.id === dayId);
  document.getElementById('dialogTitle').textContent = `${day.label} ${start}-${end} ET`;
  document.getElementById('dialogMeta').textContent = `UK equivalent ${formatLocalRange(day.dateOffset, start, end, rota.config.ukTimeZone)}`;
  renderPeopleChecks(document.getElementById('dialogChecks'), 'dialog-person', assignment.people, assignment.override);
  dialogEl.showModal();
}

function saveDialogSlot(event) {
  event.preventDefault();
  if (!activeDialogSlot) {
    return;
  }
  const block = {
    start: activeDialogSlot.start,
    end: activeDialogSlot.end,
    people: selectedPeople(document.getElementById('dialogChecks'))
  };
  if (document.getElementById('dialogOverride').checked) {
    block.overrides = { ASAfter1830: true };
  }
  upsertBlock(activeDialogSlot.dayId, block);
  dialogEl.close();
  renderAll();
}

function applyConfig() {
  try {
    const parsed = JSON.parse(configEditorEl.value);
    assertConfigShape(parsed);
    rota = parsed;
    renderDayOptions();
    renderPeopleChecks(peopleChecksEl, 'form-person');
    configStatusEl.textContent = 'Config applied.';
    renderAll();
  } catch (error) {
    configStatusEl.textContent = `Could not apply config: ${error.message}`;
  }
}

function assertConfigShape(value) {
  if (!value || !value.config || !value.schedule) {
    throw new Error('Expected top-level config and schedule objects.');
  }
  if (!Array.isArray(value.config.people) || !Array.isArray(value.config.days)) {
    throw new Error('Expected config.people and config.days arrays.');
  }
}

function upsertBlock(dayId, block) {
  if (!isValidRange(block.start, block.end)) {
    configStatusEl.textContent = 'Start time must be before end time.';
    return;
  }
  rota.schedule[dayId] = rota.schedule[dayId] || [];
  rota.schedule[dayId] = rota.schedule[dayId].filter((existing) => !(existing.start === block.start && existing.end === block.end));
  if (block.people.length) {
    rota.schedule[dayId].push(block);
    rota.schedule[dayId].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  }
}

function selectedPeople(container) {
  return Array.from(container.querySelectorAll('input[type="checkbox"]:checked')).map((input) => input.value);
}

function validateRota() {
  const warnings = [];
  const slotMap = [];
  const standardSlots = makeSlots(rota.config.coverageRules.standard.start, rota.config.coverageRules.standard.end);

  rota.config.days.forEach((day) => {
    standardSlots.forEach((slot) => {
      const assignment = getAssignmentForSlot(day.id, slot.start, slot.end);
      const slotIssues = validateSlot(day.id, slot.start, slot.end, assignment.people, assignment.override);
      slotMap.push({ dayId: day.id, start: slot.start, end: slot.end, people: assignment.people, issues: slotIssues });
      warnings.push(...slotIssues.messages);
    });
  });

  warnings.push(...validateTurnaround());
  return { warnings, slotMap };
}

function validateSlot(dayId, start, end, people, override = false) {
  const messages = [];
  let error = false;
  let warning = false;
  const day = rota.config.days.find((item) => item.id === dayId);
  const standard = rota.config.coverageRules.standard;
  const peak = rota.config.coverageRules.peak;

  if (intersects(start, end, standard.start, standard.end) && people.length < standard.minPeople) {
    error = true;
    messages.push({ level: 'error', message: `${day.label} ${start}-${end} ET has no standard coverage.` });
  }

  if (intersects(start, end, peak.start, peak.end) && people.length < peak.minPeople) {
    error = true;
    messages.push({ level: 'error', message: `${day.label} ${start}-${end} ET has fewer than 2 people during peak coverage.` });
  }

  const as = personById('AS');
  if (people.includes('AS') && as && as.availability) {
    if (as.availability.typicalStart && toMinutes(start) < toMinutes(as.availability.typicalStart)) {
      warning = true;
      messages.push({ level: 'warning', message: `${day.label} ${start}-${end} ET assigns AS before the typical 09:45-10:00 start window.` });
    }
    const childcare = as.availability.childcare;
    if (childcare && intersects(start, end, childcare.start, childcare.end)) {
      warning = true;
      messages.push({ level: 'warning', message: `${day.label} ${start}-${end} ET assigns AS during childcare availability block.` });
    }
    if (as.availability.generallyUnavailableAfter && toMinutes(end) > toMinutes(as.availability.generallyUnavailableAfter) && !override) {
      warning = true;
      messages.push({ level: 'warning', message: `${day.label} ${start}-${end} ET assigns AS after 18:30 without override.` });
    }
  }

  people
    .map((personId) => personById(personId))
    .filter((person) => person && person.isUkBased)
    .forEach((person) => {
      if (toMinutes(end) >= toMinutes(rota.config.turnaroundRules.ukLateFinishAtOrAfter)) {
        warning = true;
        messages.push({ level: 'warning', message: `${day.label} ${start}-${end} ET is a high-burden late finish for UK-based ${person.id}.` });
      }
    });

  return { error, warning, messages };
}

function validateTurnaround() {
  const warnings = [];
  const rules = rota.config.turnaroundRules;
  const ukPeople = rota.config.people.filter((person) => person.isUkBased);

  ukPeople.forEach((person) => {
    for (let index = 0; index < rota.config.days.length - 1; index += 1) {
      const currentDay = rota.config.days[index];
      const nextDay = rota.config.days[index + 1];
      const currentBlocks = blocksForPerson(currentDay.id, person.id);
      const nextBlocks = blocksForPerson(nextDay.id, person.id);
      if (!currentBlocks.length || !nextBlocks.length) {
        continue;
      }
      const finish = Math.max(...currentBlocks.map((block) => toMinutes(block.end)));
      const nextStart = Math.min(...nextBlocks.map((block) => toMinutes(block.start)));
      const restHours = (24 * 60 - finish + nextStart) / 60;
      const isSpecificLateEarly = finish >= toMinutes(rules.ukLateFinishAtOrAfter) && nextStart <= toMinutes(rules.nextDayEarlyStartAtOrBefore);
      if (restHours < rules.minimumRestHours || isSpecificLateEarly) {
        warnings.push({
          level: 'warning',
          message: `${person.id} has a late-to-early turnaround from ${currentDay.label} ${fromMinutes(finish)} ET to ${nextDay.label} ${fromMinutes(nextStart)} ET (${restHours.toFixed(1)}h rest).`
        });
      }
    }
  });

  return warnings;
}

function calculateFairness(validation) {
  const weights = rota.config.scoringWeights;
  const scores = Object.fromEntries(rota.config.people.map((person) => [person.id, {
    id: person.id,
    assigned: 0,
    peak: 0,
    evening: 0,
    weekend: 0,
    childcareConflicts: 0,
    turnaroundWarnings: 0,
    score: 0
  }]));

  validation.slotMap.forEach((slot) => {
    const hours = durationHours(slot.start, slot.end);
    slot.people.forEach((personId) => {
      scores[personId].assigned += hours;
      if (isPeak(slot.start, slot.end)) {
        scores[personId].peak += hours;
      }
      if (toMinutes(slot.end) > toMinutes('18:00')) {
        scores[personId].evening += hours;
      }
      if (personId === 'AS' && slot.issues.messages.some((item) => item.message.includes('childcare'))) {
        scores[personId].childcareConflicts += 1;
      }
    });
  });

  const weekendOwner = getWeekendOwnerForWeek(rota.config.weekStart);
  if (scores[weekendOwner]) {
    scores[weekendOwner].weekend += rota.config.weekendRotation.estimatedHours;
  }

  validation.warnings.forEach((warning) => {
    rota.config.people.forEach((person) => {
      if (warning.message.startsWith(`${person.id} has a late-to-early`)) {
        scores[person.id].turnaroundWarnings += 1;
      }
    });
  });

  Object.values(scores).forEach((score) => {
    score.score =
      score.assigned * weights.assignedHour +
      score.peak * weights.peakHour +
      score.evening * weights.eveningHour +
      score.weekend * weights.weekendOnCallHour +
      score.childcareConflicts * weights.childcareConflict +
      score.turnaroundWarnings * weights.lateToEarlyTurnaround;
  });

  return Object.values(scores);
}

function exportJson() {
  downloadFile('rota-planner.json', JSON.stringify(rota, null, 2), 'application/json');
}

function exportCsv() {
  const lines = [['Day', 'Start ET', 'End ET', 'People', 'UK equivalent', 'AS override'].join(',')];
  rota.config.days.forEach((day) => {
    (rota.schedule[day.id] || []).forEach((block) => {
      lines.push([
        csvEscape(day.label),
        block.start,
        block.end,
        csvEscape(block.people.join(' ')),
        csvEscape(formatLocalRange(day.dateOffset, block.start, block.end, rota.config.ukTimeZone)),
        block.overrides && block.overrides.ASAfter1830 ? 'yes' : 'no'
      ].join(','));
    });
  });
  lines.push([
    'Weekend on-call',
    'Friday 22:00',
    'Monday 08:00',
    getWeekendOwnerForWeek(rota.config.weekStart),
    csvEscape(formatWeekendLocalRange(rota.config.ukTimeZone)),
    ''
  ].join(','));
  downloadFile('rota-planner.csv', lines.join('\n'), 'text/csv');
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function getAssignmentForSlot(dayId, start, end) {
  const blocks = rota.schedule[dayId] || [];
  const people = new Set();
  let override = false;
  blocks.forEach((block) => {
    if (intersects(start, end, block.start, block.end)) {
      block.people.forEach((personId) => people.add(personId));
      override = override || Boolean(block.overrides && block.overrides.ASAfter1830);
    }
  });
  return { people: Array.from(people), override };
}

function blocksForPerson(dayId, personId) {
  return (rota.schedule[dayId] || []).filter((block) => block.people.includes(personId));
}

function makeSlots(start, end) {
  const slots = [];
  const step = rota.config.slotMinutes;
  for (let minutes = toMinutes(start); minutes < toMinutes(end); minutes += step) {
    slots.push({ start: fromMinutes(minutes), end: fromMinutes(minutes + step) });
  }
  return slots;
}

function buildSlotNote(day, start, end, people) {
  const ukPeople = people.filter((personId) => personById(personId).isUkBased);
  if (!people.length) {
    return 'No one assigned';
  }
  if (!ukPeople.length) {
    return 'Miami local same as ET';
  }
  return `${ukPeople.join('/')} UK ${formatLocalRange(day.dateOffset, start, end, rota.config.ukTimeZone)}`;
}

function isPeak(start, end) {
  const peak = rota.config.coverageRules.peak;
  return intersects(start, end, peak.start, peak.end);
}

function dateForDay(day) {
  return formatDateLabel(dateForOffset(day.dateOffset));
}

function dateForOffset(offset) {
  const date = parseIsoDate(rota.config.weekStart);
  date.setUTCDate(date.getUTCDate() + offset);
  return date;
}

function formatDateLabel(date) {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function mondayForDate(date) {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utcDate.getUTCDay();
  const offset = day === 0 ? -6 : 1 - day;
  utcDate.setUTCDate(utcDate.getUTCDate() + offset);
  return toIsoDate(utcDate);
}

function weekendRangeLabel() {
  const startDate = dateForOffset(4);
  const endDate = dateForOffset(7);
  return `${formatDateLabel(startDate)} 22:00 ET to ${formatDateLabel(endDate)} 08:00 ET`;
}

function formatWeekendLocalRange(timeZone) {
  const start = formatLocalDateTime(4, rota.config.coverageRules.weekendOnCall.start, timeZone);
  const end = formatLocalDateTime(7, rota.config.coverageRules.weekendOnCall.end, timeZone);
  return `${start} to ${end}`;
}

function ensureWeekendRotationShape() {
  rota.config.weekendRotation = rota.config.weekendRotation || {};
  const rotation = rota.config.weekendRotation;
  rotation.baseWeekStart = rotation.baseWeekStart || rota.config.weekStart;
  rotation.assignedTo = rotation.assignedTo || rota.config.people[0].id;
  rotation.rotationOrder = rotation.rotationOrder && rotation.rotationOrder.length ? rotation.rotationOrder : [
    rotation.assignedTo,
    ...(rotation.backupOrder || [])
  ].filter((personId, index, values) => values.indexOf(personId) === index);
  rotation.assignments = rotation.assignments || {};
  if (!rotation.assignments[rotation.baseWeekStart]) {
    rotation.assignments[rotation.baseWeekStart] = rotation.assignedTo;
  }
}

function getWeekendOwnerForWeek(weekStart) {
  ensureWeekendRotationShape();
  const rotation = rota.config.weekendRotation;
  if (rotation.assignments[weekStart]) {
    return rotation.assignments[weekStart];
  }
  const index = modulo(weeksBetween(rotation.baseWeekStart, weekStart), rotation.rotationOrder.length);
  return rotation.rotationOrder[index];
}

function setWeekendOwnerForWeek(weekStart, personId) {
  ensureWeekendRotationShape();
  rota.config.weekendRotation.assignments[weekStart] = personId;
  if (weekStart === rota.config.weekendRotation.baseWeekStart) {
    rota.config.weekendRotation.assignedTo = personId;
  }
}

function weeksBetween(start, end) {
  const startDate = parseIsoDate(start);
  const endDate = parseIsoDate(end);
  return Math.round((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
}

function modulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}

function formatLocalRange(dayOffset, start, end, timeZone) {
  return `${formatLocalTime(dayOffset, start, timeZone)}-${formatLocalTime(dayOffset, end, timeZone)}`;
}

function formatLocalTime(dayOffset, time, timeZone) {
  const date = etWallTimeToDate(dayOffset, time);
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
}

function formatLocalDateTime(dayOffset, time, timeZone) {
  const date = etWallTimeToDate(dayOffset, time);
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
}

function etWallTimeToDate(dayOffset, time) {
  const [year, month, day] = rota.config.weekStart.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const utcGuess = new Date(Date.UTC(year, month - 1, day + dayOffset, hour, minute));
  const offset = timeZoneOffsetMinutes(utcGuess, rota.config.masterTimeZone);
  return new Date(utcGuess.getTime() - offset * 60000);
}

function timeZoneOffsetMinutes(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(date);
  const values = Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
  const asUtc = Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), Number(values.hour), Number(values.minute), Number(values.second));
  return (asUtc - date.getTime()) / 60000;
}

function personById(personId) {
  return rota.config.people.find((person) => person.id === personId);
}

function intersects(startA, endA, startB, endB) {
  return toMinutes(startA) < toMinutes(endB) && toMinutes(endA) > toMinutes(startB);
}

function isValidRange(start, end) {
  return toMinutes(start) < toMinutes(end);
}

function durationHours(start, end) {
  return (toMinutes(end) - toMinutes(start)) / 60;
}

function toMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function fromMinutes(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const minutes = (totalMinutes % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function parseIsoDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function csvEscape(value) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}
