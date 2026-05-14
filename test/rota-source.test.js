const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const test = require('node:test');

const app = require('../app');

const { _test } = app;
const CANONICAL_HASH = 'df00ee95e7663e4e180966cdc822ad65bc664efc4079485ba1b9c1b1dadccd21';

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
  assert.equal(rota.config.rsCoverageSupport.normalBreakStart, '13:00');
  assert.equal(rota.config.rsCoverageSupport.eveningDutyBreakStart, '13:00');
  assert.equal(rota.config.rsCoverageSupport.normalBreakDurationMinutes, 90);
  assert.equal(rota.config.rsCoverageSupport.eveningDutyBreakDurationMinutes, 90);
  assert.deepEqual(rota.config.coverageRules.weekendOnCall, {
    startDay: 'fri',
    start: '22:00',
    endDay: 'mon',
    end: '04:00'
  });
  assert.deepEqual(rota.config.rotations.weekdayEarlyStarts, {
    days: ['mon', 'tue', 'wed', 'thu', 'fri'],
    start: '08:00',
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
  assert.equal(rota.config.computedAssignmentTokens.rsWeekdayEveningOwner, 'RS_WEEKDAY_EVENING_OWNER');
  assert.equal(rota.config.computedAssignmentTokens.rsWeekdayEarlyGapCover, 'RS_WEEKDAY_EARLY_GAP_COVER');
  assert.deepEqual(rota.schedule.mon, [
    { start: '08:00', end: '16:30', people: ['WEEKDAY_EARLY_OWNER'] },
    { start: '09:30', end: '11:00', people: ['RS_WEEKDAY_EVENING_OWNER'] },
    { start: '10:00', end: '11:00', people: ['AS_LATE_FAIRNESS_START'] },
    { start: '11:00', end: '16:30', people: ['WEEKDAY_EVENING_OWNER'] },
    { start: '16:30', end: '18:00', people: ['WEEKDAY_EVENING_OWNER', 'RS_WEEKDAY_EARLY_GAP_COVER'] },
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
  assert.deepEqual(able.config.computedAssignmentTokens, {
    defaultCoreAssignments: 'DEFAULT_CORE_ASSIGNMENTS',
    weekdayEarlyOwner: 'WEEKDAY_EARLY_OWNER',
    asLateFairnessStart: 'AS_LATE_FAIRNESS_START',
    weekdayEveningOwner: 'WEEKDAY_EVENING_OWNER'
  });
  assert.equal(able.config.rsCoverageSupport.normalBreakStart, '14:00');
  assert.equal(able.config.rsCoverageSupport.eveningDutyBreakStart, '14:00');
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
      days: ['Mon', 'Tue', 'Wed'],
      start: '13:00',
      end: '15:00',
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
    { start: '09:00', end: '15:00', people: ['AS'] },
    { start: '18:00', end: '23:00', people: ['WEEKDAY_EVENING_OWNER'] }
  ]);
  assert.deepEqual(able.schedule.fri, [
    { start: '08:00', end: '16:00', people: ['RS'] },
    { start: '09:00', end: '15:00', people: ['AS'] }
  ]);
});

