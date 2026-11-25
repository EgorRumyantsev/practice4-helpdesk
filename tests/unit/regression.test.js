const { normalizeTitle, validateTicketInput, canChangeStatus, filterAndSort } = require('../../src/core');

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

test('U04: sorts by priority and then by newest creation time', () => {
  const tickets = [
    { id: 1, priority: 'high', createdAt: '2026-10-01T00:00:00.000Z' },
    { id: 2, priority: 'low', createdAt: '2026-10-04T00:00:00.000Z' },
    { id: 3, priority: 'high', createdAt: '2026-10-02T00:00:00.000Z' }
  ];
  expect(filterAndSort(tickets).map(ticket => ticket.id)).toEqual([3, 1, 2]);
});