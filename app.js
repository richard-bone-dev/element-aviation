const ROTA_DATA = {
  config: {
    weekStart: '2026-04-27',
    masterTimeZone: 'America/New_York',
    ukTimeZone: 'Europe/London',
    slotMinutes: 30,
    visibleGridStart: '03:00',
    visibleGridEnd: '22:00',
    businessCoverageStart: '08:00',
    businessCoverageEnd: '22:00',
    peakCoverageStart: '11:00',
    peakCoverageEnd: '17:00',
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
        colorClass: 'rs',
        minRestHoursAfterLateFinish: 10,
        earliestStartAfterLateFinish: '10:00'
      },
      {
        id: 'DP',
        name: 'DP',
        displayName: 'Debbie',
        initials: 'DP',
        location: 'UK-based',
        timeZone: 'Europe/London',
        homeTimeZone: 'Europe/London',
        isUkBased: true,
        colorClass: 'dp',
        contractHoursPerWeek: 42,
        weekendEligible: false,
        optionalExtraCapacity: true,
        fixedWorkingBlocks: [
          {
            id: 'dp-weekday-main',
            label: 'weekday fixed hours',
            days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            start: '09:00',
            end: '15:00',
            timeZone: 'Europe/London',
            type: 'fixed'
          },
          {
            id: 'dp-mon-wed-evening',
            label: 'Mon-Wed evening fixed hours',
            days: ['Mon', 'Tue', 'Wed'],
            start: '18:00',
            end: '20:00',
            timeZone: 'Europe/London',
            type: 'fixed'
          },
          {
            id: 'dp-sat-morning',
            label: 'Saturday fixed hours',
            days: ['Sat'],
            start: '09:00',
            end: '12:00',
            timeZone: 'Europe/London',
            type: 'fixed'
          }
        ]
      },
      {
        id: 'AS',
        name: 'AS',
        location: 'Miami-based',
        homeTimeZone: 'America/New_York',
        isUkBased: false,
        colorClass: 'as',
        availability: {
          typicalStart: '09:30'
        },
        minRestHoursAfterLateFinish: 10,
        earliestStartAfterLateFinish: '10:00'
      }
    ],
    coverageRules: {
      weekday: { start: '08:00', end: '22:00', minPeople: 1 },
      peak: { start: '11:00', end: '17:00', idealPeople: 2 },
      weekendOnCall: { startDay: 'fri', start: '22:00', endDay: 'mon', end: '08:00' }
    },
    rsCoverageSupport: {
      enabled: true,
      normalBreakDurationMinutes: 60,
      eveningDutyBreakDurationMinutes: 120,
      preferredBreakWindowET: { start: '14:00', end: '17:00' },
      normalBreakStart: '14:00',
      eveningDutyBreakStart: '14:00',
      maxWorkingBlocksPerDay: 2,
      excessiveContinuousSpanMinutes: 420
    },
    availabilityRules: {
      AS: {
        unavailableBlocks: [
          { label: 'morning childcare', start: '08:00', end: '09:30' },
          { label: 'afternoon childcare', start: '16:30', end: '18:00' }
        ]
      },
      DP: {
        fixedHoursAreAutomaticOnly: true
      }
    },
    rotations: {
      weekdayEvenings: {
        start: '18:00',
        end: '22:00',
        participants: ['RS', 'AS'],
        baseWeekStart: '2026-04-27',
        startingPerson: 'RS',
        alternatesWeekly: true
      },
      weekdayEarlyStarts: {
        days: ['mon', 'tue', 'wed', 'thu', 'fri'],
        start: '08:00',
        end: '11:00',
        timeZone: 'America/New_York',
        participants: ['RS', 'AS'],
        baseWeekStart: '2026-04-27',
        deriveAsOppositeOf: 'weekdayEvenings',
        alternatesWeekly: true
      },
      weekendOnCall: {
        startDay: 'fri',
        start: '22:00',
        endDay: 'mon',
        end: '08:00',
        timeZone: 'America/New_York',
        baseWeekStart: '2026-04-27',
        assignedTo: 'AS',
        eligiblePeople: ['RS', 'AS'],
        participants: ['RS', 'AS'],
        rotationOrder: ['RS', 'AS'],
        backupOrder: ['AS', 'RS'],
        deriveAsOppositeOf: 'weekdayEvenings',
        alternatesWeekly: true,
        excluded: ['DP'],
        assignments: {
          '2026-04-27': 'AS'
        },
        estimatedHours: 58
      }
    },
    computedAssignmentTokens: {
      defaultCoreAssignments: 'DEFAULT_CORE_ASSIGNMENTS',
      weekdayEveningOwner: 'WEEKDAY_EVENING_OWNER'
    },
    turnaroundRules: {
      people: ['RS', 'AS'],
      highBurdenFinishAtOrAfter: '22:00',
      minimumRestHours: 10
    },
    scoringWeights: {
      assignedHour: 1,
      peakHour: 0.5,
      peakRescueHour: 0.8,
      eveningHour: 1.2,
      earlyStartHour: 0.6,
      weekendOnCallHour: 0.35,
      childcareConflict: 4,
      weekendConflict: 8,
      weekdayEveningRotationConflict: 5,
      weekdayEarlyStartRotationConflict: 5,
      samePersonEarlyAndEvening: 4,
      highBurdenLateHour: 2,
      lateToEarlyTurnaround: 6
    },
    rightColumnPanelOrder: ['validation', 'block-editor', 'weekend', 'config', 'dp-debug']
  },
  schedule: {
    mon: [
      { start: '08:00', end: '09:30', people: ['DEFAULT_CORE_ASSIGNMENTS'] },
      { start: '09:30', end: '16:30', people: ['DEFAULT_CORE_ASSIGNMENTS'] },
      { start: '16:30', end: '18:00', people: ['DEFAULT_CORE_ASSIGNMENTS'] },
      { start: '18:00', end: '20:00', people: ['WEEKDAY_EVENING_OWNER'] },
      { start: '20:00', end: '22:00', people: ['WEEKDAY_EVENING_OWNER'] }
    ],
    tue: [
      { start: '08:00', end: '09:30', people: ['DEFAULT_CORE_ASSIGNMENTS'] },
      { start: '09:30', end: '16:30', people: ['DEFAULT_CORE_ASSIGNMENTS'] },
      { start: '16:30', end: '18:00', people: ['DEFAULT_CORE_ASSIGNMENTS'] },
      { start: '18:00', end: '20:00', people: ['WEEKDAY_EVENING_OWNER'] },
      { start: '20:00', end: '22:00', people: ['WEEKDAY_EVENING_OWNER'] }
    ],
    wed: [
      { start: '08:00', end: '09:30', people: ['DEFAULT_CORE_ASSIGNMENTS'] },
      { start: '09:30', end: '16:30', people: ['DEFAULT_CORE_ASSIGNMENTS'] },
      { start: '16:30', end: '18:00', people: ['DEFAULT_CORE_ASSIGNMENTS'] },
      { start: '18:00', end: '20:00', people: ['WEEKDAY_EVENING_OWNER'] },
      { start: '20:00', end: '22:00', people: ['WEEKDAY_EVENING_OWNER'] }
    ],
    thu: [
      { start: '08:00', end: '09:30', people: ['DEFAULT_CORE_ASSIGNMENTS'] },
      { start: '09:30', end: '16:30', people: ['DEFAULT_CORE_ASSIGNMENTS'] },
      { start: '16:30', end: '18:00', people: ['DEFAULT_CORE_ASSIGNMENTS'] },
      { start: '18:00', end: '22:00', people: ['WEEKDAY_EVENING_OWNER'] }
    ],
    fri: [
      { start: '08:00', end: '09:30', people: ['DEFAULT_CORE_ASSIGNMENTS'] },
      { start: '09:30', end: '16:30', people: ['DEFAULT_CORE_ASSIGNMENTS'] },
      { start: '16:30', end: '18:00', people: ['DEFAULT_CORE_ASSIGNMENTS'] },
      { start: '18:00', end: '22:00', people: ['WEEKDAY_EVENING_OWNER'] }
    ]
  }
};

let rota = cloneRota(ROTA_DATA);
let activeDialogSlot = null;
let shouldScrollGridToCurrentHour = true;

const gridEl = document.getElementById('grid');
const warningsEl = document.getElementById('warnings');
const fairnessEl = document.getElementById('fairness');
const dpDebugEl = document.getElementById('dpDebug');
const configEditorEl = document.getElementById('configEditor');
const configStatusEl = document.getElementById('configStatus');
const editDayEl = document.getElementById('editDay');
const peopleChecksEl = document.getElementById('peopleChecks');
const weekendPanelEl = document.getElementById('weekendPanel');
const weekRangeEl = document.getElementById('weekRange');
const dialogEl = document.getElementById('cellDialog');
const smallPanelMedia = window.matchMedia('(max-width: 720px)');
const panelDefaultCollapsed = {
  validation: false,
  fairness: false,
  'block-editor': 'small',
  weekend: 'small',
  config: true,
  'dp-debug': true
};
const panelSummaries = {
  validation: 'Warnings',
  fairness: 'Weekly balance',
  'block-editor': 'Assignments',
  weekend: 'Owner',
  config: 'JSON',
  'dp-debug': 'Fixed hours'
};

