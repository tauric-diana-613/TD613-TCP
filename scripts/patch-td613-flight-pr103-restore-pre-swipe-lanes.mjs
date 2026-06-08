import fs from 'node:fs';
const F=['app/safe-harbor/td613-flight.html','scripts/patch-td613-flight-mobile-pr85-final.mjs'];
const R=['td613-pr98-swipe-lock','td613-pr100-lane-tabs','td613-pr101-state-lanes','PR98_SENTINEL TD613 Flight symmetric lane swipe lock','PR99_SENTINEL TD613 Flight rollback PR98 swipe lock to native lanes','PR100_SENTINEL TD613 Flight native lane touch repair','PR101_SENTINEL TD613 Flight mobile state lanes no horizontal trap','PR102_SENTINEL TD613 Flight restore visible Output lane after PR101 rollback','function prepNoZoom','data-td613-prev-font'];
for(const f of F){let s=fs.readFileSync(f,'utf8');for(const r of R)s=s.split(r).join('PR103_REMOVED');fs.writeFileSync(f,s)}
console.log('Applied TD613 Flight PR103 cleanup.');
await import('./patch-td613-flight-pr166-mobile-scroll-unlock.mjs');
