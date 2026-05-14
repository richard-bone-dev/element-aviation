const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const test = require('node:test');

const app = require('../app');

const { _test } = app;
const CANONICAL_HASH = 'e210ddd71aed1dbf9e4ea1a9db7a2ea9f4da6e1bbb7f19e7b1a483a4f4e6c1c4';

function canonicalRota() {
  return app.getCanonicalRotaSource();
}

function sourceHash(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function person(rota, personId) {
  return rota.config.people.find((candidate) => candidate.id === personId);
}

test('canonical rota source data matches corrected Phase 1 assumptions', () => {
  const rota = canonicalRota();

  assert.equal(sourceHash(rota), CANONICAL_HASH);
  assert.equal(rota.config.scheduleSourceTimeZone, 'America/New_York');
  assert.equal(rota.config.rsCoverageSupport.enabled, false);
  assert.deepEqual(rota.config.coverageRules.weekendOnCall, {
    startDay: 'fri',
    start: '22:00',
    endDay: 'mon',
    end: '04:00'
  });
  assert.deepEqual(rota.config.rotations.weekdayEarlyStarts, {
    days: ['mon', 'tue', 'wed', 'thu', 'fri'],
    start: '09:30',
    end: '16:30',
    timeZone: 'America/New_York',
    participants: ['RS', 'AS'],
    baseWeekStart: '2026-05-11',
    deriveAsOppositeOf: 'weekdayEvenings',
    alternatesWeekly: true
  });
  assert.equal(rota.config.rotations.weekdayEvenings.start, '11:00');
  assert.equal(rota.config.rotations.weekdayEvenings.end, '22:00');
  assert.equal(rota.config.rotations.weekdayEvenings.baseWeekStart, '2026-05-11');
  assert.equal(rota.config.rotations.weekdayEvenings.startingPerson, 'RS');
  assert.equal(rota.config.rotations.weekendOnCall.baseWeekStart, '2026-05-11');
  assert.equal(rota.config.rotations.weekendOnCall.deriveAs, 'weekdayEarlyStarts');
  assert.deepEqual(rota.config.rotations.weekendOnCall.assignments, { '2026-05-11': 'AS' });
  assert.equal(rota.config.rotations.weekendOnCall.estimatedHours, 54);
  assert.equal(rota.config.computedAssignmentTokens.weekdayEarlyOwner, 'WEEKDAY_EARLY_OWNER');
  assert.equal(rota.config.computedAssignmentTokens.asLateFairnessStart, 'AS_LATE_FAIRNESS_START');
  assert.deepEqual(rota.schedule.mon, [
    { start: '09:30', end: '16:30', people: ['WEEKDAY_EARLY_OWNER'] },
    { start: '10:00', end: '11:00', people: ['AS_LATE_FAIRNESS_START'] },
    { start: '11:00', end: '16:30', people: ['WEEKDAY_EVENING_OWNER'] },
    { start: '16:30', end: '18:00', people: ['WEEKDAY_EVENING_OWNER'] },
    { start: '18:00', end: '20:00', people: ['WEEKDAY_EVENING_OWNER'] },
    { start: '20:00', end: '22:00', people: ['WEEKDAY_EVENING_OWNER'] }
  ]);
});

test('schedule model options keep the current working model as the default', () => {
  assert.deepEqual(app.getScheduleModelOptions(), [
    { id: 'current', label: 'Current Working Model', default: true },
    { id: 'ableEt', label: 'Able ET Model', default: false }
  ]);

  assert.deepEqual(app.getScheduleModelSource('current'), canonicalRota());
  assert.deepEqual(app.getDisplayTimezoneOptions(), [
    { id: 'ET', label: 'ET', default: true },
    { id: 'UK', label: 'UK', default: false }
  ]);
});

test('Able ET model stores Able supplied hours as Eastern source data', () => {
  const able = app.getScheduleModelSource('ableEt');

  assert.equal(able.config.scheduleSourceTimeZone, 'America/New_York');
  assert.equal(able.config.businessCoverageEnd, '23:00');
  assert.deepEqual(able.config.coverageRules.weekendOnCall, {
    startDay: 'fri',
    start: '18:00',
    endDay: 'mon',
    end: '04:00'
  });
  assert.deepEqual(person(able, 'DP').fixedWorkingBlocks, [
    {
      id: 'able-dp-weekday-morning',
      label: 'Able weekday morning fixed hours',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      start: '04:00',
      end: '10:00',
      timeZone: 'America/New_York',
      type: 'fixed'
    },
    {
      id: 'able-dp-weekday-afternoon',
      label: 'Able weekday afternoon fixed hours',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      start: '13:00',
      end: '17:00',
      timeZone: 'America/New_York',
      type: 'fixed'
    },
    {
      id: 'able-dp-sat-morning',
      label: 'Able Saturday fixed hours',
      days: ['Sat'],
      start: '04:30',
      end: '08:30',
      timeZone: 'America/New_York',
      type: 'fixed'
    }
  ]);
  assert.deepEqual(able.schedule.mon, [
    { start: '08:00', end: '16:00', people: ['RS'] },
    { start: '18:00', end: '23:00', people: ['RS'] },
    { start: '09:00', end: '15:00', people: ['AS'] },
    { start: '18:00', end: '23:00', people: ['AS'] }
  ]);
});

test('Able ET model renders ET source slots with date-aware UK equivalents', () => {
  const able = app.getScheduleModelSource('ableEt');

  _test.withRotaForTesting(able, () => {
    assert.equal(_test.getAssignmentForSlot('mon', '04:00', '04:30').people.includes('DP'), true);
    assert.equal(_test.getAssignmentForSlot('mon', '09:00', '09:30').people.includes('RS'), true);
    assert.equal(_test.getAssignmentForSlot('mon', '09:00', '09:30').people.includes('AS'), true);
    assert.equal(_test.getAssignmentForSlot('mon', '22:30', '23:00').people.includes('RS'), true);
    assert.equal(_test.getAssignmentForSlot('mon', '22:30', '23:00').people.includes('AS'), true);
    assert.equal(_test.getAssignmentForSlot('sat', '04:30', '05:00').people.includes('DP'), true);
    assert.equal(_test.formatLocalRange(0, '04:00', '10:00', 'Europe/London'), '09:00-15:00');
    assert.equal(_test.formatLocalRange(5, '04:30', '08:30', 'Europe/London'), '09:30-13:30');
  });
});

test('Able ET model feeds validation, fairness, and weekend calculations separately', () => {
  const able = app.getScheduleModelSource('ableEt');

  _test.withRotaForTesting(able, () => {
    const validation = _test.validateRota();
    const scores = _test.calculateFairness(validation);
    const warningCodes = validation.warnings.map((warning) => warning.code);

    assert.equal(warningCodes.includes('fixed-hours-missing'), false);
    assert.equal(warningCodes.includes('weekday-evening-rotation-conflict'), false);
    assert.equal(warningCodes.includes('weekday-early-start-rotation-conflict'), false);
    assert.equal(warningCodes.includes('daily-hours-outside-range'), true);
    assert.equal(warningCodes.includes('two-week-fairness-difference'), true);
    assert.equal(warningCodes.includes('late-to-early'), false);
    assert.equal(_test.getWeekendOnCallPersonForSlot('fri', '17:30', '18:00'), '');
    assert.equal(_test.getWeekendOnCallPersonForSlot('fri', '18:00', '18:30'), 'AS');
    assert.equal(_test.formatWeekendLocalRange('Europe/London'), 'Fri 15 May, 23:00 to Mon 18 May, 09:00');
    assert.equal(scores.find((score) => score.id === 'DP').total, 54);
    assert.equal(scores.find((score) => score.id === 'RS').assigned, 65);
    assert.equal(scores.find((score) => score.id === 'AS').assigned, 55);
    assert.equal(scores.find((score) => score.id === 'AS').weekend, 58);
  });
});

test('weekend on-call runs Friday 22:00 ET to Monday 04:00 ET', () => {
  _test.withRotaForTesting(canonicalRota(), () => {
    assert.equal(_test.getWeekendOnCallPersonForSlot('fri', '21:30', '22:00'), '');
    assert.equal(_test.getWeekendOnCallPersonForSlot('fri', '22:00', '22:30'), 'AS');
    assert.equal(_test.getWeekendOnCallPersonForSlot('sun', '23:30', '24:00'), 'AS');
    assert.equal(_test.getWeekendOnCallPersonForSlot('mon', '03:30', '04:00'), 'RS');
    assert.equal(_test.getWeekendOnCallPersonForSlot('mon', '04:00', '04:30'), '');
    assert.equal(_test.formatWeekendLocalRange('Europe/London'), 'Sat 16 May, 03:00 to Mon 18 May, 09:00');
  });
});

test('DP has fixed Saturday work but is not assigned weekend on-call cover', () => {
  const rota = canonicalRota();
  const dpBlocks = person(rota, 'DP').fixedWorkingBlocks || [];

  assert.equal(person(rota, 'DP').weekendEligible, false);
  assert.equal(rota.config.rotations.weekendOnCall.eligiblePeople.includes('DP'), false);
  assert.deepEqual(rota.config.rotations.weekendOnCall.excluded, ['DP']);
  assert.deepEqual(dpBlocks.find((block) => block.id === 'dp-sat-morning'), {
    id: 'dp-sat-morning',
    label: 'Saturday fixed hours',
    days: ['Sat'],
    start: '04:00',
    end: '07:00',
    timeZone: 'America/New_York',
    type: 'fixed'
  });

  const invalidOnCall = canonicalRota();
  invalidOnCall.config.rotations.weekendOnCall.assignedTo = 'DP';
  invalidOnCall.config.rotations.weekendOnCall.assignments['2026-05-11'] = 'DP';
  _test.withRotaForTesting(invalidOnCall, () => {
    const warning = _test.validateRota().warnings.find((candidate) => candidate.code === 'weekend-conflict');
    assert.equal(warning.level, 'error');
    assert.equal(warning.personId, 'DP');
  });

  const validWeekendWork = canonicalRota();
  validWeekendWork.schedule.sat = [{ start: '04:00', end: '07:00', people: ['DP'] }];
  _test.withRotaForTesting(validWeekendWork, () => {
    const warning = _test.validateRota().warnings.find((candidate) => candidate.code === 'dp-weekend-assignment');
    assert.equal(warning, undefined);
  });

  const invalidWeekendWork = canonicalRota();
  invalidWeekendWork.schedule.sat = [{ start: '10:00', end: '11:00', people: ['DP'] }];
  _test.withRotaForTesting(invalidWeekendWork, () => {
    const warning = _test.validateRota().warnings.find((candidate) => candidate.code === 'dp-weekend-assignment');
    assert.equal(warning.level, 'error');
    assert.equal(warning.personId, 'DP');
  });
});

test('RS and AS both work each week while early/on-call and late patterns alternate', () => {
  const anchorWeek = canonicalRota();
  anchorWeek.config.weekStart = '2026-05-11';
  const nextWeek = canonicalRota();
  nextWeek.config.weekStart = '2026-05-18';
  const followingWeek = canonicalRota();
  followingWeek.config.weekStart = '2026-05-25';

  _test.withRotaForTesting(anchorWeek, () => {
    assert.equal(_test.expectedEarlyStartOwner(), 'AS');
    assert.equal(_test.expectedEveningOwner(), 'RS');
    assert.equal(_test.getWeekendOwnerForWeek('2026-05-11'), 'AS');
    assert.equal(_test.expectedWeekendOwner('2026-05-11'), 'AS');
    assert.equal(_test.getAssignmentForSlot('mon', '09:30', '10:00').people.includes('AS'), true);
    assert.equal(_test.getAssignmentForSlot('mon', '16:00', '16:30').people.includes('AS'), true);
    assert.equal(_test.getAssignmentForSlot('mon', '16:30', '17:00').people.includes('AS'), false);
    assert.equal(_test.getAssignmentForSlot('mon', '11:00', '11:30').people.includes('RS'), true);
  });

  _test.withRotaForTesting(nextWeek, () => {
    assert.equal(_test.expectedEarlyStartOwner(), 'RS');
    assert.equal(_test.expectedEveningOwner(), 'AS');
    assert.equal(_test.getWeekendOwnerForWeek('2026-05-18'), 'RS');
    assert.equal(_test.expectedWeekendOwner('2026-05-18'), 'RS');
    assert.equal(_test.getAssignmentForSlot('mon', '09:30', '10:00').people.includes('RS'), true);
    assert.equal(_test.getAssignmentForSlot('mon', '16:00', '16:30').people.includes('RS'), true);
    assert.equal(_test.getAssignmentForSlot('mon', '16:30', '17:00').people.includes('RS'), false);
    assert.equal(_test.getAssignmentForSlot('mon', '10:00', '10:30').people.includes('AS'), true);
    assert.equal(_test.getAssignmentForSlot('mon', '11:00', '11:30').people.includes('AS'), true);
  });

  _test.withRotaForTesting(followingWeek, () => {
    assert.equal(_test.expectedEarlyStartOwner(), 'AS');
    assert.equal(_test.expectedEveningOwner(), 'RS');
    assert.equal(_test.expectedWeekendOwner('2026-05-25'), 'AS');
  });
});

test('RS and AS early shifts start at 09:30 ET', () => {
  const nextWeek = canonicalRota();
  nextWeek.config.weekStart = '2026-05-18';

  _test.withRotaForTesting(canonicalRota(), () => {
    assert.equal(_test.getAssignmentForSlot('mon', '09:00', '09:30').people.includes('AS'), false);
    assert.equal(_test.getAssignmentForSlot('mon', '09:30', '10:00').people.includes('AS'), true);
    assert.equal(_test.getAssignmentForSlot('mon', '16:00', '16:30').people.includes('AS'), true);
  });

  _test.withRotaForTesting(nextWeek, () => {
    assert.equal(_test.getAssignmentForSlot('mon', '09:00', '09:30').people.includes('RS'), false);
    assert.equal(_test.getAssignmentForSlot('mon', '09:30', '10:00').people.includes('RS'), true);
    assert.equal(_test.getAssignmentForSlot('mon', '16:00', '16:30').people.includes('RS'), true);
  });
});

test('RS late starts at 11:00 ET and AS late gets a 10:00 fairness start', () => {
  const nextWeek = canonicalRota();
  nextWeek.config.weekStart = '2026-05-18';

  _test.withRotaForTesting(canonicalRota(), () => {
    assert.equal(_test.getAssignmentForSlot('mon', '10:30', '11:00').people.includes('RS'), false);
    assert.equal(_test.getAssignmentForSlot('mon', '11:00', '11:30').people.includes('RS'), true);
  });

  _test.withRotaForTesting(nextWeek, () => {
    assert.equal(_test.getAssignmentForSlot('mon', '09:30', '10:00').people.includes('AS'), false);
    assert.equal(_test.getAssignmentForSlot('mon', '10:00', '10:30').people.includes('AS'), true);
    assert.equal(_test.getAssignmentForSlot('mon', '11:00', '11:30').people.includes('AS'), true);
  });
});

test('AS early-shift pattern matches the following RS early-shift pattern outside childcare', () => {
  const asEarlyWeek = canonicalRota();
  asEarlyWeek.config.weekStart = '2026-05-11';
  const rsEarlyWeek = canonicalRota();
  rsEarlyWeek.config.weekStart = '2026-05-18';
  const days = ['mon', 'tue', 'wed', 'thu', 'fri'];

  days.forEach((dayId) => {
    _test.withRotaForTesting(asEarlyWeek, () => {
      assert.equal(_test.getAssignmentForSlot(dayId, '09:30', '10:00').people.includes('AS'), true);
      assert.equal(_test.getAssignmentForSlot(dayId, '10:30', '11:00').people.includes('AS'), true);
      assert.equal(_test.getAssignmentForSlot(dayId, '16:00', '16:30').people.includes('AS'), true);
      assert.equal(_test.getAssignmentForSlot(dayId, '16:30', '17:00').people.includes('AS'), false);
      assert.equal(_test.getAssignmentForSlot(dayId, '08:00', '08:30').people.includes('AS'), false);
    });

    _test.withRotaForTesting(rsEarlyWeek, () => {
      assert.equal(_test.getAssignmentForSlot(dayId, '09:30', '10:00').people.includes('RS'), true);
      assert.equal(_test.getAssignmentForSlot(dayId, '10:30', '11:00').people.includes('RS'), true);
      assert.equal(_test.getAssignmentForSlot(dayId, '16:00', '16:30').people.includes('RS'), true);
    });
  });
});

test('DP fixed blocks are normalized to ET and UK display remains a conversion', () => {
  const rota = canonicalRota();

  _test.withRotaForTesting(rota, () => {
    assert.deepEqual(person(rota, 'DP').fixedWorkingBlocks, [
      {
        id: 'dp-weekday-main',
        label: 'weekday fixed hours',
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        start: '04:00',
        end: '10:00',
        timeZone: 'America/New_York',
        type: 'fixed'
      },
      {
        id: 'dp-mon-wed-evening',
        label: 'Mon-Wed evening fixed hours',
        days: ['Mon', 'Tue', 'Wed'],
        start: '13:00',
        end: '15:00',
        timeZone: 'America/New_York',
        type: 'fixed'
      },
      {
        id: 'dp-sat-morning',
        label: 'Saturday fixed hours',
        days: ['Sat'],
        start: '04:00',
        end: '07:00',
        timeZone: 'America/New_York',
        type: 'fixed'
      }
    ]);

    const rows = _test.getDpFixedDebugRows();
    const mondayMain = rows.find((row) => row.sourceDay === 'Monday' && row.sourceRange === '04:00-10:00 America/New_York');
    const mondayEvening = rows.find((row) => row.sourceDay === 'Monday' && row.sourceRange === '13:00-15:00 America/New_York');
    const saturdayMorning = rows.find((row) => row.sourceDay === 'Saturday' && row.sourceRange === '04:00-07:00 America/New_York');

    assert.equal(mondayMain.convertedRange, '04:00-10:00 ET');
    assert.equal(mondayEvening.convertedRange, '13:00-15:00 ET');
    assert.equal(saturdayMorning.convertedRange, '04:00-07:00 ET');
    assert.equal(_test.formatLocalRange(0, '04:00', '10:00', 'Europe/London'), '09:00-15:00');
    assert.equal(_test.formatLocalRange(5, '04:00', '07:00', 'Europe/London'), '09:00-12:00');
    assert.equal(_test.getAssignmentForSlot('sat', '04:00', '04:30').people.includes('DP'), true);
    assert.equal(_test.fixedHoursForPerson('DP'), 39);
  });
});

test('AS childcare constraints are separate from working assignments', () => {
  const rota = canonicalRota();

  assert.deepEqual(rota.config.availabilityRules.AS.unavailableBlocks, [
    { label: 'morning childcare', start: '08:00', end: '09:30' },
    { label: 'afternoon childcare', start: '16:30', end: '18:00' }
  ]);

  _test.withRotaForTesting(rota, () => {
    const assignment = _test.getAssignmentForSlot('mon', '08:00', '08:30');
    assert.equal(assignment.people.includes('AS'), false);

    const issue = _test.validateSlot('mon', '16:30', '17:00', ['AS']);
    assert.equal(issue.codes.includes('childcare-conflict'), true);
  });
});

test('AS childcare exclusion leaves visible coverage gaps instead of generated RS cover', () => {
  const asLateWeek = canonicalRota();
  asLateWeek.config.weekStart = '2026-05-18';

  _test.withRotaForTesting(asLateWeek, () => {
    ['wed', 'thu', 'fri'].forEach((dayId) => {
      const peakChildcare = _test.getAssignmentForSlot(dayId, '16:30', '17:00');
      const nonPeakChildcare = _test.getAssignmentForSlot(dayId, '17:00', '17:30');

      assert.deepEqual(peakChildcare.people, []);
      assert.deepEqual(nonPeakChildcare.people, []);
      assert.equal(peakChildcare.people.includes('AS'), false);
      assert.equal(nonPeakChildcare.people.includes('AS'), false);
      assert.equal(_test.validateSlot(dayId, '16:30', '17:00', peakChildcare.people).codes.includes('under-covered'), true);
    });
  });
});

test('peak-hour validation excludes weekends', () => {
  _test.withRotaForTesting(canonicalRota(), () => {
    const result = _test.validateSlot('sat', '11:00', '11:30', []);

    assert.equal(_test.isPeak('11:00', '11:30', 'sat'), false);
    assert.equal(result.codes.includes('peak-undercovered'), false);
  });
});

test('weekend on-call hours are excluded from fairness Total', () => {
  _test.withRotaForTesting(canonicalRota(), () => {
    const scores = _test.calculateFairness(_test.validateRota());
    const asScore = scores.find((score) => score.id === 'AS');

    assert.equal(asScore.weekend, 54);
    assert.equal(asScore.total, asScore.assigned);
    assert.notEqual(asScore.total, asScore.assigned + asScore.weekend);
  });
});

test('childcare constraints create gaps and do not add generated rescue to fairness Total', () => {
  const asLateWeek = canonicalRota();
  asLateWeek.config.weekStart = '2026-05-18';

  _test.withRotaForTesting(asLateWeek, () => {
    const scores = _test.calculateFairness(_test.validateRota());
    const rsScore = scores.find((score) => score.id === 'RS');
    const asScore = scores.find((score) => score.id === 'AS');

    assert.equal(rsScore.assigned, 35);
    assert.equal(rsScore.total, 35);
    assert.equal(rsScore.peakRescue, 0);
    assert.equal(asScore.assigned, 52.5);
    assert.equal(asScore.total, asScore.assigned);
    assert.equal(asScore.childcareOverrides, 0);
  });
});

test('RS peak-cover rescue is not generated and templates are not rewritten', () => {
  const nextWeek = canonicalRota();
  nextWeek.config.weekStart = '2026-05-18';

  _test.withRotaForTesting(nextWeek, () => {
    const before = _test.getRotaForTesting().schedule.mon;
    const assignment = _test.getAssignmentForSlot('mon', '16:30', '17:00');
    const after = _test.getRotaForTesting().schedule.mon;

    assert.equal(assignment.people.includes('AS'), false);
    assert.equal(assignment.people.includes('RS'), false);
    assert.equal(_test.validateSlot('mon', '16:30', '17:00', assignment.people).codes.includes('under-covered'), true);
    assert.deepEqual(after, before);
    assert.deepEqual(after[0], { start: '09:30', end: '16:30', people: ['WEEKDAY_EARLY_OWNER'] });
    assert.deepEqual(after[1], { start: '10:00', end: '11:00', people: ['AS_LATE_FAIRNESS_START'] });
  });
});

test('rota JSON export and load preserves corrected canonical data exactly', () => {
  const rota = canonicalRota();
  const json = app.exportRotaConfiguration(rota);
  const loaded = app.loadRotaConfiguration(json);

  assert.deepEqual(loaded, rota);
  assert.equal(sourceHash(loaded), CANONICAL_HASH);
});
