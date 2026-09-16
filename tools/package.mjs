import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist', 'extension');
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const runtime = [...html.matchAll(/<script src="([^"]+)"/g)].map(match => match[1]);
for (const file of ['manifest.json', 'index.html', 'style.css', 'Sortable.min.js', ...runtime]) {
  fs.copyFileSync(path.join(root, file), path.join(output, file));
}
for (const dir of ['icons', 'assets/fonts', 'assets/engine-icons']) {
  fs.cpSync(path.join(root, dir), path.join(output, dir), { recursive: true, filter: source => !source.endsWith('.md') });
}
console.log('Packaged runtime files in dist/extension');
