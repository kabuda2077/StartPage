const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const tools = import('../tools/release.mjs');
const commit = 'a'.repeat(40), version = '9.8.7';
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'startpage-release-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const write = (name, value) => { const file = path.join(root, name); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, typeof value === 'object' && !Buffer.isBuffer(value) ? JSON.stringify(value) : value); };
  const manifest = { version, icons: { 16: 'assets/icon.png' } };
  write('manifest.json', manifest); write('package.json', { version });
  write('package-lock.json', { version, packages: { '': { version } } });
  write('CHANGELOG.md', `# Changelog\n\n## v${version}\n- Test notes.\n\n## v9.8.6\n- Older notes.\n`);
  const html = `<meta name="application-version" content="${version}"><script src="app.js"></script>`;
  write('StartPage.html', html); write('dist/extension/index.html', html);
  write('dist/extension/manifest.json', manifest);
  write('dist/extension/app.js', '/* Test runtime. */'); write('dist/extension/assets/icon.png', Buffer.from([0, 1, 2, 255]));
  return { root, write, output: path.join(root, 'dist', 'release') };
}
function github() {
  const state = { release: null, tag: null, calls: [], failZipOnce: false };
  const run = args => {
    state.calls.push(args);
    if (args[0] === 'api') {
      if (!state.tag) throw Error('gh: Not Found (HTTP 404)');
      return JSON.stringify({ object: state.tag });
    }
    const [, action] = args;
    if (action === 'view') {
      if (!state.release) throw Error('release not found');
      return JSON.stringify(state.release);
    }
    if (action === 'create') {
      assert.equal(state.release, null);
      assert.ok(args.includes('--draft'));
      state.release = { isDraft: true, targetCommitish: args[args.indexOf('--target') + 1], assets: [], url: 'https://github.com/example/test/releases/tag/v9.8.7' };
    } else if (action === 'upload') {
      const file = args[3], name = path.basename(file);
      if (state.failZipOnce && name.endsWith('.zip')) { state.failZipOnce = false; throw Error('Simulated upload failure'); }
      const bytes = fs.readFileSync(file);
      state.release.assets = state.release.assets.filter(asset => asset.name !== name);
      state.release.assets.push({ name, size: bytes.length, digest: 'sha256:' + crypto.createHash('sha256').update(bytes).digest('hex'), state: 'uploaded' });
    } else if (action === 'edit') {
      assert.equal(state.release.assets.length, 2);
      assert.ok(args.includes('--draft=false'));
      state.release.isDraft = false; state.tag = { type: 'commit', sha: commit };
    } else throw Error('Unexpected GitHub command: ' + args.join(' '));
    return '';
  };
  return { state, run };
}

test('only a version increase on main or an explicit main-branch dispatch requests publishing', async () => {
  const { releaseRequested } = await tools;
  const base = { event: 'push', ref: 'refs/heads/main', version, previousVersion: '9.8.6' };
  assert.equal(releaseRequested(base), true);
  assert.equal(releaseRequested({ ...base, previousVersion: version }), false);
  assert.equal(releaseRequested({ ...base, previousVersion: null }), false);
  assert.equal(releaseRequested({ ...base, event: 'pull_request', requested: true }), false);
  assert.equal(releaseRequested({ ...base, event: 'workflow_dispatch', requested: false }), false);
  assert.equal(releaseRequested({ ...base, event: 'workflow_dispatch', requested: true }), true);
  assert.equal(releaseRequested({ ...base, ref: 'refs/heads/feature', event: 'workflow_dispatch', requested: true }), false);
  assert.throws(() => releaseRequested({ ...base, previousVersion: '9.9.0' }), /increased version/);
});

test('release validation rejects mismatched versions, missing notes and leaked development files', async t => {
  const { validateVersions, releaseNotes, prepare } = await tools;
  const data = fixture(t);
  assert.equal(validateVersions(data.root), version);
  assert.equal(releaseNotes(fs.readFileSync(path.join(data.root, 'CHANGELOG.md'), 'utf8'), version), '- Test notes.\n');
  assert.throws(() => releaseNotes('## v9.8.6\n- Older notes.', version), /Missing release notes/);
  data.write('package.json', { version: '9.8.6' });
  assert.throws(() => validateVersions(data.root), /versions must agree/);
  data.write('package.json', { version });
  data.write('dist/extension/tests/private.js', 'Not runtime code');
  assert.throws(() => prepare(data.root, commit), /Development files/);
});

test('prepared output is tied to its commit and detects modified files or path traversal', async t => {
  const { prepare, verify } = await tools;
  const data = fixture(t), metadata = prepare(data.root, commit);
  assert.equal(verify(data.output, commit).version, version);
  assert.equal(metadata.assets.length, 2);
  assert.equal(fs.readFileSync(path.join(data.output, 'StartPage.html'), 'utf8'), fs.readFileSync(path.join(data.root, 'StartPage.html'), 'utf8'));
  assert.throws(() => verify(data.output, 'b'.repeat(40)), /different commit/);
  fs.appendFileSync(path.join(data.output, 'notes.md'), 'Modified');
  assert.throws(() => verify(data.output), /notes checksum/);
  fs.writeFileSync(path.join(data.output, 'notes.md'), '- Test notes.\n');
  fs.appendFileSync(path.join(data.output, 'StartPage.html'), 'Modified');
  assert.throws(() => verify(data.output), /Asset checksum/);
  metadata.assets[0].name = '../outside.html';
  fs.writeFileSync(path.join(data.output, 'release.json'), JSON.stringify(metadata));
  assert.throws(() => verify(data.output), /asset list/);
});

test('an interrupted draft upload resumes without rebuilding or reuploading verified assets', async t => {
  const { prepare, publish } = await tools;
  const data = fixture(t); prepare(data.root, commit);
  const gh = github(); gh.state.failZipOnce = true;
  assert.throws(() => publish(data.output, { repository: 'example/test', commit }, gh.run), /upload failure/);
  assert.equal(gh.state.release.isDraft, true);
  assert.equal(gh.state.tag, null);
  assert.equal(gh.state.release.assets.length, 1);
  const url = publish(data.output, { repository: 'example/test', commit }, gh.run);
  assert.equal(url, gh.state.release.url);
  assert.equal(gh.state.release.isDraft, false);
  assert.equal(gh.state.tag.sha, commit);
  assert.equal(gh.state.calls.filter(args => args[1] === 'upload' && args[3].endsWith('StartPage.html')).length, 1);
  const writes = gh.state.calls.filter(args => ['create', 'upload', 'edit'].includes(args[1])).length;
  assert.equal(publish(data.output, { repository: 'example/test', commit }, gh.run), url);
  assert.equal(gh.state.calls.filter(args => ['create', 'upload', 'edit'].includes(args[1])).length, writes);
});

test('publishing refuses to move an existing tag or replace a different published asset', async t => {
  const { prepare, publish } = await tools;
  const data = fixture(t); prepare(data.root, commit);
  const gh = github(); gh.state.tag = { type: 'commit', sha: 'b'.repeat(40) };
  assert.throws(() => publish(data.output, { repository: 'example/test', commit }, gh.run), /not be overwritten/);
  gh.state.tag = null;
  publish(data.output, { repository: 'example/test', commit }, gh.run);
  gh.state.release.assets[0].digest = 'sha256:' + '0'.repeat(64);
  assert.throws(() => publish(data.output, { repository: 'example/test', commit }, gh.run), /refusing to overwrite/);
  const denied = () => { throw Error('gh: Forbidden (HTTP 403)'); };
  assert.throws(() => publish(data.output, { repository: 'example/test', commit }, denied), /403/);
});