test('Able ET model renders ET source slots with date-aware UK equivalents', () => {
  const able = app.getScheduleModelSource('ableEt');
  const ableWeekB = app.getScheduleModelSource('ableEt');
  ableWeekB.config.weekStart = '2026-05-18';

  _test.withRotaForTesting(able, () => {
    assert.equal(_test.getAssignmentForSlot('mon', '04:00', '04:30').people.includes('DP'), true);
    assert.equal(_test.getAssignmentForSlot('mon', '09:00', '09:30').people.includes('RS'), true);
    assert.equal(_test.getAssignmentForSlot('mon', '09:00', '09:30').people.includes('AS'), true);
    assert.equal(_test.getAssignmentForSlot('mon', '22:30', '23:00').people.includes('RS'), true);
    assert.equal(_test.getAssignmentForSlot('mon', '22:30', '23:00').people.includes('AS'), false);
    assert.equal(_test.getAssignmentForSlot('sat', '04:30', '05:00').people.includes('DP'), true);
    assert.equal(_test.formatLocalRange(0, '04:00', '10:00', 'Europe/London'), '09:00-15:00');
    assert.equal(_test.formatLocalRange(5, '04:30', '08:30', 'Europe/London'), '09:30-13:30');
  });

  _test.withRotaForTesting(ableWeekB, () => {
    assert.equal(_test.getAssignmentForSlot('mon', '08:00', '08:30').people.includes('RS'), true);
    assert.equal(_test.getAssignmentForSlot('mon', '09:00', '09:30').people.includes('AS'), true);
    assert.equal(_test.getAssignmentForSlot('mon', '18:00', '18:30').people.includes('RS'), false);
    assert.equal(_test.getAssignmentForSlot('mon', '18:00', '18:30').people.includes('AS'), true);
    assert.equal(_test.getAssignmentForSlot('fri', '18:00', '18:30').people.length, 0);
    assert.equal(_test.getWeekendOnCallPersonForSlot('fri', '18:00', '18:30'), 'AS');
    assert.equal(_test.getWeekendOnCallPersonForSlot('sat', '10:00', '10:30'), '');
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
    assert.equal(_test.getWeekendOnCallPersonForSlot('fri', '18:00', '18:30'), 'RS');
    assert.equal(_test.getWeekendOnCallPersonForSlot('sat', '10:00', '10:30'), '');
    assert.equal(_test.getWeekendOnCallPersonForSlot('sat', '18:00', '18:30'), 'RS');
    assert.equal(_test.getWeekendOnCallPersonForSlot('sun', '18:00', '18:30'), 'RS');
    assert.equal(_test.formatWeekendLocalRange('Europe/London'), 'Fri 15 May, 23:00 to Sat 16 May, 09:00; Sat 16 May, 23:00 to Sun 17 May, 09:00; Sun 17 May, 23:00 to Mon 18 May, 09:00');
    assert.equal(scores.find((score) => score.id === 'DP').total, 40);
    assert.equal(scores.find((score) => score.id === 'RS').assigned, 60);
    assert.equal(scores.find((score) => score.id === 'RS').weekend, 30);
    assert.equal(scores.find((score) => score.id === 'AS').assigned, 30);
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
    assert.equal(_test.getAssignmentForSlot('mon', '16:30', '17:00').people.includes('RS'), true);
    assert.equal(_test.getAssignmentForSlot('mon', '10:00', '10:30').people.includes('AS'), true);
    assert.equal(_test.getAssignmentForSlot('mon', '11:00', '11:30').people.includes('AS'), true);
  });

  _test.withRotaForTesting(followingWeek, () => {
    assert.equal(_test.expectedEarlyStartOwner(), 'AS');
    assert.equal(_test.expectedEveningOwner(), 'RS');
    assert.equal(_test.expectedWeekendOwner('2026-05-25'), 'AS');
  });
});

test('RS early shift starts at 08:00 ET while AS remains constrained by childcare', () => {
  const nextWeek = canonicalRota();
  nextWeek.config.weekStart = '2026-05-18';

  _test.withRotaForTesting(canonicalRota(), () => {
    assert.equal(_test.getAssignmentForSlot('mon', '09:00', '09:30').people.includes('AS'), false);
    assert.equal(_test.getAssignmentForSlot('mon', '09:30', '10:00').people.includes('AS'), true);
    assert.equal(_test.getAssignmentForSlot('mon', '16:00', '16:30').people.includes('AS'), true);
  });

  _test.withRotaForTesting(nextWeek, () => {
    assert.equal(_test.getAssignmentForSlot('mon', '08:00', '08:30').people.includes('RS'), true);
    assert.equal(_test.getAssignmentForSlot('mon', '09:30', '10:00').people.includes('RS'), true);
    assert.equal(_test.getAssignmentForSlot('mon', '13:00', '13:30').people.includes('RS'), false);
    assert.equal(_test.getAssignmentForSlot('mon', '14:30', '15:00').people.includes('RS'), true);
    assert.equal(_test.getAssignmentForSlot('mon', '16:00', '16:30').people.includes('RS'), true);
  });
});

