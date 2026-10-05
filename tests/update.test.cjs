const test = require('node:test');
const assert = require('node:assert/strict');
require('../update-client.js');
const updates = StartPageUpdates;
const release = tag => ({ ok: true, json: async () => ({ tag_name: tag, draft: false, prerelease: false }) });
function setup(options = {}) {
  const memory = options.memory || new Map();
  const storage = { getItem: key => memory.get(key) || null, setItem: (key, value) => memory.set(key, value) };
  let time = 1800000000000, response = () => release('v1.10.0');
  const calls = [];
  const client = updates.create({ storage, version: '1.9.0', now: () => time, locks: null,
    fetcher: async (...args) => { calls.push(args); return response(...args); }, ...options });
  return { client, memory, calls, advance: milliseconds => { time += milliseconds; }, respond: callback => { response = callback; } };
}

test('versions are compared numerically and unsafe or prerelease tags are rejected', () => {
  for (const [a, b, result] of [['1.10.0', '1.9.0', 1], ['v2', '1.99', 1], ['1.9', '1.9.0.0', 0], ['1.8.9', '1.9', -1], ['1.9.0-beta', '1.9', null], ['../../elsewhere', '1.9', null], ['javascript:alert(1)', '1.9', null]]) {
    assert.equal(updates.compareVersions(a, b), result);
  }
});

test('automatic checks reuse a successful result for 24 hours; manual checks bypass that interval', async () => {
  const { client, calls, advance, memory } = setup();
  assert.equal(client.getState().status, 'idle');
  const pending = client.check();
  assert.equal(client.getState().status, 'checking');
  assert.equal(client.check(true), pending);
  assert.equal(await pending, true);
  assert.equal(client.getState().releaseUrl, 'https://github.com/kabuda2077/StartPage/releases/tag/v1.10.0');
  assert.equal(calls[0][0], updates.API_URL);
  assert.equal(calls[0][1].credentials, 'omit');
  assert.deepEqual(calls[0][1].headers, { Accept: 'application/vnd.github+json' });
  assert.equal(await client.check(), false);
  advance(updates.CHECK_INTERVAL - 1);
  assert.equal(await client.check(), false);
  advance(1);
  assert.equal(await client.check(), true);
  assert.equal(calls.length, 2);
  assert.equal(await client.check(true), true);
  assert.equal(calls.length, 3);
  const upgraded = setup({ version: '1.10.0', memory }).client;
  assert.equal(upgraded.getState().status, 'idle');
});

test('failures retain a known newer release and back off automatic requests for an hour', async () => {
  const state = setup();
  await state.client.check(); state.advance(updates.CHECK_INTERVAL);
  state.respond(() => { throw Error('network error with untrusted details'); });
  assert.equal(await state.client.check(), false);
  assert.equal(state.client.getState().status, 'available');
  assert.equal(state.client.getState().latestVersion, '1.10.0');
  state.advance(updates.RETRY_INTERVAL - 1);
  assert.equal(await state.client.check(), false);
  assert.equal(state.calls.length, 2);
  state.advance(1); await state.client.check();
  assert.equal(state.calls.length, 3);
  await state.client.check(true);
  assert.equal(state.calls.length, 4);
  assert.ok(!state.memory.get(updates.STORAGE_KEY).includes('untrusted'));
  const withoutCache = setup();
  withoutCache.respond(() => ({ ok: false }));
  await withoutCache.client.check();
  assert.equal(withoutCache.client.getState().status, 'error');
});

test('only validated stable metadata is saved and links never come from remote HTML URLs', async () => {
  const state = setup();
  for (const payload of [null, { tag_name: 'v1.10.0', draft: true, prerelease: false }, { tag_name: 'v1.10.0', draft: false, prerelease: true }, { tag_name: '../bad', draft: false, prerelease: false }]) {
    state.respond(() => ({ ok: true, json: async () => payload }));
    assert.equal(await state.client.check(true), false);
    assert.equal(state.client.getState().latestVersion, null);
  }
  state.respond(() => ({ ok: true, json: async () => ({ tag_name: 'v1.10.0', draft: false, prerelease: false, html_url: 'https://example.com/untrusted' }) }));
  await state.client.check(true);
  assert.equal(state.client.getState().releaseUrl, 'https://github.com/kabuda2077/StartPage/releases/tag/v1.10.0');
});

test('corrupt/future timestamps cannot suppress checks; missing versions and offline auto checks are skipped', async () => {
  const state = setup();
  state.memory.set(updates.STORAGE_KEY, '{broken');
  assert.equal(await state.client.check(), true);
  state.memory.set(updates.STORAGE_KEY, JSON.stringify({ tag: 'v1.9.0', checkedAt: 9999999999999, failedAt: 9999999999999 }));
  assert.equal(await state.client.check(), true);
  const unknown = setup({ version: '__STARTPAGE_VERSION__' });
  assert.equal(await unknown.client.check(true), false);
  assert.equal(unknown.client.getState().status, 'unknown');
  assert.equal(unknown.calls.length, 0);
  const offline = setup({ canCheck: () => false });
  assert.equal(await offline.client.check(), false);
  assert.equal(offline.calls.length, 0);
});

test('a timeout records failure, but cancelling a request does not replace a cached result', async () => {
  const blocked = (url, { signal }) => new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true }));
  const timeout = setup({ timeout: 5 }); timeout.respond(blocked);
  assert.equal(await timeout.client.check(), false);
  assert.equal(timeout.client.getState().status, 'error');
  const state = setup(); await state.client.check();
  const before = state.memory.get(updates.STORAGE_KEY);
  let started; const ready = new Promise(resolve => { started = resolve; });
  state.respond((...args) => { started(); return blocked(...args); });
  const pending = state.client.check(true); await ready; state.client.cancel();
  assert.equal(await pending, false);
  assert.equal(state.memory.get(updates.STORAGE_KEY), before);
});

test('tabs share the automatic-check lock and denied locks fall back to normal requests', async () => {
  let tail = Promise.resolve();
  const locks = { request(name, { signal }, callback) {
    assert.equal(name, 'startpage-update-check');
    const run = tail.then(() => { if (signal.aborted) throw new DOMException('Aborted', 'AbortError'); return callback(); });
    tail = run.catch(() => {}); return run;
  } };
  const memory = new Map(), first = setup({ memory, locks }), second = setup({ memory, locks });
  await Promise.all([first.client.check(), second.client.check()]);
  assert.equal(first.calls.length + second.calls.length, 1);
  assert.equal(second.client.getState().latestVersion, '1.10.0');
  const denied = setup({ locks: { request: () => Promise.reject(new DOMException('Denied', 'SecurityError')) } });
  assert.equal(await denied.client.check(), true);
  assert.equal(denied.calls.length, 1);
});
