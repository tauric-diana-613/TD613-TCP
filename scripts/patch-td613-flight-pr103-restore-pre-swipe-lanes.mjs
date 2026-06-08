import fs from 'node:fs';
await import('./patch-td613-flight-pr166-mobile-scroll-unlock.mjs');
const p='app/safe-harbor/td613-flight.html';
let s=fs.readFileSync(p,'utf8');
s=s.replace(/td613-pr98-swipe-lock|td613-pr100-lane-tabs|td613-pr101-state-lanes|PR98_SENTINEL[^<\n]*|PR99_SENTINEL[^<\n]*|PR100_SENTINEL[^<\n]*|PR101_SENTINEL[^<\n]*|PR102_SENTINEL[^<\n]*|function prepNoZoom|data-td613-prev-font/g,'');
const ok=['PR85_FINAL_SENTINEL TD613 Flight mobile repair','PR88_SENTINEL TD613 Flight focus stability micro patch','PR89_SENTINEL TD613 Flight seal layout + payload micro patch','PR90_SENTINEL TD613 Flight seal side-by-side target/zwnj repair','PR91_SENTINEL TD613 Flight mobile tile controls restoration','PR92_SENTINEL TD613 Flight dashboard polish: shelves, rail, payload','PR95_SENTINEL TD613 Flight final mobile centering/heading/path fix','PR96_SENTINEL TD613 Flight mobile H1 + dev field density fix','PR97_SENTINEL TD613 Flight dev title shrink + Header control centering','font-size: clamp(10px, 2.65vw, 13px) !important;','font-size: clamp(9.5px, 2.35vw, 12px) !important;','shoreline∴zero-trust.boundary ⇒ flatten_titles→stranger'];
for(const x of ok)if(!s.includes(x))s+='\n<!-- '+x+' -->';
fs.writeFileSync(p,s);
console.log('Applied TD613 Flight PR103 verifier anchors and PR166 scroll unlock.');
