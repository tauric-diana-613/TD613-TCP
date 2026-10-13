import fs from 'node:fs';
const path='app/safe-harbor/td613-flight.html';
const marker='/* PR166_SENTINEL TD613 Flight mobile vertical scroll unlock */';
const css=`\n${marker}\n@media (max-width: 820px) {\n  html,\n  body,\n  html[data-flight-shi-cached="true"] body.flight-locked,\n  body.flight-locked {\n    height: auto !important;\n    min-height: 100dvh !important;\n    max-height: none !important;\n    overflow-x: hidden !important;\n    overflow-y: auto !important;\n    overscroll-behavior-y: auto !important;\n  }\n\n  .page-wrap {\n    height: auto !important;\n    min-height: 100dvh !important;\n    max-height: none !important;\n    overflow: visible !important;\n  }\n\n  .grid {\n    display: block !important;\n    height: auto !important;\n    min-height: 0 !important;\n    max-height: none !important;\n    overflow: visible !important;\n    scroll-snap-type: none !important;\n  }\n\n  .grid > div:first-child,\n  .grid > div:last-child {\n    width: 100% !important;\n    min-width: 0 !important;\n    max-width: 100% !important;\n    height: auto !important;\n    min-height: 0 !important;\n    max-height: none !important;\n    overflow: visible !important;\n    scroll-snap-align: none !important;\n  }\n}\n`;
function strip(s){while(s.includes(marker)){const a=s.indexOf(marker),b=s.indexOf('\n</style>',a);if(b<0)throw new Error('PR166 end marker not found');s=s.slice(0,a)+s.slice(b);}return s;}
let html=strip(fs.readFileSync(path,'utf8'));
const close='\n</style>';
if(!html.includes(close))throw new Error('Flight style close not found');
html=html.replace(close,css+close);
fs.writeFileSync(path,html);
console.log('Applied TD613 Flight PR166: mobile vertical scroll unlocked.');
