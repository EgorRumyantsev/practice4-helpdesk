const { createApp } = require('../../src/app');

let server;
let base;
const input = {
  title: 'Сбой VPN', description: 'Нет доступа к учебной сети',
  category: 'network', priority: 'high'
};

beforeEach(async () => {
  server = createApp();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
});
afterEach(() => new Promise(resolve => server.close(resolve)));

async function request(path = '', method = 'GET', data) {
  const response = await fetch(base + '/api/tickets' + path, {
    method, headers: { 'content-type': 'application/json' },
    body: JSON.stringify(data)
  });
  return { status: response.status, body: await response.json() };
}

test('I01: reads the same ticket after successful creation', async () => {
  const created = await request('', 'POST', input);
  const list = await request();
  expect(created.status).toBe(201);
  expect(created.body.ticket).toMatchObject({ ...input, id: 5, status: 'new' });
  expect(list.status).toBe(200);
  expect(list.body.total).toBe(5);
  expect(list.body.items).toContainEqual(created.body.ticket);
});

test('I02: rejects invalid input without changing the registry', async () => {
  const before = await request();
  const result = await request('', 'POST', { ...input, title: 'Bad' });
  expect(result).toEqual({
    status: 400, body: { errors: { title: 'Тема должна содержать от 5 до 80 символов' } }
  });
  expect(await request()).toEqual(before);
});

test('I03: combines case-insensitive search, status and category', async () => {
  await request('', 'POST', { ...input, title: 'VPN в аудитории', category: 'hardware' });
  const query = new URLSearchParams({ search: ' vpn ', status: 'new', category: 'network' });
  const result = await request('?' + query);
  expect(result.status).toBe(200);
  expect(result.body.total).toBe(1);
  expect(result.body.items.map(ticket => ticket.id)).toEqual([1]);
});

test('I04: rejects skipping the in-progress state without changing the ticket', async () => {
  const before = await request();
  const result = await request('/1/status', 'PATCH', { status: 'resolved' });
  expect(result).toEqual({ status: 409, body: { error: 'Недопустимый переход' } });
  expect(await request()).toEqual(before);
});

test('I05: orders by descending priority and descending creation time', async () => {
  const result = await request();
  expect(result.status).toBe(200);
  expect(result.body.total).toBe(4);
  expect(result.body.items.map(ticket => ticket.id)).toEqual([4, 1, 2, 3]);
});

test('I06: GET /api/tickets?priority=high returns only high priority tickets', async () => {
  const result = await request('?priority=high');
  expect(result.status).toBe(200);
  expect(result.body.total).toBe(2);
  expect(result.body.items.map(ticket => ticket.priority)).toEqual(['high', 'high']);
});

test('I07: combines priority with the other filters', async () => {
  const query = new URLSearchParams({
    search: 'vpn', status: 'new', category: 'network', priority: 'medium'
  });
  expect(await request('?' + query)).toEqual({ status: 200, body: { items: [], total: 0 } });
});
