import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../app/encyclopedia/reference/vixen-podium.mjs',import.meta.url),'utf8');
test('Podium has digest-bound review export/chat/return separate from independent Compose',()=>{
 assert.match(source,/'podium\.score','podium\.redpen','podium\.compose'/);
 assert.match(source,/if\(intent==='podium\.redpen'\)/);
 assert.match(source,/buildRedpenPacket\(latestScore\)/);
 assert.match(source,/adjudicateRedpenReturn\(latestRedpenPacket,params\.submission\)/);
 assert.match(source,/human_authentication_completed:false/);
 assert.match(source,/composeGate\.invalidate\('REDPEN_REVISION_OR_REJECTION_REQUIRES_NEW_SCORE'\)/);
});
test('new Score wipes review and no redpen return grants authentication',()=>{
 assert.match(source,/latestRedpenPacket=null;latestRedpenReturn=null/);
 const section=source.split("if(intent==='podium.redpen'){")[1].split("if(intent==='podium.compose'){")[0];
 assert.doesNotMatch(section,/acceptHumanApproval\(/);
 assert.doesNotMatch(section,/release_authority:true/);
});

test('exact-head Vixen preview packaging includes the new redpen route',()=>{
 const p=readFileSync(new URL('../scripts/package-vixen-preview.py',import.meta.url),'utf8');
 assert.match(p,/compose_routes = \{"podium.score", "podium.redpen", "podium.compose"\}/);
});
