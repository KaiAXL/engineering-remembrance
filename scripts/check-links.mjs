import fs from 'node:fs';
import path from 'node:path';

function walk(d) {
  return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(d, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

const all = walk('dist');
const norm = (f) => '/' + path.relative('dist', f).split(path.sep).join('/');
const exists = new Set(all.map(norm));
const pages = all.filter((f) => f.endsWith('.html'));

const broken = new Set();
for (const f of pages) {
  const html = fs.readFileSync(f, 'utf8');
  for (const m of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
    // Strip fragment/query so anchored and query-bearing links are still validated
    // against their target file (previously they were skipped entirely).
    let l = m[1].split('#')[0].split('?')[0];
    if (l === '' || l.startsWith('//')) continue;
    if (l.endsWith('/')) l += 'index.html';
    // No extensionless skip: under build.format:'file' an extensionless internal
    // link 404s on Pages, so a missing target is reported rather than ignored.
    if (!exists.has(l)) broken.add(`${path.relative('dist', f)}  ->  ${m[1]}`);
  }
}

console.log(`pages: ${pages.length}`);
console.log(broken.size ? 'BROKEN LINKS:\n' + [...broken].join('\n') : 'All internal links resolve ✓');
process.exit(broken.size ? 1 : 0);
