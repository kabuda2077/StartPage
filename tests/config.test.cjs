const test = require('node:test');
const assert = require('node:assert/strict');
require('../config.js');
const data = globalThis.StartPageData;

test('search distinguishes domains, local services and search terms', () => {
  assert.equal(data.navigationUrl('www.google.com'), 'https://www.google.com/');
  assert.equal(data.navigationUrl('localhost:3000'), 'http://localhost:3000/');
  assert.equal(data.navigationUrl('192.168.1.2:8080'), 'http://192.168.1.2:8080/');
  for (const value of ['System.Text.Json', '999.999.999.999', 'hello world']) assert.equal(data.navigationUrl(value), '');
  assert.equal(data.linkUrl('javascript:alert(1)'), '');
});

test('legacy and current backups share validation and stable IDs', () => {
  const groups = data.groups([{ title: 'Group', color: '#123456', links: [{ name: 'Link', url: 'example.com' }] }]);
  const old = data.importSettings({ schemaVersion: 1, settings: { siteData: JSON.stringify(groups) } });
  const current = data.parseBackup(data.serializeBackup({ schemaVersion: 2, settings: { siteData: groups } }));
  assert.deepEqual(current, old);
  assert.deepEqual(data.groups(groups), groups);
  assert.throws(() => data.importSettings({ schemaVersion: 2, settings: { enginesData: [] } }));
  assert.throws(() => data.importSettings({ schemaVersion: 2, settings: { qweatherApiHost: 'unrelated.example' } }));
});

test('a complete large backup fits the byte limit and can be imported again', () => {
  const url = 'https://example.com/' + 'a'.repeat(4000);
  const links = Array.from({ length: data.limits.links }, (_, i) => ({ id: String(i), name: '中文'.repeat(100), url }));
  const source = data.serializeBackup({ schemaVersion: 2, settings: { siteData: [{ id: 'g', title: 'Large', color: '#123456', links }] } });
  assert.ok(Buffer.byteLength(source) > 2 * 1024 * 1024);
  assert.ok(Buffer.byteLength(source) < data.limits.fileBytes);
  assert.equal(JSON.parse(data.parseBackup(source).siteData)[0].links.length, links.length);
});

test('stale list saves are rejected instead of merging or overwriting', () => {
  const memory = new Map();
  global.window = { startPageStorage: { getItem: key => memory.get(key) || null, setItem: (key, value) => memory.set(key, value) } };
  let stale = false;
  const store = StartPageStore.create('groups', data.groups, [{ id: 'g', title: 'Original', color: '#123456', links: [] }], () => { stale = true; });
  const draft = store.load();
  const remote = [{ ...draft[0], title: 'Remote' }];
  memory.set('groups', JSON.stringify(remote));
  draft[0].title = 'Local';
  assert.equal(store.save(draft), false);
  assert.equal(stale, true);
  assert.equal(JSON.parse(memory.get('groups'))[0].title, 'Remote');
  delete global.window;
});
