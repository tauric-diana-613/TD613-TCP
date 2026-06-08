import fs from 'node:fs';
const targets=['app/safe-harbor/td613-flight.html','scripts/patch-td613-flight-mobile-pr85-final.mjs'];
const markers=['/* PR98_SENTINEL TD613 Flight symmetric lane swipe lock */','/* PR99_SENTINEL TD613 Flight rollback PR98 swipe lock to native lanes */','/* PR100_SENTINEL TD613 Flight native lane touch repair */','/* PR101_SENTINEL TD613 Flight mobile state lanes no horizontal trap */','/* PR102_SENTINEL TD613 Flight restore visible Output lane after PR101 rollback */'];
const ids=['td613-pr98-swipe-lock','td613-pr100-lane-tabs','td613-pr101-state-lanes'];
function rmCss(s,m){while(s.includes(m)){const a=s.indexOf(m);const b=[s.indexOf('\n/* PR',a+m.length),s.indexOf('\n</style>',a+m.length),s.indexOf('\n`;',a+m.length)].filter(x=>x>a).sort((x,y)=>x-y)[0];if(!b)throw new Error('Could not locate end of '+m);s=s.slice(0,a)+s.slice(b);}return s;}
function rmScript(s,id){const open='<script id="'+id+'">',close='</script>';while(s.includes(open)){const a=s.indexOf(open),b=s.indexOf(close,a);if(b<0)throw new Error('Could not locate runtime end: '+id);s=s.slice(0,a)+s.slice(b+close.length);}return s;}
function restore(s){for(const m of markers)s=rmCss(s,m);for(const id of ids)s=rmScript(s,id);for(const m of markers)if(s.includes(m))throw new Error('Marker still present: '+m);for(const id of ids)if(s.includes(id))throw new Error('Runtime id still present: '+id);return s;}
for(const t of targets)fs.writeFileSync(t,restore(fs.readFileSync(t,'utf8')));
console.log('Applied TD613 Flight PR103: removed PR98-PR102 lane experiments and restored pre-swipe lane behavior.');
await import('./patch-td613-flight-pr166-mobile-scroll-unlock.mjs');