test('RS late starts at 09:30 ET with a 13:00-14:30 break and AS late keeps its fairness start', () => {
  const nextWeek = canonicalRota();
  nextWeek.config.weekStart = '2026-05-18';

  _test.withRotaForTesting(canonicalRota(), () => {
    assert.equal(_test.getAssignmentForSlot('mon', '09:30', '10:00').people.includes('RS'), true);
    assert.equal(_test.getAssignmentForSlot('mon', '11:00', '11:30').people.includes('RS'), true);
    assert.equal(_test.getAssignmentForSlot('mon', '13:00', '13:30').people.includes('RS'), false);
    assert.equal(_test.getAssignmentForSlot('mon', '14:30', '15:00').people.includes('RS'), true);
  });

  _test.withRotaForTesting(nextWeek, () => {
    assert.equal(_test.getAssignmentForSlot('mon', '09:30', '10:00').people.includes('AS'), false);
    assert.equal(_test.getAssignmentForSlot('mon', '10:00', '10:30').people.includes('AS'), true);
    assert.equal(_test.getAssignmentForSlot('mon', '11:00', '11:30').people.includes('AS'), true);
  });
});

test('current model rotation validation excludes RS break and AS childcare windows', () => {
  const rsEarlyWeek = canonicalRota();
  rsEarlyWeek.config.weekStart = '2026-05-18';
  const asChildcareGapWeek = canonicalRota();
  asChildcareGapWeek.config.weekStart = '2026-05-18';
  asChildcareGapWeek.schedule.mon = asChildcareGapWeek.schedule.mon.map((block) => (
    block.start === '16:30' && block.end === '18:00'
      ? { ...block, people: ['WEEKDAY_EVENING_OWNER'] }
      : block
  ));

  _test.withRotaForTesting(rsEarlyWeek, () => {
    const assignment = _test.getAssignmentForSlot('mon', '13:00', '13:30');
    const validation = _test.validateSlot('mon', '13:00', '13:30', assignment.people, assignment.details);

    assert.equal(assignment.people.includes('RS'), false);
    assert.equal(validation.codes.includes('weekday-early-start-rotation-conflict'), false);
    assert.equal(validation.codes.includes('under-covered'), false);
  });

  _test.withRotaForTesting(asChildcareGapWeek, () => {
    const assignment = _test.getAssignmentForSlot('mon', '16:30', '17:00');
    const validation = _test.validateSlot('mon', '16:30', '17:00', assignment.people, assignment.details);

    assert.deepEqual(assignment.people, []);
    assert.equal(validation.codes.includes('weekday-evening-rotation-conflict'), false);
    assert.equal(validation.codes.includes('under-covered'), true);
  });
});

