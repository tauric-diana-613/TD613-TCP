import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const foundry=readFileSync(new URL('../app/encyclopedia/vixen-estate/observatory-electric-foundry.mjs',import.meta.url),'utf8');
test('Foundry receives only current Vixen source identities and host-certified new renderers',()=>{
 assert.match(foundry,/permittedSourceIds\.has\(id\)/);
 assert.match(foundry,/HELD_UNREGISTERED_CROSS_OPERA_SOURCE/);
 assert.match(foundry,/measureObservatoryOpticalInstrument/);
 assert.match(foundry,/approvedVisualField:\(\)=>state\.composerDeck\.visualField\(\)/);
});
test('Composable visual changes share Foundry-owned clock and preserve canonical renderer',()=>{
 assert.match(foundry,/state\.time-state\.composerLastHostTime>=1\/24/);
 assert.match(foundry,/state\.composerBusy=true/);
 assert.match(foundry,/void state\.composerDeck\.paint/);
 assert.match(foundry,/sourceIds:opticalField\?\.source_ids\|\|\[\],opticalField/);
 assert.doesNotMatch(foundry,/TD613_COMPOSE_OVERRIDE/);
});
test('Restore-original control is visible only when an authorized preview is staged',()=>{
 assert.match(foundry,/Restore original exhibit/);
 assert.match(foundry,/OPERATOR_RESTORE_ORIGINAL/);
 assert.match(foundry,/composerRevert\.hidden=!active/);
 assert.match(foundry,/No canonical change/);
});