document.addEventListener('DOMContentLoaded', init);

function init() {
  rota.config.weekStart = mondayForDate(new Date());
  ensureWeekendRotationShape();
  initDataPanels();
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
  bindPanelModals();
}

function bindPanelModals() {
  document.querySelectorAll('[data-modal-target]').forEach((button) => {
    button.addEventListener('click', () => {
      const modal = document.getElementById(button.dataset.modalTarget);
      if (modal) {
        modal.showModal();
      }
    });
  });

  document.querySelectorAll('.panel-modal').forEach((modal) => {
    modal.querySelectorAll('[data-modal-close]').forEach((button) => {
      button.addEventListener('click', () => modal.close());
    });
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.close();
      }
    });
  });
}

function initDataPanels(root = document) {
  root.querySelectorAll('[data-panel]').forEach((panel) => {
    if (panel.dataset.collapsible === 'false' || panel.dataset.panelInitialized === 'true') {
      return;
    }

    const panelName = panel.dataset.panel || panel.id || 'panel';
    const { header, body } = ensureDataPanelStructure(panel, panelName);
    const defaultCollapsed = defaultPanelCollapsed(panel, panelName);
    const collapsed = panel.closest('.panel-modal') ? defaultCollapsed : readPanelCollapsed(panelName, defaultCollapsed);
    panel.dataset.panelInitialized = 'true';

    header.addEventListener('click', () => {
      setPanelCollapsed(panel, header, body, !isPanelCollapsed(panel), true);
    });

    setPanelCollapsed(panel, header, body, collapsed, false);
  });
}

function ensureDataPanelStructure(panel, panelName) {
  panel.classList.add('data-panel');

  let header = findDirectChild(panel, 'data-panel__header');
  let body = findDirectChild(panel, 'data-panel__body');

  if (!header) {
    header = document.createElement('button');
    header.className = 'data-panel__header';
    header.type = 'button';

    const titleSource = findDirectHeading(panel);
    const title = titleSource ? titleSource.textContent.trim() : panelName;
    const summary = panel.dataset.panelSummary || panelSummaries[panelName] || (panelName.includes('debug') ? 'Debug' : '');
    header.append(createPanelHeaderSpan('data-panel__title', title));
    if (summary) {
      header.append(createPanelHeaderSpan('data-panel__summary', summary));
    }
    header.append(createPanelHeaderSpan('data-panel__chevron', 'v', true));
    panel.prepend(header);
    if (titleSource) {
      titleSource.remove();
    }
  }

  if (!body) {
    body = document.createElement('div');
    body.className = 'data-panel__body';
    Array.from(panel.childNodes)
      .filter((node) => node !== header)
      .forEach((node) => body.appendChild(node));
    panel.appendChild(body);
  }

  if (!body.id) {
    body.id = `panel-${panelName.replace(/[^a-z0-9-]/gi, '-').toLowerCase()}-body`;
  }

  header.type = 'button';
  header.setAttribute('aria-controls', body.id);
  return { header, body };
}

function findDirectChild(parent, className) {
  return Array.from(parent.children).find((child) => child.classList.contains(className));
}

function findDirectHeading(panel) {
  return Array.from(panel.children).find((child) => /^H[1-6]$/.test(child.tagName));
}

function createPanelHeaderSpan(className, text, hidden = false) {
  const span = document.createElement('span');
  span.className = className;
  span.textContent = text;
  if (hidden) {
    span.setAttribute('aria-hidden', 'true');
  }
  return span;
}

function defaultPanelCollapsed(panel, panelName) {
  if (panel.dataset.defaultCollapsed === 'true') {
    return true;
  }
  if (panel.dataset.defaultCollapsed === 'false') {
    return false;
  }
  if (panel.dataset.defaultCollapsed === 'small') {
    return smallPanelMedia.matches;
  }
  if (panel.closest('.side-panel')) {
    return true;
  }

  const configuredDefault = panelDefaultCollapsed[panelName];
  if (configuredDefault === 'small') {
    return smallPanelMedia.matches;
  }
  if (typeof configuredDefault === 'boolean') {
    return configuredDefault;
  }
  return true;
}

function readPanelCollapsed(panelName, fallback) {
  try {
    const stored = localStorage.getItem(panelStorageKey(panelName));
    if (stored === 'true') {
      return true;
    }
    if (stored === 'false') {
      return false;
    }
  } catch (error) {
    return fallback;
  }
  return fallback;
}

function setPanelCollapsed(panel, header, body, collapsed, persist) {
  panel.dataset.collapsed = String(collapsed);
  header.setAttribute('aria-expanded', String(!collapsed));
  body.hidden = collapsed;

  if (persist && !panel.closest('.panel-modal')) {
    try {
      localStorage.setItem(panelStorageKey(panel.dataset.panel), String(collapsed));
    } catch (error) {
      // Ignore unavailable storage; the panel still remains usable.
    }
  }
}

function isPanelCollapsed(panel) {
  return panel.dataset.collapsed === 'true';
}

function panelStorageKey(panelName) {
  return `rota.panel.${panelName}.collapsed`;
}

function renderAll() {
  applyRightColumnOrder();
  renderWeekNavigation();
  renderGrid();
  renderWeekendPanel();
  const validation = validateRota();
  renderWarnings(validation);
  renderFairness(validation);
  renderDpDebugTable();
  configEditorEl.value = JSON.stringify(rota, null, 2);
}

function applyRightColumnOrder() {
  const order = rota.config.rightColumnPanelOrder || [];
  document.querySelectorAll('.side-panel [data-panel]').forEach((panel) => {
    const index = order.indexOf(panel.dataset.panel);
    panel.style.order = index === -1 ? order.length : index;
  });
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
  displayGridDays().forEach((day) => {
    const option = document.createElement('option');
    option.value = day.id;
    option.textContent = day.label;
    editDayEl.appendChild(option);
  });
}

function renderPeopleChecks(container, prefix, selected = []) {
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
}

function renderGrid() {
  const slots = displayedGridSlots();
  const days = displayGridDays();
  const grid = document.createElement('div');
  grid.className = 'rota-grid';

  const corner = document.createElement('div');
  corner.className = 'grid-head';
  corner.innerHTML = '<strong>ET</strong><span>UK equivalent</span>';
  grid.appendChild(corner);

  days.forEach((day) => {
    const head = document.createElement('div');
    head.className = ['grid-head', isCurrentDisplayDate(day) ? 'current-date' : ''].filter(Boolean).join(' ');
    head.innerHTML = `<strong>${day.label}</strong><span>${dateForDay(day)}</span>`;
    grid.appendChild(head);
  });

  slots.forEach((slot) => {
    const timeCell = document.createElement('div');
    timeCell.className = 'time-cell';
    timeCell.dataset.slotStart = slot.start;
    timeCell.innerHTML = `<strong>${displaySlotRange(slot)}</strong><span>${formatLocalRange(0, slot.start, slot.end, rota.config.ukTimeZone)}</span>`;
    grid.appendChild(timeCell);

    days.forEach((day) => {
      const assignment = getAssignmentForSlot(day.id, slot.start, slot.end);
      const slotIssues = isConfiguredRotaDay(day.id)
        ? validateSlot(day.id, slot.start, slot.end, assignment.people, assignment.details)
        : emptySlotIssues();
      const button = document.createElement('button');
      button.type = 'button';
      const issueClasses = slotIssues.codes.map((code) => `slot-${code}`);
      const rescueClass = hasAssignmentSource({ details: assignment.details }, 'RS', 'rs-peak-rescue') ? 'slot-rs-peak-rescue' : '';
      const hasValidationIssue = slotIssues.messages.length > 0;
      button.className = [
        'slot-cell',
        isCurrentDisplayDate(day) ? 'current-date' : '',
        isCurrentDisplayDate(day) && !hasValidationIssue ? 'current-date-soft' : '',
        isPeak(slot.start, slot.end, day.id) ? 'peak' : '',
        rescueClass,
        slotIssues.error ? 'issue' : '',
        slotIssues.warning ? 'warning' : '',
        ...issueClasses
      ].filter(Boolean).join(' ');
      button.addEventListener('click', () => openSlotDialog(day.id, slot.start, slot.end, assignment));

      const chips = document.createElement('span');
      chips.className = 'slot-content';
      assignment.people.forEach((personId) => {
        const person = personById(personId);
        if (!person) {
          return;
        }
        const chip = document.createElement('span');
        chip.className = `person-chip ${person.colorClass}`;
        chip.textContent = personId;
        chips.appendChild(chip);
      });
      const weekendOwnerId = getWeekendOnCallPersonForSlot(day.id, slot.start, slot.end);
      if (weekendOwnerId) {
        const owner = personById(weekendOwnerId);
        if (owner) {
          const onCallMarker = document.createElement('span');
          onCallMarker.className = `on-call-marker ${owner.colorClass}`;
          const onCallIcon = document.createElement('span');
          onCallIcon.className = 'on-call-icon';
          onCallIcon.setAttribute('aria-hidden', 'true');
          onCallIcon.textContent = '\u260E';
          const onCallInitials = document.createElement('span');
          onCallInitials.textContent = owner.id;
          onCallMarker.title = `${owner.id} on call`;
          onCallMarker.setAttribute('aria-label', `${owner.id} on call`);
          onCallMarker.append(onCallIcon, onCallInitials);
          chips.appendChild(onCallMarker);
        }
      }

      const visiblePeople = weekendOwnerId && !assignment.people.includes(weekendOwnerId)
        ? [...assignment.people, weekendOwnerId]
        : assignment.people;
      const note = buildSlotNote(day, slot.start, slot.end, visiblePeople, weekendOwnerId);
      const validationNote = buildSlotValidationNote(slotIssues);
      if (validationNote) {
        button.dataset.slotNote = validationNote;
        bindSlotTooltip(button);
      }
      button.setAttribute('aria-label', buildSlotAriaLabel(day, slot, note));
      button.append(chips);
      grid.appendChild(button);
    });
  });

  gridEl.innerHTML = '';
  gridEl.appendChild(grid);
  if (shouldScrollGridToCurrentHour) {
    shouldScrollGridToCurrentHour = false;
    requestAnimationFrame(scrollGridToCurrentEtHour);
  }
}

