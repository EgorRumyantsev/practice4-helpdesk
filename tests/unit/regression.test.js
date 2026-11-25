const { normalizeTitle, validateTicketInput, canChangeStatus } = require('../../src/core');

test('U01: collapses all whitespace in a title', () => {
  expect(normalizeTitle('  VPN\t  outage\n')).toBe('VPN outage');
});

test.each([[4, false], [5, true], [80, true], [81, false]])(
  'U02: normalized title length %i has validity %s', (length, valid) => {
    const errors = validateTicketInput({
      title: '  ' + 'a'.repeat(length) + '  ', description: 'Valid description',
      category: 'network', priority: 'high'
    });
    expect(!errors.title).toBe(valid);
  }
);

test.each([
  ['new', 'in_progress', true],
  ['in_progress', 'resolved', true],
  ['new', 'resolved', false],
  ['in_progress', 'new', false]
])('U03: transition %s to %s is %s', (from, to, allowed) => {
  expect(canChangeStatus(from, to)).toBe(allowed);
});
