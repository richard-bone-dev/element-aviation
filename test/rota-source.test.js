const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const test = require('node:test');

const app = require('../app');

const { _test } = app;
const CANONICAL_HASH = 'd3d3e1490ce1d099a49a58f8c98642e9dbad050e37fb788d2c28cd0bf2a5885d';

function canonicalRota() {
  return app.getCanonicalRotaSource();
}

function sourceHash(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

test('canonical rota source data remains unchanged', () => {
  const rota = canonicalRota();

  assert.equal(sourceHash(rota), CANONICAL_HASH);
  assert.deepEqual(rota.config.people.map((person) => ({
    id: person.id,
    colorClass: person.colorClass,
    fixedWorkingBlocks: person.fixedWorkingBlocks || []
  })), [
    { id: 'RS', colorClass: 'rs', fixedWorkingBlocks: [] },
    {
      id: 'DP',
      colorClass: 'dp',
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
    { id: 'AS', colorClass: 'as', fixedWorkingBlocks: [] }
  ]);
  assert.deepEqual(rota.config.schedule, undefined);
  assert.deepEqual(rota.schedule.mon, [
    { start: '08:00', end: '09:30', people: ['DEFAULT_CORE_ASSIGNMENTS'] },
    { start: '09:30', end: '16:30', people: ['DEFAULT_CORE_ASSIGNMENTS'] },
    { start: '16:30', end: '18:00', people: ['DEFAULT_CORE_ASSIGNMENTS'] },
    { start: '18:00', end: '20:00', people: ['WEEKDAY_EVENING_OWNER'] },
    { start: '20:00', end: '22:00', people: ['WEEKDAY_EVENING_OWNER'] }
  ]);
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

    assert.equal(asScore.weekend, 58);
    assert.equal(asScore.total, asScore.assigned);
    assert.notEqual(asScore.total, asScore.assigned + asScore.weekend);
  });
});

test('weekday early and late rotation remains unchanged', () => {
  const baseWeek = canonicalRota();
  const nextWeek = canonicalRota();
  nextWeek.config.weekStart = '2026-05-04';

  _test.withRotaForTesting(baseWeek, () => {
    assert.equal(_test.expectedEveningOwner(), 'RS');
    assert.equal(_test.expectedEarlyStartOwner(), 'AS');
  });

  _test.withRotaForTesting(nextWeek, () => {
    assert.equal(_test.expectedEveningOwner(), 'AS');
    assert.equal(_test.expectedEarlyStartOwner(), 'RS');
  });
});

test('weekend on-call assignment remains unchanged', () => {
  const baseWeek = canonicalRota();
  const nextWeek = canonicalRota();
  nextWeek.config.weekStart = '2026-05-04';

  _test.withRotaForTesting(baseWeek, () => {
    assert.equal(_test.getWeekendOwnerForWeek('2026-04-27'), 'AS');
    assert.equal(_test.expectedWeekendOwner('2026-04-27'), 'AS');
  });

  _test.withRotaForTesting(nextWeek, () => {
    assert.equal(_test.getWeekendOwnerForWeek('2026-05-04'), 'RS');
    assert.equal(_test.expectedWeekendOwner('2026-05-04'), 'RS');
  });
});

test('staff colours, break times, and working hours remain unchanged', () => {
  const rota = canonicalRota();

  _test.withRotaForTesting(rota, () => {
    assert.deepEqual(rota.config.people.map((person) => [person.id, person.colorClass]), [
      ['RS', 'rs'],
      ['DP', 'dp'],
      ['AS', 'as']
    ]);
    assert.equal(_test.fixedHoursForPerson('RS'), 0);
    assert.equal(_test.fixedHoursForPerson('DP'), 39);
    assert.equal(_test.fixedHoursForPerson('AS'), 0);
    assert.deepEqual(_test.rsBreakForDay('mon'), {
      start: '14:00',
      end: '16:00',
      durationMinutes: 120,
      isEveningOwner: true
    });
  });
});

test('US Eastern and UK-equivalent labels remain consistent', () => {
  _test.withRotaForTesting(canonicalRota(), () => {
    assert.equal(_test.formatLocalRange(0, '08:00', '09:30', 'Europe/London'), '13:00-14:30');
    assert.equal(_test.formatLocalRange(0, '18:00', '22:00', 'Europe/London'), '23:00-03:00');
    assert.equal(_test.formatWeekendLocalRange('Europe/London'), 'Sat 02 May, 03:00 to Mon 04 May, 13:00');
  });
});

test('rota JSON export and load preserves canonical data exactly', () => {
  const rota = canonicalRota();
  const json = app.exportRotaConfiguration(rota);
  const loaded = app.loadRotaConfiguration(json);

  assert.deepEqual(loaded, rota);
  assert.equal(sourceHash(loaded), CANONICAL_HASH);
});
