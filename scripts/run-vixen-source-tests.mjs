#!/usr/bin/env node
import {readdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const files=readdirSync('tests').filter(f=>/^(vixen-|encyclopedia-).*\.test\.mjs$/.test(f)&&!f.endsWith('-browser.test.mjs')).sort().map(f=>'tests/'+f);
const run=(args)=>{const r=spawnSync(process.execPath,args,{stdio:'inherit'});if(r.error)throw r.error;if(r.status!==0)process.exit(r.status||1);};
run(['--test',...files]);
run(['scripts/run-pedagogue-design-gate.mjs','tests/fixtures/pedagogue/vixen-frontispiece-route-design.json']);
run(['scripts/verify-vixen-podium-dollhouse.mjs']);
