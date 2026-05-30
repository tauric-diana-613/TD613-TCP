import fs from 'node:fs';

const targets = [
  'app/safe-harbor/td613-flight.html',
  'scripts/patch-td613-flight-mobile-pr85-final.mjs'
];

const markers = [
  '/* PR98_SENTINEL TD613 Flight symmetric lane swipe lock */',
  '/* PR99_SENTINEL TD613 Flight rollback PR98 swipe lock to native lanes */',
  '/* PR100_SENTINEL TD613 Flight native lane touch repair */',
  '/* PR101_SENTINEL TD613 Flight mobile state lanes no horizontal trap */',
  '/* PR102_SENTINEL TD613 Flight restore visible Output lane after PR101 rollback */'
];

function removeMarkedCss(text, marker) {
  let out = text;
  while (out.includes(marker)) {
    const start = out.indexOf(marker);
    const candidates = [
      out.indexOf('\n/* PR', start + marker.length),
      out.indexOf('\n</style>', start + marker.length),
      out.indexOf('\n`;', start + marker.length)
    ].filter((pos) => pos > start);
    if (candidates.length === 0) {
      throw new Error(`Could not locate end of marked block: ${marker}`);
    }
    const end = Math.min(...candidates);
    out = out.slice(0, start) + out.slice(end);
  }
  return out;
}

function removeKnownRuntime(text, id) {
  let out = text;
  const open = `<script id="${id}">`;
  const close = '</script>';
  while (out.includes(open)) {
    const start = out.indexOf(open);
    const end = out.indexOf(close, start);
    if (end < 0) throw new Error(`Could not locate runtime end: ${id}`);
    out = out.slice(0, start) + out.slice(end + close.length);
  }
  return out;
}

function restore(text) {
  let out = text;
  for (const marker of markers) out = removeMarkedCss(out, marker);
  out = removeKnownRuntime(out, 'td613-pr98-swipe-lock');
  out = removeKnownRuntime(out, 'td613-pr100-lane-tabs');
  out = removeKnownRuntime(out, 'td613-pr101-state-lanes');
  for (const marker of markers) {
    if (out.includes(marker)) throw new Error(`Marker still present: ${marker}`);
  }
  for (const id of ['td613-pr98-swipe-lock', 'td613-pr100-lane-tabs', 'td613-pr101-state-lanes']) {
    if (out.includes(id)) throw new Error(`Runtime id still present: ${id}`);
  }
  return out;
}

for (const target of targets) {
  fs.writeFileSync(target, restore(fs.readFileSync(target, 'utf8')));
}

console.log('Applied TD613 Flight PR103: removed PR98-PR102 lane experiments and restored pre-swipe lane behavior.');
