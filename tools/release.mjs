// Release tooling only: package tested output, verify it, then publish those exact bytes.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJSON = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const sha256 = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const validVersion = value => typeof value === 'string' && /^\d+\.\d+\.\d+$/.test(value);
const validCommit = value => typeof value === 'string' && /^[a-f0-9]{40}$/i.test(value);
const command = (program, args, options = {}) => execFileSync(program, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...options }).trim();
function files(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.isSymbolicLink()) throw Error(`Symlink is not a release file: ${entry.name}`);
    return entry.isDirectory() ? files(path.join(directory, entry.name)).map(name => `${entry.name}/${name}`) : [entry.name];
  }).sort();
}
export function validateVersions(root = project) {
  const version = readJSON(path.join(root, 'manifest.json')).version;
  const pkg = readJSON(path.join(root, 'package.json')), lock = readJSON(path.join(root, 'package-lock.json'));
  if (!validVersion(version) || [pkg.version, lock.version, lock.packages?.['']?.version].some(value => value !== version)) throw Error('manifest.json, package.json and package-lock.json versions must agree');
  return version;
}
export function releaseRequested({ event, ref, version, previousVersion, requested = false }) {
  if (ref !== 'refs/heads/main') return false;
  if (event === 'workflow_dispatch') return requested === true;
  if (event !== 'push' || !previousVersion || previousVersion === version) return false;
  const a = version.split('.').map(Number), b = previousVersion.split('.').map(Number);
  const difference = a.map((value, index) => value - (b[index] || 0)).find(value => value !== 0);
  if (!(difference > 0)) throw Error('Automatic releases require an increased version');
  return true;
}
export function releaseNotes(changelog, version) {
  const section = changelog.split(/^##\s+/m).slice(1).find(part => part.split(/\r?\n/, 1)[0].trim() === `v${version}`);
  const notes = section?.replace(/^[^\n]*\n/, '').trim();
  if (!notes) throw Error(`Missing release notes for v${version}`);
  return notes + '\n';
}
function zipDirectory(source, destination) {
  if (process.platform !== 'win32') { command('zip', ['-qr', destination, '.'], { cwd: source }); return; }
  // Paths travel via environment variables, never PowerShell string interpolation.
  const script = String.raw`$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem
$source = $env:STARTPAGE_ZIP_SOURCE
$archive = [IO.Compression.ZipFile]::Open($env:STARTPAGE_ZIP_DESTINATION, [IO.Compression.ZipArchiveMode]::Create)
try {
  Get-ChildItem -LiteralPath $source -Recurse -File -Force | ForEach-Object {
    $name = $_.FullName.Substring($source.Length + 1).Replace('\', '/')
    [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $_.FullName, $name, [IO.Compression.CompressionLevel]::Optimal) | Out-Null
  }
} finally { $archive.Dispose() }`;
  command('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], { env: { ...process.env, STARTPAGE_ZIP_SOURCE: source, STARTPAGE_ZIP_DESTINATION: destination } });
}
export function prepare(root, commit) {
  if (!validCommit(commit)) throw Error('A source commit is required');
  const version = validateVersions(root), extension = path.join(root, 'dist', 'extension');
  const manifest = readJSON(path.join(extension, 'manifest.json'));
  if (manifest.version !== version) throw Error('Built extension version does not match source; run tests/build first');
  const index = fs.readFileSync(path.join(extension, 'index.html'), 'utf8');
  for (const file of [path.join(root, 'StartPage.html'), path.join(extension, 'index.html')]) {
    if (!fs.readFileSync(file, 'utf8').includes(`name="application-version" content="${version}"`)) throw Error(`Missing built version in ${file}`);
  }
  const runtime = files(extension);
  if (runtime.some(name => /(^|\/)(node_modules|tests|tools|docs|\.git|test-results)(\/|$)|\.md$/i.test(name))) throw Error('Development files found in extension output');
  for (const name of [...Object.values(manifest.icons || {}), ...[...index.matchAll(/<script src="([^"]+)"/g)].map(match => match[1])]) {
    if (!runtime.includes(name)) throw Error(`Missing runtime file: ${name}`);
  }
  const notes = releaseNotes(fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8'), version);
  const output = path.join(root, 'dist', 'release');
  fs.rmSync(output, { recursive: true, force: true }); fs.mkdirSync(output, { recursive: true });
  fs.copyFileSync(path.join(root, 'StartPage.html'), path.join(output, 'StartPage.html'));
  const zip = `StartPage-v${version}.zip`;
  zipDirectory(extension, path.join(output, zip));
  fs.writeFileSync(path.join(output, 'notes.md'), notes);
  const metadata = { schemaVersion: 1, version, commit, notesSha256: sha256(path.join(output, 'notes.md')),
    assets: ['StartPage.html', zip].map(name => ({ name, size: fs.statSync(path.join(output, name)).size, sha256: sha256(path.join(output, name)) })) };
  fs.writeFileSync(path.join(output, 'release.json'), JSON.stringify(metadata, null, 2) + '\n');
  verify(output, commit);
  return metadata;
}
export function verify(directory, expectedCommit) {
  const metadata = readJSON(path.join(directory, 'release.json'));
  if (metadata.schemaVersion !== 1 || !validVersion(metadata.version) || !validCommit(metadata.commit)) throw Error('Invalid release metadata');
  if (expectedCommit && metadata.commit !== expectedCommit) throw Error('Artifact belongs to a different commit');
  const names = ['StartPage.html', `StartPage-v${metadata.version}.zip`];
  if (!Array.isArray(metadata.assets) || metadata.assets.length !== 2 || names.some(name => metadata.assets.filter(asset => asset.name === name).length !== 1)) throw Error('Unexpected release asset list');
  for (const asset of metadata.assets) {
    const file = path.join(directory, asset.name);
    if (fs.statSync(file).size !== asset.size || sha256(file) !== asset.sha256) throw Error(`Asset checksum mismatch: ${asset.name}`);
  }
  if (sha256(path.join(directory, 'notes.md')) !== metadata.notesSha256) throw Error('Release notes checksum mismatch');
  return metadata;
}
export function publish(directory, { repository, commit }, gh = args => command('gh', args)) {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository || '') || !validCommit(commit)) throw Error('Repository and verified commit are required');
  const metadata = verify(directory, commit), tag = `v${metadata.version}`;
  const maybe = args => {
    try { return JSON.parse(gh(args)); }
    catch (error) {
      if (/release not found|\(HTTP 404\)/i.test(String(error.stderr || error.message))) return null;
      throw error;
    }
  };
  const readRelease = () => maybe(['release', 'view', tag, '--repo', repository, '--json', 'isDraft,targetCommitish,assets,url']);
  const api = `repos/${repository}`;
  const readTag = () => {
    let object = maybe(['api', `${api}/git/ref/tags/${tag}`])?.object;
    for (let depth = 0; object?.type === 'tag' && depth < 5; depth++) object = JSON.parse(gh(['api', `${api}/git/tags/${object.sha}`])).object;
    return object;
  };
  const object = readTag();
  if (object && (object.type !== 'commit' || object.sha !== commit)) throw Error('Existing tag points to a different commit; it will not be overwritten');
  let release = readRelease();
  if (release && !object && (!release.isDraft || release.targetCommitish !== commit)) throw Error('Existing release does not identify the verified commit');
  if (!release) {
    gh(['release', 'create', tag, '--repo', repository, '--target', commit, '--title', tag, '--notes-file', path.join(directory, 'notes.md'), '--draft']);
    release = readRelease();
    if (!release) throw Error('Cannot find the newly created draft');
  }
  const matches = (actual, expected) => actual?.state === 'uploaded' && actual.size === expected.size && actual.digest === `sha256:${expected.sha256}`;
  for (const asset of metadata.assets) {
    const existing = release.assets.find(item => item.name === asset.name);
    if (matches(existing, asset)) continue;
    if (existing && !release.isDraft) throw Error(`Published asset differs: ${asset.name}; refusing to overwrite it`);
    gh(['release', 'upload', tag, path.join(directory, asset.name), '--repo', repository, ...(release.isDraft ? ['--clobber'] : [])]);
  }
  release = readRelease();
  if (!metadata.assets.every(asset => matches(release?.assets.find(item => item.name === asset.name), asset))) throw Error('Uploaded release assets failed verification');
  if (release.isDraft) gh(['release', 'edit', tag, '--repo', repository, '--draft=false', '--notes-file', path.join(directory, 'notes.md')]);
  release = readRelease();
  if (!release || release.isDraft) throw Error('Release is still a draft');
  const publishedTag = readTag();
  if (publishedTag?.type !== 'commit' || publishedTag.sha !== commit) throw Error('Published tag does not match the verified commit');
  return release.url;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const action = process.argv[2], directory = path.resolve(process.argv[3] || path.join(project, 'dist', 'release'));
    if (action === 'plan') {
      const version = validateVersions();
      const event = process.env.GITHUB_EVENT_PATH ? readJSON(process.env.GITHUB_EVENT_PATH) : {};
      let previousVersion;
      if (process.env.GITHUB_EVENT_NAME === 'push' && process.env.GITHUB_REF === 'refs/heads/main' && validCommit(event.before) && !/^0+$/.test(event.before)) {
        previousVersion = JSON.parse(command('git', ['show', `${event.before}:manifest.json`], { cwd: project })).version;
      }
      const publish = releaseRequested({ event: process.env.GITHUB_EVENT_NAME, ref: process.env.GITHUB_REF, version, previousVersion, requested: process.env.RELEASE_REQUESTED === 'true' });
      const output = `version=${version}\npublish=${publish}\n`;
      if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, output);
      process.stdout.write(output);
    } else if (action === 'prepare') {
      const commit = command('git', ['rev-parse', 'HEAD'], { cwd: project });
      if (process.env.GITHUB_SHA && process.env.GITHUB_SHA !== commit) throw Error('Checkout does not match the workflow commit');
      if (command('git', ['status', '--porcelain'], { cwd: project })) throw Error('Commit source changes before preparing release artifacts');
      console.log(JSON.stringify(prepare(project, commit), null, 2));
    } else if (action === 'verify') {
      console.log(JSON.stringify(verify(directory, process.env.GITHUB_SHA), null, 2));
    } else if (action === 'publish') {
      if (process.env.GITHUB_ACTIONS !== 'true' || process.env.GITHUB_REF !== 'refs/heads/main') throw Error('Publishing is only allowed from the verified main-branch workflow');
      console.log(publish(directory, { repository: process.env.GITHUB_REPOSITORY, commit: process.env.GITHUB_SHA }));
    } else throw Error('Usage: node tools/release.mjs plan|prepare|verify|publish [artifact-directory]');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