function displayedGridSlots() {
  const displayGrid = displayGridRule();
  return makeSlots(displayGrid.start, displayGrid.end);
}

function displayGridRule() {
  return { start: '00:00', end: '24:00' };
}

function displayGridDays() {
  const configuredDays = rota.config.days || [];
  const days = configuredDays.map((day) => ({ ...day }));
  [
    { id: 'sat', label: 'Saturday', dateOffset: 5 },
    { id: 'sun', label: 'Sunday', dateOffset: 6 }
  ].forEach((weekendDay) => {
    if (!days.some((day) => day.id === weekendDay.id)) {
      days.push(weekendDay);
    }
  });
  return days;
}

function isConfiguredRotaDay(dayId) {
  const normalizedDayId = normalizeDayId(dayId);
  return (rota.config.days || []).some((day) => day.id === normalizedDayId);
}

function emptySlotIssues() {
  return { error: false, warning: false, codes: [], messages: [] };
}

function buildSlotValidationNote(slotIssues) {
  return slotIssues.messages.map((message) => message.message).join(' ');
}

function buildSlotAriaLabel(day, slot, note) {
  return `${day.label} ${displaySlotRange(slot)} ET. ${note}`;
}

function displaySlotRange(slot) {
  return `${slot.start}-${slot.end === '24:00' ? '23:59' : slot.end}`;
}

function isCurrentDisplayDate(day) {
  return dateForDayIso(day) === zonedIsoDate(new Date(), rota.config.masterTimeZone);
}

function bindSlotTooltip(button) {
  button.addEventListener('pointerenter', () => showSlotTooltip(button));
  button.addEventListener('pointerleave', hideSlotTooltip);
  button.addEventListener('focus', () => showSlotTooltip(button));
  button.addEventListener('blur', hideSlotTooltip);
}

