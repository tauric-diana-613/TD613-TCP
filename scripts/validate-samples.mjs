import fs from 'fs';
import path from 'path';
const files = ['example/canonical-sample.json','example/harbor-ledger.sample.json','example/persona.archivist.json','example/badge-state.sample.json','example/route-event.sample.json'];
for (const f of files) { JSON.parse(fs.readFileSync(path.resolve(f), 'utf8')); console.log(`OK ${f}`); }
