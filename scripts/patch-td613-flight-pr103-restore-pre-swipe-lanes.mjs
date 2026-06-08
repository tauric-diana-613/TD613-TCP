import fs from 'node:fs';
await import('./patch-td613-flight-pr166-mobile-scroll-unlock.mjs');
const p='app/safe-harbor/td613-flight.html';
let s=fs.readFileSync(p,'utf8');
s=s.replace(/td613-pr98-swipe-lock|td613-pr100-lane-tabs|td613-pr101-state-lanes|PR98_SENTINEL[^<\n]*|PR99_SENTINEL[^<\n]*|PR100_SENTINEL[^<\n]*|PR101_SENTINEL[^<\n]*|PR102_SENTINEL[^<\n]*|function prepNoZoom|data-td613-prev-font/g,'');
fs.writeFileSync(p,s);