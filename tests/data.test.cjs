const test = require('node:test');
const assert = require('node:assert/strict');
require('../data.js');
const data = globalThis.StartPageData;
const group = (title = 'A') => ({ id: 'g', title, color: '#336699', links: [{ id: 'l', name: 'Site', url: 'https://example.com/' }] });
test('navigation validates IPs, package names and local HTTP services', () => {
  assert.equal(data.navigationUrl('System.Text.Json'), '');
  assert.equal(data.navigationUrl('999.999.999.999'), '');
  assert.equal(data.navigationUrl('localhost:3000'), 'http://localhost:3000/');
  assert.equal(data.navigationUrl('192.168.1.2:8080'), 'http://192.168.1.2:8080/');
  assert.equal(data.navigationUrl('www.google.com'), 'https://www.google.com/');
  assert.equal(data.linkUrl('javascript:alert(1)'), '');
  assert.equal(data.linkUrl('https://user:secret@example.com'), '');
});
test('v1 backup migration and v2 structured backup use identical validation', () => {
  const groups = [group()];
  const old = data.importSettings({schemaVersion:1,settings:{siteData:JSON.stringify(groups)}});
  const current = data.importSettings({schemaVersion:2,settings:{siteData:groups}});
  assert.deepEqual(old,current);
  assert.throws(()=>data.importSettings({schemaVersion:2,settings:{enginesData:[]}}));
  assert.throws(()=>data.importSettings({schemaVersion:2,settings:{userName:'x'.repeat(201)}}));
  assert.throws(()=>data.importSettings({schemaVersion:2,settings:{siteData:[{...group(),links:[{name:'x',url:'javascript:alert(1)'}]}]}}));
  assert.throws(()=>data.importSettings({schemaVersion:2,settings:{siteData:Array.from({length:101},()=>group())}}));
});
test('three-way merge preserves independent edits and rejects conflicting edits', () => {
  const base = [group()];
  const local = [group('Local')];
  const remote = [{...group(),color:'#ffffff'}];
  assert.deepEqual(data.merge(base,local,remote),[{...group('Local'),color:'#ffffff'}]);
  assert.throws(()=>data.merge(base,local,[group('Remote')]));
  assert.throws(()=>data.merge(base,local,[]));
});
test('three-way merge preserves reordering and concurrent new items', () => {
  const a=group(),b={...group('B'),id:'b'},c={...group('C'),id:'c'};
  assert.deepEqual(data.merge([a,b],[b,a],[a,b,c]).map(x=>x.id),['b','g','c']);
});
test('legal maximum-size settings round-trip with escaped and multibyte text', () => {
  const escaped = '\u0001'.repeat(190);
  const url = 'https://example.com/' + 'a'.repeat(data.limits.url - 'https://example.com/'.length);
  const siteData = Array.from({ length: data.limits.groups }, (_, i) => ({
    id: `${i}${escaped}`, title: escaped, color: '#123456',
    links: Array.from({ length: data.limits.links / data.limits.groups }, (_, j) => ({ id: `${j}${escaped}`, name: escaped, url }))
  }));
  const enginesData = Array.from({ length: data.limits.engines }, (_, i) => ({
    id: `${i}${escaped}`, name: escaped, icon: escaped,
    url: `https://example.com/?q={query}&x=${'a'.repeat(4000)}`
  }));
  const source = data.serializeBackup({ schemaVersion: 2, exportedAt: '2026-01-01', settings: { siteData, enginesData, userName: '中文'.repeat(100), qweatherApiKey: '字'.repeat(4096) } });
  assert.ok(Buffer.byteLength(source) > 2 * 1024 * 1024);
  assert.ok(Buffer.byteLength(source) < data.limits.fileBytes);
  assert.equal(JSON.parse(data.parseBackup(source).siteData).flatMap(item => item.links).length, data.limits.links);
  assert.deepEqual(JSON.parse(data.parseBackup(source).enginesData), enginesData);
});
test('backup byte guards apply to both directions, independent of string length', () => {
  const previous = data.limits.fileBytes;
  try {
    data.limits.fileBytes = 100;
    const source = JSON.stringify({schemaVersion:2,settings:{userName:'字'.repeat(20)}});
    assert.ok(source.length < 100 && Buffer.byteLength(source) > 100);
    assert.throws(() => data.parseBackup(source), /backupTooLarge/);
    assert.throws(() => data.serializeBackup({schemaVersion:2,settings:{userName:'字'.repeat(20)}}), /backupTooLarge/);
  } finally { data.limits.fileBytes = previous; }
});
test('normalized URL length must remain within the saved-field limit', () => {
  assert.equal(data.linkUrl('https://example.com/' + '中'.repeat(500)), '');
});
test('legacy groups receive stable IDs on normalization', () => {
  const saved=data.groups([{title:'Group',color:'#123456',links:[{name:'A',url:'example.com'}]}]);
  assert.ok(saved[0].id && saved[0].links[0].id);
  assert.deepEqual(data.groups(saved),saved);
});
