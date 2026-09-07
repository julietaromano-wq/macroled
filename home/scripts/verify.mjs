import { readFile, access } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { Script } from 'node:vm';
import assert from 'node:assert/strict';

const root = resolve(import.meta.dirname, '..');
const read = name => readFile(resolve(root, name), 'utf8');
const home = await read('home.js');
const newsletter = await read('newsletter.js');
new Script(home, { filename: 'home.js' });
new Script(newsletter, { filename: 'newsletter.js' });
assert.ok(!home.includes('__ML_NEWSLETTER_INIT__'), 'Newsletter duplicated in home.js');
assert.equal((newsletter.match(/function initNewsletter\(/g) || []).length, 1);

const page = await read('index.html');
const embed = await read('webflow-embed.html');
const newsletterHtml = await read('newsletter.html');
assert.ok(page.includes(embed.trim()), 'Run npm run build to update the preview');
assert.ok(page.includes(newsletterHtml.trim()), 'Run npm run build to update the preview');
assert.ok(!embed.includes('id="nlPopup"'), 'Newsletter popup duplicated in webflow-embed.html; keep it only in newsletter.html');
for (const id of ['macroled-home', 'aiLaunch', 'aiPanel', 'nlPopup', 'nlForm']) {
  assert.equal((page.match(new RegExp(`id="${id}"`, 'g')) || []).length, 1, `Duplicate or missing ${id}`);
}
for (const file of ['home.js', 'newsletter.js']) {
  assert.equal((page.match(new RegExp(`<script src="${file.replace('.', '\\.')}"`, 'g')) || []).length, 1);
}

let checked = 0;
async function checkPath(file, value) {
  if (/^(?:https?:|data:|#|\/\/)/.test(value)) return;
  await access(resolve(dirname(resolve(root, file)), value.split(/[?#]/)[0]));
  checked++;
}
for (const match of page.matchAll(/(?:src|href)="([^"]+)"/g)) {
  if (/\.(?:js|css)(?:[?#]|$)/.test(match[1])) await checkPath('index.html', match[1]);
}
for (const file of ['home.css', 'newsletter.css']) {
  const css = await read(file);
  for (const match of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) await checkPath(file, match[1]);
}
console.log(`Checks passed: JavaScript syntax, separate newsletter, preview, widget IDs and ${checked} local resource paths.`);