function showSlotTooltip(button) {
  const tooltip = slotTooltipElement();
  tooltip.textContent = button.dataset.slotNote || '';
  button.setAttribute('aria-describedby', tooltip.id);
  tooltip.hidden = false;

  const rect = button.getBoundingClientRect();
  tooltip.style.maxWidth = `${Math.min(280, Math.max(180, window.innerWidth - 24))}px`;
  const tooltipRect = tooltip.getBoundingClientRect();
  const topSpace = rect.top;
  const left = Math.min(Math.max(rect.left, 12), window.innerWidth - tooltipRect.width - 12);
  const top = topSpace > tooltipRect.height + 14
    ? rect.top - tooltipRect.height - 8
    : rect.bottom + 8;
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${Math.min(top, window.innerHeight - tooltipRect.height - 12)}px`;
}

function hideSlotTooltip(event) {
  if (event && event.currentTarget) {
    event.currentTarget.removeAttribute('aria-describedby');
  }
  slotTooltipElement().hidden = true;
}

function slotTooltipElement() {
  let tooltip = document.getElementById('slotTooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'slotTooltip';
    tooltip.className = 'slot-tooltip';
    tooltip.hidden = true;
    tooltip.setAttribute('role', 'tooltip');
    document.body.appendChild(tooltip);
  }
  return tooltip;
}

function scrollGridToCurrentEtHour() {
  const currentEtMinutes = currentMasterTimeMinutes();
  const slots = displayedGridSlots();
  const slot = slots.find((candidate) => toMinutes(candidate.start) <= currentEtMinutes && currentEtMinutes < toMinutes(candidate.end));
  const target = slot ? gridEl.querySelector(`.time-cell[data-slot-start="${slot.start}"]`) : null;
  if (!target) {
    return;
  }

  target.tabIndex = -1;
  const offset = Math.max(target.offsetTop - 92, 0);
  gridEl.scrollTo({ top: offset, behavior: 'auto' });
  target.focus({ preventScroll: true });
}

function currentMasterTimeMinutes() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: rota.config.masterTimeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
  return (Number(values.hour) % 24) * 60 + Number(values.minute);
}

function renderWeekendPanel() {
  ensureWeekendRotationShape();
  const rotation = weekendOnCallRotationRule();
  const owner = getWeekendOwnerForWeek(rota.config.weekStart);
  const eligiblePeople = weekendEligiblePeople();
  const wrapper = document.createElement('div');
  wrapper.className = 'weekend-control';

  const label = document.createElement('label');
  label.textContent = 'Assigned on-call owner for this week';
  const select = document.createElement('select');
  if (owner && !eligiblePeople.includes(owner)) {
    const invalidOwner = personById(owner);
    const option = document.createElement('option');
    option.value = owner;
    option.textContent = `${owner} (${invalidOwner ? invalidOwner.location : 'not eligible'})`;
    option.selected = true;
    option.disabled = true;
    select.appendChild(option);
  }
  eligiblePeople
    .map((personId) => personById(personId))
    .filter(Boolean)
    .forEach((person) => {
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
  meta.textContent = `${weekendRangeLabel()} - Eligible: ${eligiblePeople.join(' / ')}. DP is excluded. Estimated burden: ${rotation.estimatedHours} on-call hours.`;
  wrapper.append(label, meta);
  weekendPanelEl.innerHTML = '';
  weekendPanelEl.appendChild(wrapper);
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
  const headings = [
    ['Person', 'Person identifier from the rota people configuration.'],
    ['Total', 'Active working or coverage hours only; weekend on-call is shown separately and excluded.'],
    ['Fixed', 'Contracted fixed working blocks: each configured block duration multiplied by its configured days.'],
    ['Extra', 'Optional or additional assigned hours outside fixed working blocks.'],
    ['Peak', 'Assigned hours overlapping the configured peak coverage window.'],
    ['Rescue', 'Hours added by the automatic RS peak-rescue assignment source.'],
    ['Evening', 'Assigned hours overlapping the weekday evening rotation window.'],
    ['Early hrs', 'Assigned hours overlapping the weekday early-start rotation window.'],
    ['On-call', 'Estimated weekend on-call hours for the current weekend owner.'],
    ['Breaks', 'For RS only: number of gaps between merged working ranges across the week.'],
    ['Longest', 'For RS only: longest continuous merged working range, in hours.'],
    ['Late hrs', 'Assigned hours in high-burden late-finish slots for UK-based people.'],
    ['Early', 'Count of late-to-early turnaround warnings.'],
    ['Burden', 'Weighted score using total, peak, rescue, evening, on-call, late finish, childcare, rotation, weekend, same-person, and turnaround penalties.']
  ];
  const rows = scores.map((score) => `
    <tr>
      <td>${score.id}</td>
      <td>${score.total.toFixed(1)}</td>
      <td>${score.fixed.toFixed(1)}</td>
      <td>${score.optional.toFixed(1)}</td>
      <td>${score.peak.toFixed(1)}</td>
      <td>${score.peakRescue.toFixed(1)}</td>
      <td>${score.evening.toFixed(1)}</td>
      <td>${score.earlyStart.toFixed(1)}</td>
      <td>${score.weekend.toFixed(1)}</td>
      <td>${score.breakCount}</td>
      <td>${score.longestContinuous.toFixed(1)}</td>
      <td>${score.late.toFixed(1)}</td>
      <td>${score.earlyAfterLateWarnings}</td>
      <td><span class="score-pill">${score.score.toFixed(1)}</span></td>
    </tr>
  `).join('');

  fairnessEl.innerHTML = `
    <table>
      <thead>
        <tr>
          ${headings.map(([label, description]) => fairnessHeading(label, description)).join('')}
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function fairnessHeading(label, description) {
  return `<th title="${escapeAttribute(description)}" aria-label="${escapeAttribute(`${label}: ${description}`)}">${label}</th>`;
}

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderDpDebugTable() {
  if (!dpDebugEl) {
    return;
  }
  const rows = getDpFixedDebugRows();
  if (!rows.length) {
    dpDebugEl.innerHTML = '<p class="empty-note">No DP fixed working blocks are configured.</p>';
    return;
  }

  dpDebugEl.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Source day</th>
          <th>UK source</th>
          <th>ET day</th>
          <th>ET converted</th>
          <th>Hours</th>
          <th>Visible</th>
          <th>Clipped ET</th>
          <th>Counted</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map((row) => `
          <tr>
            <td>${row.sourceDay}</td>
            <td>${row.sourceRange}</td>
            <td>${row.convertedDay}</td>
            <td>${row.convertedRange}</td>
            <td>${row.duration.toFixed(1)}</td>
            <td>${row.overlapsVisible ? 'Yes' : 'No'}</td>
            <td>${row.clippedRange}</td>
            <td>${row.counted ? 'Yes' : 'No'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function getDpFixedDebugRows() {
  const dp = personById('DP');
  if (!dp || !Array.isArray(dp.fixedWorkingBlocks)) {
    return [];
  }

  return dp.fixedWorkingBlocks.flatMap((block) => {
    const sourceTimeZone = block.timeZone || dp.timeZone || dp.homeTimeZone;
    return fixedWorkingBlockOccurrences(dp, block).map((occurrence) => {
      const clips = visibleClipsForInterval(occurrence.start, occurrence.end);
      const convertedStartDay = formatZonedWeekday(occurrence.start, rota.config.masterTimeZone);
      const convertedEndDay = formatZonedWeekday(occurrence.end, rota.config.masterTimeZone);
      const convertedDay = convertedStartDay === convertedEndDay ? convertedStartDay : `${convertedStartDay}-${convertedEndDay}`;

      return {
        sourceDay: occurrence.sourceDay,
        sourceRange: `${block.start}-${block.end} ${sourceTimeZone}`,
        convertedDay,
        convertedRange: `${formatZonedClock(occurrence.start, rota.config.masterTimeZone)}-${formatZonedClock(occurrence.end, rota.config.masterTimeZone)} ET`,
        duration: (occurrence.end.getTime() - occurrence.start.getTime()) / (60 * 60 * 1000),
        overlapsVisible: clips.length > 0,
        clippedRange: clips.length ? clips.map((clip) => `${clip.dayLabel} ${clip.start}-${clip.end} ET`).join(', ') : 'Not visible',
        counted: block.type === 'fixed' || block.type === undefined
      };
    });
  });
}

function visibleClipsForInterval(sourceStart, sourceEnd) {
  const visibleGrid = visibleGridRule();
  return rota.config.days.map((day) => {
    const visibleStart = etWallTimeToDate(day.dateOffset, visibleGrid.start);
    const visibleEnd = etWallTimeToDate(day.dateOffset, visibleGrid.end);
    const clippedStart = new Date(Math.max(sourceStart.getTime(), visibleStart.getTime()));
    const clippedEnd = new Date(Math.min(sourceEnd.getTime(), visibleEnd.getTime()));
    if (clippedStart >= clippedEnd) {
      return null;
    }
    return {
      dayLabel: day.label,
      start: formatZonedClock(clippedStart, rota.config.masterTimeZone),
      end: formatZonedClock(clippedEnd, rota.config.masterTimeZone)
    };
  }).filter(Boolean);
}

function visibleSlotsForInterval(sourceStart, sourceEnd) {
  const visibleGrid = visibleGridRule();
  return rota.config.days.flatMap((day) => {
    return makeSlots(visibleGrid.start, visibleGrid.end).map((slot) => {
      const slotStart = etWallTimeToDate(day.dateOffset, slot.start);
      const slotEnd = etWallTimeToDate(day.dateOffset, slot.end);
      const clippedStart = new Date(Math.max(sourceStart.getTime(), slotStart.getTime()));
      const clippedEnd = new Date(Math.min(sourceEnd.getTime(), slotEnd.getTime()));
      if (clippedStart >= clippedEnd) {
        return null;
      }
      return {
        dayId: day.id,
        dayLabel: day.label,
        start: slot.start,
        end: slot.end,
        clippedStart: formatZonedClock(clippedStart, rota.config.masterTimeZone),
        clippedEnd: formatZonedClock(clippedEnd, rota.config.masterTimeZone)
      };
    }).filter(Boolean);
  });
}

function saveBlockFromForm(event) {
  event.preventDefault();
  const block = {
    start: document.getElementById('editStart').value,
    end: document.getElementById('editEnd').value,
    people: selectedPeople(peopleChecksEl),
    assignmentType: 'manual'
  };
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
  const day = dayById(dayId);
  document.getElementById('dialogTitle').textContent = `${day.label} ${start}-${end === '24:00' ? '23:59' : end} ET`;
  document.getElementById('dialogMeta').textContent = `UK equivalent ${formatLocalRange(day.dateOffset, start, end, rota.config.ukTimeZone)}`;
  renderPeopleChecks(document.getElementById('dialogChecks'), 'dialog-person', assignment.people);
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
    people: selectedPeople(document.getElementById('dialogChecks')),
    assignmentType: 'manual'
  };
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
  const visibleGrid = visibleGridRule();
  const standardSlots = makeSlots(visibleGrid.start, visibleGrid.end);

  rota.config.days.forEach((day) => {
    standardSlots.forEach((slot) => {
      const assignment = getAssignmentForSlot(day.id, slot.start, slot.end);
      const slotIssues = validateSlot(day.id, slot.start, slot.end, assignment.people, assignment.details);
      slotMap.push({ dayId: day.id, start: slot.start, end: slot.end, people: assignment.people, details: assignment.details, issues: slotIssues });
      warnings.push(...slotIssues.messages);
    });
  });

  warnings.push(...validateWeekendRotation());
  warnings.push(...validateDpWeekendAssignments());
  warnings.push(...validateFixedWorkingBlocks());
  warnings.push(...validateTurnaround());
  warnings.push(...validateRsWorkingPattern());
  return { warnings, slotMap };
}

function validateDpWeekendAssignments() {
  const warnings = [];
  ['sat', 'sun'].forEach((dayId) => {
    (rota.schedule[dayId] || []).forEach((block) => {
      if ((block.people || []).includes('DP')) {
        warnings.push({
          level: 'error',
          code: 'dp-weekend-assignment',
          personId: 'DP',
          message: `DP is assigned on ${dayId.toUpperCase()} ${block.start}-${block.end}, but DP does not work weekends.`
        });
      }
    });
  });
  return warnings;
}

function validateFixedWorkingBlocks() {
  const warnings = [];
  warnings.push(...validateDpFixedWorkingBlockSource());
  rota.config.people.forEach((person) => {
    if (!Array.isArray(person.fixedWorkingBlocks)) {
      return;
    }
    person.fixedWorkingBlocks.forEach((block) => {
      fixedWorkingBlockOccurrences(person, block).forEach((occurrence) => {
        visibleSlotsForInterval(occurrence.start, occurrence.end).forEach((visibleSlot) => {
          const assignment = getAssignmentForSlot(visibleSlot.dayId, visibleSlot.start, visibleSlot.end);
          const hasFixedAssignment = (assignment.details.get(person.id) || []).some((item) => item.assignmentType === 'fixed');
          if (!hasFixedAssignment) {
            warnings.push({
              level: person.id === 'DP' ? 'error' : 'warning',
              code: 'fixed-hours-missing',
              personId: person.id,
              message: `${person.id} fixed ${block.label || block.id} is missing from ${visibleSlot.dayLabel} ${visibleSlot.start}-${visibleSlot.end} ET.`
            });
          }
        });
      });
    });
  });
  return warnings;
}

function validateDpFixedWorkingBlockSource() {
  const warnings = [];
  const dp = personById('DP');
  if (!dp) {
    return warnings;
  }

  const requiredBlocks = [
    {
      id: 'dp-weekday-main',
      days: ['mon', 'tue', 'wed', 'thu', 'fri'],
      sourceDaysLabel: 'Monday-Friday',
      start: '09:00',
      end: '15:00',
      timeZone: 'Europe/London'
    },
    {
      id: 'dp-mon-wed-evening',
      days: ['mon', 'tue', 'wed'],
      sourceDaysLabel: 'Monday-Wednesday',
      start: '18:00',
      end: '20:00',
      timeZone: 'Europe/London'
    }
  ];

  requiredBlocks.forEach((required) => {
    const block = (dp.fixedWorkingBlocks || []).find((candidate) => candidate.id === required.id);
    const matchesRequired =
      block &&
      block.start === required.start &&
      block.end === required.end &&
      (block.timeZone || dp.homeTimeZone) === required.timeZone &&
      sameDaySet(block.days, required.days);

    if (!matchesRequired) {
      warnings.push({
        level: 'error',
        code: 'fixed-hours-missing',
        personId: 'DP',
        message: `DP fixed block ${required.id} must be ${required.sourceDaysLabel} ${required.start}-${required.end} ${required.timeZone}.`
      });
    }
  });

  const fixedHours = fixedHoursForPerson('DP');
  if (Math.abs(fixedHours - 41) > 0.01) {
    warnings.push({
      level: 'warning',
      code: 'dp-fixed-hours-total',
      personId: 'DP',
      message: `DP fixed scheduled hours should total 41.0, but currently total ${fixedHours.toFixed(1)}.`
    });
  }

  const dpContract = dp.contractHoursPerWeek || 0;
  if (dpContract !== 42) {
    warnings.push({
      level: 'warning',
      code: 'dp-contract-target',
      personId: 'DP',
      message: `DP contract target should display as 42 hours, but is configured as ${dpContract}.`
    });
  }

  return warnings;
}

function validateSlot(dayId, start, end, people, details = new Map()) {
  const messages = [];
  const codes = [];
  let error = false;
  let warning = false;
  const day = dayById(dayId);
  const weekday = weekdayCoverageRule();
  const peak = peakCoverageRule();

  function addIssue(level, code, message, personId = '') {
    if (level === 'error') {
      error = true;
    } else {
      warning = true;
    }
    if (!codes.includes(code)) {
      codes.push(code);
    }
    messages.push({ level, code, personId, message });
  }

  if (intersects(start, end, weekday.start, weekday.end) && people.length < weekday.minPeople) {
    addIssue('error', 'under-covered', `${day.label} ${start}-${end} ET has no weekday coverage.`);
  }

  if (isPeak(start, end, dayId) && people.length < peak.idealPeople) {
    addIssue('warning', 'peak-undercovered', `${day.label} ${start}-${end} ET is below ideal peak coverage (${people.length}/${peak.idealPeople}).`);
  }

  getUnavailableBlocks('AS').forEach((block) => {
    if (people.includes('AS') && intersects(start, end, block.start, block.end)) {
      addIssue('warning', 'childcare-conflict', `${day.label} ${start}-${end} ET assigns AS during ${block.label} (${block.start}-${block.end} ET).`, 'AS');
    }
  });

  if (isEvening(start, end)) {
    const expectedOwner = expectedEveningOwner();
    if (expectedOwner && !people.includes(expectedOwner)) {
      addIssue('warning', 'weekday-evening-rotation-conflict', `${day.label} ${start}-${end} ET should be owned by ${expectedOwner} under the weekday evening rotation; DP support does not satisfy this RS/AS rule.`, expectedOwner);
    }
  }

  if (isEarlyStart(start, end)) {
    const expectedOwner = expectedEarlyStartOwner();
    const eveningOwner = expectedEveningOwner();
    if (expectedOwner && !people.includes(expectedOwner)) {
      addIssue('warning', 'weekday-early-start-rotation-conflict', `${day.label} ${start}-${end} ET should be owned by ${expectedOwner} under the weekday early-start rotation, unless childcare/rest protection prevents it.`, expectedOwner);
    }
    if (eveningOwner && people.includes(eveningOwner)) {
      addIssue('warning', 'same-person-early-and-evening', `${day.label} ${start}-${end} ET assigns ${eveningOwner} to early-start coverage even though they are the weekday evening owner this week.`, eveningOwner);
    }
  }

  if (people.includes('DP') && !isWithinFixedWorkingBlock('DP', dayId, start, end) && !hasManualOrOvertimeAssignment(details, 'DP')) {
    addIssue('warning', 'dp-outside-fixed-hours', `${day.label} ${start}-${end} ET assigns DP outside fixed UK hours without manual/overtime marking.`, 'DP');
  }

  people
    .map((personId) => personById(personId))
    .filter((person) => person && person.isUkBased)
    .forEach((person) => {
      if (toMinutes(end) >= toMinutes(rota.config.turnaroundRules.highBurdenFinishAtOrAfter)) {
        addIssue('warning', 'late-finish', `${day.label} ${start}-${end} ET is a high-burden late finish for UK-based ${person.id}.`, person.id);
      }
    });

  return { error, warning, codes, messages };
}

function validateWeekendRotation() {
  ensureWeekendRotationShape();
  const owner = getWeekendOwnerForWeek(rota.config.weekStart);
  const expected = expectedWeekendOwner(rota.config.weekStart);
  const eligible = weekendEligiblePeople();
  const warnings = [];

  if (!eligible.includes(owner)) {
    warnings.push({
      level: owner === 'DP' ? 'error' : 'warning',
      code: 'weekend-conflict',
      personId: owner,
      message: `${owner} is assigned to weekend/on-call cover, but only ${eligible.join(' and ')} are eligible.`
    });
  }

  if (owner !== expected) {
    warnings.push({
      level: 'warning',
      code: 'weekend-rotation-conflict',
      personId: owner,
      message: `Weekend/on-call cover should alternate between ${eligible.join(' and ')}; ${weekendRangeLabel()} is expected to be ${expected}, not ${owner}.`
    });
  }

  return warnings;
}

function validateTurnaround() {
  const warnings = [];
  const rules = rota.config.turnaroundRules;
  const peopleToCheck = rules.people || [];

  peopleToCheck.forEach((personId) => {
    const person = personById(personId);
    for (let index = 0; index < rota.config.days.length - 1; index += 1) {
      const currentDay = rota.config.days[index];
      const nextDay = rota.config.days[index + 1];
      const currentBlocks = blocksForPerson(currentDay.id, personId);
      const nextBlocks = blocksForPerson(nextDay.id, personId);
      if (!currentBlocks.length || !nextBlocks.length) {
        continue;
      }
      const finish = Math.max(...currentBlocks.map((block) => toMinutes(block.end)));
      const nextStart = Math.min(...nextBlocks.map((block) => toMinutes(block.start)));
      const restHours = (24 * 60 - finish + nextStart) / 60;
      const earliestStart = person && person.earliestStartAfterLateFinish ? person.earliestStartAfterLateFinish : '10:00';
      const isLateEarly = finish >= toMinutes(rules.highBurdenFinishAtOrAfter) && nextStart < toMinutes(earliestStart);
      if (isLateEarly || restHours < rules.minimumRestHours) {
        warnings.push({
          level: 'warning',
          code: 'late-to-early',
          personId,
          message: `${personId} has a late-to-early turnaround from ${currentDay.label} ${fromMinutes(finish)} ET to ${nextDay.label} ${fromMinutes(nextStart)} ET (${restHours.toFixed(1)}h rest).`
        });
      }
    }
  });

  return warnings;
}

function validateRsWorkingPattern() {
  const warnings = [];
  const rule = rsCoverageSupportRule();

  rota.config.days.forEach((day) => {
    const ranges = workingRangesForPerson(day.id, 'RS');
    if (!ranges.length) {
      return;
    }

    const breakBlock = rsBreakForDay(day.id);
    const breaks = breaksBetweenRanges(ranges);
    const requiredBreakMinutes = breakBlock && breakBlock.isEveningOwner ? rule.eveningDutyBreakDurationMinutes : rule.normalBreakDurationMinutes;
    const hasAdequateBreak = breaks.some((gap) => gap.durationMinutes >= requiredBreakMinutes);
    const longestContinuous = Math.max(...ranges.map((range) => toMinutes(range.end) - toMinutes(range.start)));
    const hasEarlyStart = ranges.some((range) => intersects(range.start, range.end, weekdayEarlyStartRotationRule().start, weekdayEarlyStartRotationRule().end));
    const hasEvening = ranges.some((range) => intersects(range.start, range.end, weekdayEveningRotationRule().start, weekdayEveningRotationRule().end));
    const daySpan = toMinutes(ranges[ranges.length - 1].end) - toMinutes(ranges[0].start);

    if (ranges.length > rule.maxWorkingBlocksPerDay) {
      warnings.push({
        level: 'warning',
        code: 'rs-fragmented-day',
        personId: 'RS',
        message: `RS has ${ranges.length} separate working blocks on ${day.label}; aim for no more than ${rule.maxWorkingBlocksPerDay}.`
      });
    }

    if (longestContinuous > rule.excessiveContinuousSpanMinutes) {
      warnings.push({
        level: 'warning',
        code: 'rs-excessive-continuous-span',
        personId: 'RS',
        message: `RS has a continuous working span of ${(longestContinuous / 60).toFixed(1)} hours on ${day.label}.`
      });
    }

    if ((daySpan >= 8 * 60 || (hasEarlyStart && hasEvening)) && !hasAdequateBreak) {
      warnings.push({
        level: 'warning',
        code: 'rs-break-missing',
        personId: 'RS',
        message: `RS needs an adequate ${requiredBreakMinutes / 60}h break on ${day.label}; configured break is ${breakBlock.start}-${breakBlock.end} ET.`
      });
    }
  });

  return warnings;
}

function workingRangesForPerson(dayId, personId) {
  const visibleGrid = visibleGridRule();
  const ranges = makeSlots(visibleGrid.start, visibleGrid.end)
    .filter((slot) => getAssignmentForSlot(dayId, slot.start, slot.end).people.includes(personId))
    .map((slot) => ({ start: slot.start, end: slot.end }));
  return mergeRanges(ranges);
}

function mergeRanges(ranges) {
  return ranges.reduce((merged, range) => {
    const last = merged[merged.length - 1];
    if (last && last.end === range.start) {
      last.end = range.end;
    } else {
      merged.push({ ...range });
    }
    return merged;
  }, []);
}

function breaksBetweenRanges(ranges) {
  const gaps = [];
  for (let index = 0; index < ranges.length - 1; index += 1) {
    const start = ranges[index].end;
    const end = ranges[index + 1].start;
    gaps.push({
      start,
      end,
      durationMinutes: toMinutes(end) - toMinutes(start)
    });
  }
  return gaps;
}

function calculateFairness(validation) {
  const weights = rota.config.scoringWeights;
  const scores = Object.fromEntries(rota.config.people.map((person) => [person.id, {
    id: person.id,
    total: 0,
    assigned: 0,
    fixed: fixedHoursForPerson(person.id),
    optional: 0,
    contract: person.contractHoursPerWeek || 0,
    remaining: 0,
    diff: 0,
    peak: 0,
    peakRescue: 0,
    evening: 0,
    earlyStart: 0,
    weekend: 0,
    breakCount: 0,
    longestContinuous: 0,
    fragmentedDayWarnings: 0,
    late: 0,
    childcareOverrides: 0,
    weekendConflicts: 0,
    weekdayEveningRotationConflicts: 0,
    weekdayEarlyStartRotationConflicts: 0,
    samePersonEarlyAndEveningWarnings: 0,
    lateFinishCount: 0,
    earlyAfterLateWarnings: 0,
    score: 0
  }]));

  validation.slotMap.forEach((slot) => {
    const hours = durationHours(slot.start, slot.end);
    slot.people.forEach((personId) => {
      if (!scores[personId]) {
        return;
      }
      scores[personId].assigned += hours;
      if (isPeak(slot.start, slot.end, slot.dayId)) {
        scores[personId].peak += hours;
      }
      if (hasAssignmentSource(slot, personId, 'rs-peak-rescue')) {
        scores[personId].peakRescue += hours;
      }
      if (isEvening(slot.start, slot.end)) {
        scores[personId].evening += hours;
      }
      if (isEarlyStart(slot.start, slot.end)) {
        scores[personId].earlyStart += hours;
      }
      if (isOptionalOrAdditionalAssignment(slot, personId)) {
        scores[personId].optional += hours;
      }
      if (slotHasCode(slot, 'late-finish') && personById(personId).isUkBased) {
        scores[personId].late += hours;
        scores[personId].lateFinishCount += 1;
      }
      if (slot.people.includes('AS') && slotHasCode(slot, 'childcare-conflict') && personId === 'AS') {
        scores[personId].childcareOverrides += 1;
      }
      if (slotHasCode(slot, 'weekday-evening-rotation-conflict') && personId === expectedEveningOwner()) {
        scores[personId].weekdayEveningRotationConflicts += 1;
      }
      if (slotHasCode(slot, 'weekday-early-start-rotation-conflict') && personId === expectedEarlyStartOwner()) {
        scores[personId].weekdayEarlyStartRotationConflicts += 1;
      }
      if (slotHasCode(slot, 'same-person-early-and-evening') && personId === expectedEveningOwner()) {
        scores[personId].samePersonEarlyAndEveningWarnings += 1;
      }
    });
  });

  const weekendOwner = getWeekendOwnerForWeek(rota.config.weekStart);
  if (scores[weekendOwner]) {
    scores[weekendOwner].weekend += weekendOnCallRotationRule().estimatedHours;
  }

  validation.warnings.forEach((warning) => {
    if (warning.code === 'late-to-early' && scores[warning.personId]) {
      scores[warning.personId].earlyAfterLateWarnings += 1;
    }
    if ((warning.code === 'weekend-conflict' || warning.code === 'weekend-rotation-conflict') && scores[warning.personId]) {
      scores[warning.personId].weekendConflicts += 1;
    }
    if (warning.code === 'rs-fragmented-day' && scores.RS) {
      scores.RS.fragmentedDayWarnings += 1;
    }
  });

  if (scores.RS) {
    rota.config.days.forEach((day) => {
      const ranges = workingRangesForPerson(day.id, 'RS');
      const gaps = breaksBetweenRanges(ranges);
      scores.RS.breakCount += gaps.length;
      if (ranges.length) {
        const longest = Math.max(...ranges.map((range) => (toMinutes(range.end) - toMinutes(range.start)) / 60));
        scores.RS.longestContinuous = Math.max(scores.RS.longestContinuous, longest);
      }
    });
  }

  Object.values(scores).forEach((score) => {
    score.total = score.fixed ? score.fixed + score.optional : score.assigned;
    score.diff = score.contract ? score.total - score.contract : 0;
    score.remaining = score.contract ? Math.max(score.contract - score.total, 0) : 0;
    score.score =
      score.total * weights.assignedHour +
      score.peak * weights.peakHour +
      score.peakRescue * weights.peakRescueHour +
      score.evening * weights.eveningHour +
      score.weekend * weights.weekendOnCallHour +
      score.late * weights.highBurdenLateHour +
      score.childcareOverrides * weights.childcareConflict +
      score.weekendConflicts * weights.weekendConflict +
      score.weekdayEveningRotationConflicts * weights.weekdayEveningRotationConflict +
      score.weekdayEarlyStartRotationConflicts * weights.weekdayEarlyStartRotationConflict +
      score.samePersonEarlyAndEveningWarnings * weights.samePersonEarlyAndEvening +
      score.earlyAfterLateWarnings * weights.lateToEarlyTurnaround;
  });

  return Object.values(scores);
}

function exportJson() {
  downloadFile('rota-planner.json', JSON.stringify(rota, null, 2), 'application/json');
}

function exportCsv() {
  const lines = [['Day', 'Start ET', 'End ET', 'People', 'UK equivalent', 'Notes'].join(',')];
  const visibleGrid = visibleGridRule();
  const slots = makeSlots(visibleGrid.start, visibleGrid.end);
  rota.config.days.forEach((day) => {
    slots.forEach((slot) => {
      const assignment = getAssignmentForSlot(day.id, slot.start, slot.end);
      lines.push([
        csvEscape(day.label),
        slot.start,
        slot.end,
        csvEscape(assignment.people.join(' ')),
        csvEscape(formatLocalRange(day.dateOffset, slot.start, slot.end, rota.config.ukTimeZone)),
        ''
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
  const details = new Map();
  getFixedAssignmentsForSlot(dayId, start, end).forEach((assignment) => addAssignmentDetail(details, assignment));
  blocks.forEach((block) => {
    if (intersects(start, end, block.start, block.end)) {
      resolvePeopleForBlock(dayId, block, start, end).forEach((assignment) => {
        addAssignmentDetail(details, assignment);
      });
    }
  });
  getRsPeakRescueAssignment(dayId, start, end, details).forEach((assignment) => addAssignmentDetail(details, assignment));
  return { people: Array.from(details.keys()), details };
}

function addAssignmentDetail(details, assignment) {
  if (!assignment || !assignment.personId) {
    return;
  }
  if (!details.has(assignment.personId)) {
    details.set(assignment.personId, []);
  }
  details.get(assignment.personId).push(assignment);
}

function getFixedAssignmentsForSlot(dayId, start, end) {
  return rota.config.people.flatMap((person) => {
    if (!Array.isArray(person.fixedWorkingBlocks)) {
      return [];
    }
    return person.fixedWorkingBlocks
      .flatMap((block) => fixedWorkingBlockOverlaps(person, block, dayId, start, end).map((occurrence) => ({
        personId: person.id,
        source: 'fixed-working-block',
        assignmentType: block.type || 'fixed',
        blockId: block.id || block.label || 'fixed-working-block',
        sourceDay: occurrence.sourceDay,
        sourceTimeZone: occurrence.sourceTimeZone
      })));
  });
}

function getRsPeakRescueAssignment(dayId, start, end, details) {
  const peak = peakCoverageRule();
  const rule = rsCoverageSupportRule();
  if (!rule.enabled || !isMondayToFriday(dayId) || !intersects(start, end, peak.start, peak.end)) {
    return [];
  }
  if (details.has('RS') || details.size >= peak.idealPeople) {
    return [];
  }
  if (isRsBreakSlot(dayId, start, end)) {
    return [];
  }
  if (!isPersonAvailableForAutoAssignment('RS', dayId, start, end)) {
    return [];
  }
  return [{
    personId: 'RS',
    source: 'rs-peak-rescue',
    assignmentType: 'automatic'
  }];
}

function isMondayToFriday(dayId) {
  return ['mon', 'tue', 'wed', 'thu', 'fri'].includes(normalizeDayId(dayId));
}

function blocksForPerson(dayId, personId) {
  return (rota.schedule[dayId] || []).filter((block) => resolvePeopleForBlock(dayId, block).some((assignment) => assignment.personId === personId));
}

function resolvePeopleForBlock(dayId, block, slotStart = block.start, slotEnd = block.end) {
  const assignments = [];
  const seen = new Set();
  (block.people || []).forEach((personId) => {
    resolveAssignmentEntry(dayId, slotStart, slotEnd, personId, block).forEach((assignment) => {
      if (!seen.has(assignment.personId)) {
        assignments.push(assignment);
        seen.add(assignment.personId);
      }
    });
  });
  return assignments;
}

function resolveAssignmentEntry(dayId, start, end, personId, block) {
  const tokens = rota.config.computedAssignmentTokens || {};
  if (personId === tokens.defaultCoreAssignments) {
    return getDefaultCoreAssignments(dayId, start, end).map((resolvedId) => ({
      personId: resolvedId,
      source: 'auto-core',
      assignmentType: 'automatic'
    }));
  }
  if (personId === tokens.weekdayEveningOwner) {
    return [{
      personId: expectedEveningOwner(),
      source: 'weekday-evening-rotation',
      assignmentType: 'automatic'
    }];
  }
  return [{
    personId,
    source: block.assignmentType || 'configured',
    assignmentType: block.assignmentType || 'configured'
  }];
}

function makeSlots(start, end) {
  const slots = [];
  const step = rota.config.slotMinutes;
  for (let minutes = toMinutes(start); minutes < toMinutes(end); minutes += step) {
    slots.push({ start: fromMinutes(minutes), end: fromMinutes(minutes + step) });
  }
  return slots;
}

function weekdayCoverageRule() {
  const configured = rota.config.coverageRules.weekday || rota.config.coverageRules.standard || {};
  return {
    ...configured,
    start: rota.config.businessCoverageStart || configured.start,
    end: rota.config.businessCoverageEnd || configured.end
  };
}

function visibleGridRule() {
  const weekday = weekdayCoverageRule();
  return {
    start: rota.config.visibleGridStart || weekday.start,
    end: rota.config.visibleGridEnd || weekday.end
  };
}

function peakCoverageRule() {
  const configured = rota.config.coverageRules.peak || {};
  return {
    ...configured,
    start: rota.config.peakCoverageStart || configured.start,
    end: rota.config.peakCoverageEnd || configured.end
  };
}

function getUnavailableBlocks(personId) {
  const rules = rota.config.availabilityRules && rota.config.availabilityRules[personId];
  return rules && Array.isArray(rules.unavailableBlocks) ? rules.unavailableBlocks : [];
}

function rsCoverageSupportRule() {
  return {
    enabled: true,
    normalBreakDurationMinutes: 60,
    eveningDutyBreakDurationMinutes: 120,
    preferredBreakWindowET: { start: '14:00', end: '17:00' },
    normalBreakStart: '14:00',
    eveningDutyBreakStart: '14:00',
    maxWorkingBlocksPerDay: 2,
    excessiveContinuousSpanMinutes: 420,
    ...(rota.config.rsCoverageSupport || {})
  };
}

function rsBreakForDay(dayId) {
  if (!dayById(dayId)) {
    return null;
  }
  const rule = rsCoverageSupportRule();
  const isEveningOwner = expectedEveningOwner() === 'RS';
  const duration = isEveningOwner ? rule.eveningDutyBreakDurationMinutes : rule.normalBreakDurationMinutes;
  const breakStart = isEveningOwner ? rule.eveningDutyBreakStart : rule.normalBreakStart;
  return {
    start: breakStart,
    end: fromMinutes(toMinutes(breakStart) + duration),
    durationMinutes: duration,
    isEveningOwner
  };
}

function isRsBreakSlot(dayId, start, end) {
  const breakBlock = rsBreakForDay(dayId);
  return Boolean(breakBlock && intersects(start, end, breakBlock.start, breakBlock.end));
}

function getAvailablePeopleForBlock(dayId, start, end) {
  return rota.config.people.map((person) => person.id).filter((personId) => isPersonAvailableForAutoAssignment(personId, dayId, start, end));
}

function getDefaultCoreAssignments(dayId, start, end) {
  if (isEvening(start, end)) {
    return [];
  }
  const people = [];
  if (isEarlyStart(start, end)) {
    const earlyOwner = expectedEarlyStartOwner();
    if (earlyOwner && isPersonAvailableForAutoAssignment(earlyOwner, dayId, start, end)) {
      people.push(earlyOwner);
    }
    return Array.from(new Set(people));
  }
  if (isPersonAvailableForAutoAssignment('AS', dayId, start, end)) {
    people.push('AS');
  }
  if (!people.length && isPersonAvailableForAutoAssignment('RS', dayId, start, end)) {
    people.push('RS');
  }
  return Array.from(new Set(people));
}

function isPersonAvailableForAutoAssignment(personId, dayId, start, end) {
  if (getUnavailableBlocks(personId).some((block) => intersects(start, end, block.start, block.end))) {
    return false;
  }
  if ((personId === 'RS' || personId === 'AS') && violatesEarlyAfterLate(personId, dayId, start)) {
    return false;
  }
  if (personId === 'DP') {
    return isWithinFixedWorkingBlock(personId, dayId, start, end);
  }
  return true;
}

function isWithinFixedWorkingBlock(personId, dayId, start, end) {
  const person = personById(personId);
  if (!person || !Array.isArray(person.fixedWorkingBlocks)) {
    return false;
  }
  return person.fixedWorkingBlocks.some((block) => fixedWorkingBlockIntersects(person, block, dayId, start, end));
}

function fixedWorkingBlockIntersects(person, block, dayId, start, end) {
  return fixedWorkingBlockOverlaps(person, block, dayId, start, end).length > 0;
}

function fixedWorkingBlockOverlaps(person, block, dayId, start, end) {
  const day = dayById(dayId);
  if (!day) {
    return [];
  }
  const slotStart = etWallTimeToDate(day.dateOffset, start);
  const slotEnd = etWallTimeToDate(day.dateOffset, end);
  return fixedWorkingBlockOccurrences(person, block)
    .filter((occurrence) => slotStart < occurrence.end && slotEnd > occurrence.start);
}

function fixedWorkingBlockOccurrences(person, block) {
  const sourceTimeZone = block.timeZone || person.timeZone || person.homeTimeZone;
  return (block.days || []).map((sourceDay) => {
    const day = dayById(sourceDay);
    if (!day) {
      return null;
    }
    return {
      sourceDay: day.label,
      sourceTimeZone,
      start: wallTimeToDate(day.dateOffset, block.start, sourceTimeZone),
      end: wallTimeToDate(day.dateOffset, block.end, sourceTimeZone)
    };
  }).filter(Boolean);
}

function hasManualOrOvertimeAssignment(details, personId) {
  return (details.get(personId) || []).some((assignment) => ['manual', 'optional', 'overtime'].includes(assignment.assignmentType));
}

function isOptionalOrAdditionalAssignment(slot, personId) {
  const assignments = slot.details && slot.details.get(personId) ? slot.details.get(personId) : [];
  const isMarkedExtra = assignments.some((assignment) => ['manual', 'optional', 'overtime'].includes(assignment.assignmentType));
  if (personId === 'DP') {
    return isMarkedExtra && !isWithinFixedWorkingBlock(personId, slot.dayId, slot.start, slot.end);
  }
  return false;
}

function fixedHoursForPerson(personId) {
  const person = personById(personId);
  if (!person || !Array.isArray(person.fixedWorkingBlocks)) {
    return 0;
  }
  return person.fixedWorkingBlocks.reduce((total, block) => {
    return total + block.days.length * durationHours(block.start, block.end);
  }, 0);
}

function blockIncludesDay(block, dayId) {
  return (block.days || []).map(normalizeDayId).includes(normalizeDayId(dayId));
}

function sameDaySet(actualDays = [], expectedDays = []) {
  const actual = actualDays.map(normalizeDayId).sort().join(',');
  const expected = expectedDays.map(normalizeDayId).sort().join(',');
  return actual === expected;
}

function normalizeDayId(value) {
  const key = String(value || '').slice(0, 3).toLowerCase();
  const aliases = {
    mon: 'mon',
    tue: 'tue',
    wed: 'wed',
    thu: 'thu',
    fri: 'fri',
    sat: 'sat',
    sun: 'sun'
  };
  return aliases[key] || key;
}

function isEvening(start, end) {
  const evening = weekdayEveningRotationRule();
  return intersects(start, end, evening.start, evening.end);
}

function isEarlyStart(start, end) {
  const early = weekdayEarlyStartRotationRule();
  return intersects(start, end, early.start, early.end);
}

function weekdayEveningRotationRule() {
  rota.config.rotations = rota.config.rotations || {};
  rota.config.rotations.weekdayEvenings = rota.config.rotations.weekdayEvenings || {
    start: '18:00',
    end: '22:00',
    participants: ['RS', 'AS'],
    baseWeekStart: rota.config.weekStart,
    startingPerson: 'RS',
    alternatesWeekly: true
  };
  return rota.config.rotations.weekdayEvenings;
}

function weekdayEarlyStartRotationRule() {
  rota.config.rotations = rota.config.rotations || {};
  rota.config.rotations.weekdayEarlyStarts = rota.config.rotations.weekdayEarlyStarts || {
    start: '08:00',
    end: '11:00',
    participants: ['RS', 'AS'],
    baseWeekStart: rota.config.weekStart,
    deriveAsOppositeOf: 'weekdayEvenings',
    alternatesWeekly: true
  };
  return rota.config.rotations.weekdayEarlyStarts;
}

function expectedEveningOwner() {
  const rotation = weekdayEveningRotationRule();
  const participants = rotation.participants || rotation.owners || ['RS', 'AS'];
  const startingPerson = rotation.startingPerson || rotation.baseOwner || participants[0];
  const ownerIndex = participants.indexOf(startingPerson);
  if (ownerIndex === -1) {
    return '';
  }
  const baseWeekStart = rotation.baseWeekStart || rota.config.weekStart;
  const index = rotation.alternatesWeekly === false ? ownerIndex : modulo(weeksBetween(baseWeekStart, rota.config.weekStart) + ownerIndex, participants.length);
  return participants[index];
}

function expectedEarlyStartOwner() {
  const rotation = weekdayEarlyStartRotationRule();
  if (rotation.deriveAsOppositeOf === 'weekdayEvenings') {
    return oppositeParticipant(expectedEveningOwner(), rotation.participants || ['RS', 'AS']);
  }
  return expectedWeeklyRotationOwner(rotation);
}

function oppositeParticipant(personId, participants) {
  if (!participants || participants.length < 2) {
    return personId;
  }
  const index = participants.indexOf(personId);
  if (index === -1) {
    return participants[0];
  }
  return participants[modulo(index + 1, participants.length)];
}

function expectedWeeklyRotationOwner(rotation) {
  const participants = rotation.participants || rotation.eligiblePeople || rotation.rotationOrder || ['RS', 'AS'];
  const startingPerson = rotation.startingPerson || rotation.assignedTo || participants[0];
  const ownerIndex = participants.indexOf(startingPerson);
  if (ownerIndex === -1) {
    return '';
  }
  const baseWeekStart = rotation.baseWeekStart || rota.config.weekStart;
  const index = rotation.alternatesWeekly === false ? ownerIndex : modulo(weeksBetween(baseWeekStart, rota.config.weekStart) + ownerIndex, participants.length);
  return participants[index];
}

function violatesEarlyAfterLate(personId, dayId, start) {
  const person = personById(personId);
  if (!person || !person.earliestStartAfterLateFinish) {
    return false;
  }
  const dayIndex = rota.config.days.findIndex((day) => day.id === dayId);
  if (dayIndex <= 0) {
    return false;
  }
  const previousDay = rota.config.days[dayIndex - 1];
  const previousBlocks = blocksForPerson(previousDay.id, personId);
  if (!previousBlocks.length) {
    return false;
  }
  const latestFinish = Math.max(...previousBlocks.map((block) => toMinutes(block.end)));
  return latestFinish >= toMinutes(rota.config.turnaroundRules.highBurdenFinishAtOrAfter) && toMinutes(start) < toMinutes(person.earliestStartAfterLateFinish);
}

function slotHasCode(slot, code) {
  return slot.issues.codes.includes(code);
}

function hasAssignmentSource(slot, personId, source) {
  const assignments = slot.details && slot.details.get(personId) ? slot.details.get(personId) : [];
  return assignments.some((assignment) => assignment.source === source);
}

function buildSlotNote(day, start, end, people, weekendOwnerId = '') {
  const notes = [];
  if (weekendOwnerId) {
    notes.push(`${weekendOwnerId} weekend on-call`);
  }
  if (!people.length) {
    notes.push('No one assigned');
    return notes.join('. ');
  }

  const ukPeople = people.filter((personId) => {
    const person = personById(personId);
    return person && person.isUkBased;
  });

  if (!ukPeople.length) {
    notes.push('Miami local same as ET');
    return notes.join('. ');
  }

  notes.push(`${ukPeople.join('/')} UK equivalent ${formatLocalRange(day.dateOffset, start, end, rota.config.ukTimeZone)}`);
  return notes.join('. ');
}

function isPeak(start, end, dayId = '') {
  if (dayId && !isMondayToFriday(dayId)) {
    return false;
  }
  const peak = peakCoverageRule();
  return intersects(start, end, peak.start, peak.end);
}

function dateForDay(day) {
  return formatDateLabel(dateForOffset(day.dateOffset));
}

function dateForDayIso(day) {
  return toIsoDate(dateForOffset(day.dateOffset));
}

function zonedIsoDate(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const values = Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function dayById(dayId) {
  const normalizedDayId = normalizeDayId(dayId);
  return displayGridDays().find((day) => day.id === normalizedDayId);
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
  rota.config.rotations = rota.config.rotations || {};
  rota.config.rotations.weekendOnCall = rota.config.rotations.weekendOnCall || {};
  const rotation = rota.config.rotations.weekendOnCall;
  rotation.baseWeekStart = rotation.baseWeekStart || rota.config.weekStart;
  rotation.assignedTo = rotation.assignedTo || rota.config.people[0].id;
  rotation.eligiblePeople = rotation.eligiblePeople && rotation.eligiblePeople.length ? rotation.eligiblePeople : ['RS', 'AS'];
  rotation.rotationOrder = rotation.rotationOrder && rotation.rotationOrder.length ? rotation.rotationOrder : [
    rotation.assignedTo,
    ...(rotation.backupOrder || [])
  ].filter((personId, index, values) => values.indexOf(personId) === index);
  rotation.rotationOrder = rotation.rotationOrder.filter((personId) => rotation.eligiblePeople.includes(personId));
  if (!rotation.rotationOrder.length) {
    rotation.rotationOrder = rotation.eligiblePeople.slice();
  }
  rotation.assignments = rotation.assignments || {};
  if (!rotation.assignments[rotation.baseWeekStart]) {
    rotation.assignments[rotation.baseWeekStart] = rotation.assignedTo;
  }
}

function weekendOnCallRotationRule() {
  ensureWeekendRotationShape();
  return rota.config.rotations.weekendOnCall;
}

function getWeekendOnCallPersonForSlot(dayId, start, end) {
  const day = dayById(dayId);
  if (!day) {
    return '';
  }
  const slotStart = etWallTimeToDate(day.dateOffset, start);
  const slotEnd = etWallTimeToDate(day.dateOffset, end);
  const weekendRule = weekendOnCallRotationRule();
  const currentWeekendStart = etWallTimeToDate(4, weekendRule.start);
  const currentWeekendEnd = etWallTimeToDate(7, weekendRule.end);
  if (slotStart < currentWeekendEnd && slotEnd > currentWeekendStart) {
    return getWeekendOwnerForWeek(rota.config.weekStart);
  }

  const previousWeekStartDate = parseIsoDate(rota.config.weekStart);
  previousWeekStartDate.setUTCDate(previousWeekStartDate.getUTCDate() - 7);
  const previousWeekStart = toIsoDate(previousWeekStartDate);
  const previousWeekendStart = etWallTimeToDate(-3, weekendRule.start);
  const previousWeekendEnd = etWallTimeToDate(0, weekendRule.end);
  if (slotStart < previousWeekendEnd && slotEnd > previousWeekendStart) {
    return getWeekendOwnerForWeek(previousWeekStart);
  }

  return '';
}

function weekendEligiblePeople() {
  return weekendOnCallRotationRule().eligiblePeople;
}

function expectedWeekendOwner(weekStart) {
  const rotation = weekendOnCallRotationRule();
  if (rotation.deriveAsOppositeOf === 'weekdayEvenings') {
    return oppositeParticipant(expectedEveningOwner(), rotation.participants || rotation.eligiblePeople || ['RS', 'AS']);
  }
  const index = modulo(weeksBetween(rotation.baseWeekStart, weekStart), rotation.rotationOrder.length);
  return rotation.rotationOrder[index];
}

function getWeekendOwnerForWeek(weekStart) {
  const rotation = weekendOnCallRotationRule();
  if (rotation.assignments[weekStart]) {
    return rotation.assignments[weekStart];
  }
  return expectedWeekendOwner(weekStart);
}

function setWeekendOwnerForWeek(weekStart, personId) {
  const rotation = weekendOnCallRotationRule();
  rotation.assignments[weekStart] = personId;
  if (weekStart === rotation.baseWeekStart) {
    rotation.assignedTo = personId;
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

function formatZonedClock(date, timeZone) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
}

function formatZonedWeekday(date, timeZone) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'short'
  }).format(date);
}

function etWallTimeToDate(dayOffset, time) {
  return wallTimeToDate(dayOffset, time, rota.config.masterTimeZone);
}

function wallTimeToDate(dayOffset, time, timeZone) {
  const [year, month, day] = rota.config.weekStart.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const utcGuess = new Date(Date.UTC(year, month - 1, day + dayOffset, hour, minute));
  const offset = timeZoneOffsetMinutes(utcGuess, timeZone);
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
