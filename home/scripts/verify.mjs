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
assert.ok(!home.includes('__MLG_NEWSLETTER_INIT__'), 'Newsletter duplicated in home.js');
assert.equal((newsletter.match(/function initNewsletter\(/g) || []).length, 1);
assert.ok(!home.includes('__ML_NEWSLETTER_INIT__'), 'Legacy newsletter duplicated in home.js');

const page = await read('index.html');
const newsletterHtml = await read('newsletter.html');
const newsletterCss = await read('newsletter.css');
assert.ok(!/\bnl-/.test(newsletterHtml + newsletterCss + newsletter), 'Legacy newsletter namespace remains');
for (const match of newsletterHtml.matchAll(/class="([^"]+)"/g)) {
  for (const name of match[1].split(/\s+/)) {
    assert.ok(newsletterCss.includes(`.${name}`), `Missing newsletter style: ${name}`);
  }
}
assert.ok(page.includes(newsletterHtml.trim()), 'newsletter.html cambio: actualiza el bloque del popup en index.html (y en el embed del footer de Webflow)');
assert.equal((page.match(/EMBED WEBFLOW: HOME — inicio/g) || []).length, 1, 'Falta el comentario que marca el inicio del embed de Webflow en index.html');
assert.equal((page.match(/EMBED WEBFLOW: HOME — fin/g) || []).length, 1, 'Falta el comentario que marca el fin del embed de Webflow en index.html');
for (const id of ['macroled-home', 'aiLaunch', 'aiPanel', 'mlgNewsletterPopup', 'mlgNewsletterForm']) {
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
console.log(`Checks passed: JavaScript syntax, separate newsletter, embed markers, widget IDs and ${checked} local resource paths.`);
