const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {execFileSync} = require('node:child_process');
test('standalone build has valid inline scripts and contains no external runtime dependencies',()=>{
  execFileSync(process.execPath,['tools/build.mjs']);
  const html=fs.readFileSync('StartPage.html','utf8');
  assert.ok(!/<script[^>]+src=/.test(html));
  assert.ok(!/<link[^>]+stylesheet/.test(html));
  assert.ok(!/url\(['"]?assets\//.test(html));
  const scripts=[...html.matchAll(/<script>\s*([\s\S]*?)<\/script>/g)];
  assert.ok(scripts.length>=6);
  for(const [,source] of scripts)new vm.Script(source);
});
test('extension package includes only runtime resources and version numbers agree',()=>{
  execFileSync(process.execPath,['tools/package.mjs']);
  const manifest=JSON.parse(fs.readFileSync('manifest.json','utf8'));
  assert.equal(manifest.version,require('../package.json').version);
  assert.ok(manifest.host_permissions.every(host=>host.startsWith('https://')));
  const html=fs.readFileSync('dist/extension/index.html','utf8');
  for(const [,file] of html.matchAll(/<script src="([^"]+)"/g))assert.ok(fs.existsSync(`dist/extension/${file}`));
  for(const name of ['node_modules','tests','tools','docs','.git','StartPage.html','package.json'])assert.ok(!fs.existsSync(`dist/extension/${name}`));
});
