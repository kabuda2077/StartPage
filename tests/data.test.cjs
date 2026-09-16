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
test('legacy groups receive stable IDs on normalization', () => {
  const saved=data.groups([{title:'Group',color:'#123456',links:[{name:'A',url:'example.com'}]}]);
  assert.ok(saved[0].id && saved[0].links[0].id);
  assert.deepEqual(data.groups(saved),saved);
});