test('normal working-hour rules exclude late cover and keep two-week balance', () => {
  const asEarlyWeek = canonicalRota();
  asEarlyWeek.config.weekStart = '2026-05-11';
  const rsEarlyWeek = canonicalRota();
  rsEarlyWeek.config.weekStart = '2026-05-18';
  const days = ['mon', 'tue', 'wed', 'thu', 'fri'];

  days.forEach((dayId) => {
    _test.withRotaForTesting(asEarlyWeek, () => {
      assert.equal(_test.getAssignmentForSlot(dayId, '09:30', '10:00').people.includes('AS'), true);
      assert.equal(_test.getAssignmentForSlot(dayId, '16:00', '16:30').people.includes('AS'), true);
      assert.equal(_test.getAssignmentForSlot(dayId, '16:30', '17:00').people.includes('RS'), true);
      assert.equal(_test.getAssignmentForSlot(dayId, '16:30', '17:00').people.includes('AS'), false);
    });

    _test.withRotaForTesting(rsEarlyWeek, () => {
      assert.equal(_test.getAssignmentForSlot(dayId, '09:30', '10:00').people.includes('RS'), true);
      assert.equal(_test.getAssignmentForSlot(dayId, '16:00', '16:30').people.includes('RS'), true);
      const gapCover = _test.getAssignmentForSlot(dayId, '16:30', '17:00');
      assert.equal(gapCover.people.includes('RS'), true);
      assert.equal(_test.getAssignmentForSlot(dayId, '16:30', '17:00').people.includes('AS'), false);
      assert.equal((gapCover.details.get('RS') || []).some((assignment) => assignment.source === 'rs-early-gap-cover'), true);
    });
  });

  _test.withRotaForTesting(asEarlyWeek, () => {
    const validation = _test.validateRota();
    assert.equal(validation.warnings.some((warning) => warning.code === 'daily-hours-outside-range'), false);
    assert.equal(validation.warnings.some((warning) => warning.code === 'two-week-fairness-difference'), false);
    assert.equal(_test.normalWorkingHoursForPersonOnDay('mon', 'AS'), 7);
    assert.equal(_test.normalWorkingHoursForPersonOnDay('mon', 'RS'), 0);
  });

  _test.withRotaForTesting(rsEarlyWeek, () => {
    const validation = _test.validateRota();
    assert.equal(validation.warnings.some((warning) => warning.code === 'daily-hours-outside-range'), false);
    assert.equal(validation.warnings.some((warning) => warning.code === 'two-week-fairness-difference'), false);
    assert.equal(_test.normalWorkingHoursForPersonOnDay('mon', 'RS'), 7);
    assert.equal(_test.normalWorkingHoursForPersonOnDay('mon', 'AS'), 0);
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

test('AS childcare exclusion is preserved while RS covers the corrected alternating-week gap', () => {
  const asLateWeek = canonicalRota();
  asLateWeek.config.weekStart = '2026-05-18';

  _test.withRotaForTesting(asLateWeek, () => {
    ['wed', 'thu', 'fri'].forEach((dayId) => {
      const peakChildcare = _test.getAssignmentForSlot(dayId, '16:30', '17:00');
      const nonPeakChildcare = _test.getAssignmentForSlot(dayId, '17:00', '17:30');

      assert.deepEqual(peakChildcare.people, ['RS']);
      assert.deepEqual(nonPeakChildcare.people, ['RS']);
      assert.equal(peakChildcare.people.includes('AS'), false);
      assert.equal(nonPeakChildcare.people.includes('AS'), false);
      assert.equal(_test.validateSlot(dayId, '16:30', '17:00', peakChildcare.people).codes.includes('under-covered'), false);
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

test('RS corrected gap cover is visible in fairness without generated rescue hours', () => {
  const asLateWeek = canonicalRota();
  asLateWeek.config.weekStart = '2026-05-18';

  _test.withRotaForTesting(asLateWeek, () => {
    const scores = _test.calculateFairness(_test.validateRota());
    const rsScore = scores.find((score) => score.id === 'RS');
    const asScore = scores.find((score) => score.id === 'AS');

    assert.equal(rsScore.assigned, 42.5);
    assert.equal(rsScore.total, 42.5);
    assert.equal(rsScore.peakRescue, 0);
    assert.equal(asScore.assigned, 52.5);
    assert.equal(asScore.total, asScore.assigned);
    assert.equal(asScore.childcareOverrides, 0);
  });
});

test('RS corrected gap cover is computed and templates are not rewritten', () => {
  const nextWeek = canonicalRota();
  nextWeek.config.weekStart = '2026-05-18';

  _test.withRotaForTesting(nextWeek, () => {
    const before = _test.getRotaForTesting().schedule.mon;
    const assignment = _test.getAssignmentForSlot('mon', '16:30', '17:00');
    const after = _test.getRotaForTesting().schedule.mon;

    assert.equal(assignment.people.includes('AS'), false);
    assert.equal(assignment.people.includes('RS'), true);
    assert.equal((assignment.details.get('RS') || []).some((item) => item.source === 'rs-early-gap-cover'), true);
    assert.equal(_test.validateSlot('mon', '16:30', '17:00', assignment.people).codes.includes('under-covered'), false);
    assert.deepEqual(after, before);
    assert.deepEqual(after[0], { start: '08:00', end: '16:30', people: ['WEEKDAY_EARLY_OWNER'] });
    assert.deepEqual(after[1], { start: '09:30', end: '11:00', people: ['RS_WEEKDAY_EVENING_OWNER'] });
    assert.deepEqual(after[4], { start: '16:30', end: '18:00', people: ['WEEKDAY_EVENING_OWNER', 'RS_WEEKDAY_EARLY_GAP_COVER'] });
  });
});

test('default core assignment can still fall back to RS when AS is unavailable', () => {
  const fallbackRota = canonicalRota();
  fallbackRota.schedule.mon = [{ start: '08:00', end: '08:30', people: ['DEFAULT_CORE_ASSIGNMENTS'] }];

  _test.withRotaForTesting(fallbackRota, () => {
    const assignment = _test.getAssignmentForSlot('mon', '08:00', '08:30');

    assert.equal(assignment.people.includes('AS'), false);
    assert.equal(assignment.people.includes('RS'), true);
  });
});

test('rota JSON export and load preserves corrected canonical data exactly', () => {
  const rota = canonicalRota();
  const json = app.exportRotaConfiguration(rota);
  const loaded = app.loadRotaConfiguration(json);

  assert.deepEqual(loaded, rota);
  assert.equal(sourceHash(loaded), CANONICAL_HASH);
});
