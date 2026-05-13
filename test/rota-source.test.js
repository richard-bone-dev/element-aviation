const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const test = require('node:test');

const app = require('../app');

const { _test } = app;
const CANONICAL_HASH = '84409d05542d9ea03c1e9e92a8c2fb10b9db2ccd2ac74524b637661d41737986';

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
    start: '09:00',
    end: '12:00',
    timeZone: 'Europe/London',
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

test('DP fixed UK blocks display as date-aware Eastern equivalents', () => {
  const rota = canonicalRota();

  _test.withRotaForTesting(rota, () => {
    assert.deepEqual(person(rota, 'DP').fixedWorkingBlocks, [
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
    ]);

    const rows = _test.getDpFixedDebugRows();
    const mondayMain = rows.find((row) => row.sourceDay === 'Monday' && row.sourceRange === '09:00-15:00 Europe/London');
    const mondayEvening = rows.find((row) => row.sourceDay === 'Monday' && row.sourceRange === '18:00-20:00 Europe/London');
    const saturdayMorning = rows.find((row) => row.sourceDay === 'Saturday' && row.sourceRange === '09:00-12:00 Europe/London');

    assert.equal(mondayMain.convertedRange, '04:00-10:00 ET');
    assert.equal(mondayEvening.convertedRange, '13:00-15:00 ET');
    assert.equal(saturdayMorning.convertedRange, '04:00-07:00 ET');
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

test('AS is excluded from afternoon childcare and RS generated cover is visible', () => {
  const asLateWeek = canonicalRota();
  asLateWeek.config.weekStart = '2026-05-18';

  _test.withRotaForTesting(asLateWeek, () => {
    ['wed', 'thu', 'fri'].forEach((dayId) => {
      const peakChildcare = _test.getAssignmentForSlot(dayId, '16:30', '17:00');
      const nonPeakChildcare = _test.getAssignmentForSlot(dayId, '17:00', '17:30');

      assert.deepEqual(peakChildcare.people, ['RS']);
      assert.deepEqual(nonPeakChildcare.people, ['RS']);
      assert.equal(peakChildcare.details.get('RS').some((detail) => detail.source === 'rs-peak-rescue'), true);
      assert.equal(nonPeakChildcare.details.get('RS').some((detail) => detail.source === 'rs-childcare-rescue'), true);
      assert.equal(peakChildcare.people.includes('AS'), false);
      assert.equal(nonPeakChildcare.people.includes('AS'), false);
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

test('childcare constraints and generated rescue are excluded from normal fairness Total', () => {
  const asLateWeek = canonicalRota();
  asLateWeek.config.weekStart = '2026-05-18';

  _test.withRotaForTesting(asLateWeek, () => {
    const scores = _test.calculateFairness(_test.validateRota());
    const rsScore = scores.find((score) => score.id === 'RS');
    const asScore = scores.find((score) => score.id === 'AS');

    assert.equal(rsScore.assigned, 35);
    assert.equal(rsScore.total, 35);
    assert.equal(rsScore.peakRescue > 0, true);
    assert.equal(asScore.assigned, 52.5);
    assert.equal(asScore.total, asScore.assigned);
    assert.equal(asScore.childcareOverrides, 0);
  });
});

test('RS peak-cover rescue is generated without rewriting normal shift templates', () => {
  const nextWeek = canonicalRota();
  nextWeek.config.weekStart = '2026-05-18';

  _test.withRotaForTesting(nextWeek, () => {
    const before = _test.getRotaForTesting().schedule.mon;
    const assignment = _test.getAssignmentForSlot('mon', '16:30', '17:00');
    const rescueDetails = assignment.details.get('RS') || [];
    const after = _test.getRotaForTesting().schedule.mon;

    assert.equal(assignment.people.includes('AS'), false);
    assert.equal(assignment.people.includes('RS'), true);
    assert.equal(rescueDetails.some((detail) => detail.source === 'rs-peak-rescue'), true);
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
