import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const dataUrl = name => {
  const type = { '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.svg': 'image/svg+xml' }[path.extname(name)];
  return `data:${type};base64,${fs.readFileSync(path.join(root, name)).toString('base64')}`;
};
const script = source => `<script>\n${source.replace(/<\/script/gi, '<\\/script')}\n</script>`;
let html = read('index.html');
const deferred = [];
html = html.replace(/<script src="([^"\s]+)"( defer)?><\/script>/g, (_, name, defer) => {
  let code = read(name);
  code = code.replace(/'((?:assets\/engine-icons\/)[^']+)'/g, (match, asset) => JSON.stringify(dataUrl(asset)));
  if (defer) { deferred.push(script(code)); return ''; }
  return script(code);
});
const css = read('style.css').replace(/url\('([^']+\.woff2)'\)/g, (_, asset) => `url('${dataUrl(asset)}')`);
html = html.replace('<link rel="stylesheet" href="style.css">', () => `<style>\n${css}\n</style>`);
html = html.replace('</body>', () => `${script(read('Sortable.min.js'))}\n${deferred.join('\n')}\n</body>`);
const output = path.join(root, 'StartPage.html');
fs.writeFileSync(`${output}.tmp`, html);
fs.renameSync(`${output}.tmp`, output);
console.log(`Built StartPage.html (${Buffer.byteLength(html)} bytes)`);
