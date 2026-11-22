import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildLivingMesh,normalizeComposerVisualField,MESH_CONTRACT,meshScrollCoherencePolicy}
 from '../app/encyclopedia/vixen-estate/vixen-live-mesh-rgi13.mjs';
const field={schema:'td613.vixen.observatory.visual-field/v1',
 status:'SUPPORTED_PREVIEW_ONLY',form_id:'UNPRECEDENTED_GEOMETRY',
 score_digest:'f'.repeat(64),source_ids:['emwork_1','emwork_2'],
 mesh_strength:.82,fold_strength:.21,canonical_mutation:false,release_authority:false};
test('unverified or unbounded Score-like data never enters the mesh',()=>{
 assert.equal(normalizeComposerVisualField({...field,release_authority:true}),null);
 assert.equal(normalizeComposerVisualField({...field,mesh_strength:2}),null);
 assert.equal(normalizeComposerVisualField({...field,source_ids:['A','B','C']}),null);
 assert.equal(normalizeComposerVisualField({...field,score_digest:'forged'}),null);
 assert.equal(normalizeComposerVisualField(field).release_authority,false);
});
test('mobile Salon parks fixed viewport cloth while local folded-cuirass keeps its own clock',()=>{
 assert.equal(meshScrollCoherencePolicy({view:'collection',viewportWidth:390}),'LOCAL_STAGE_ONLY');
 assert.equal(meshScrollCoherencePolicy({view:'collection',viewportWidth:740}),'LOCAL_STAGE_ONLY');
 assert.equal(meshScrollCoherencePolicy({view:'collection',viewportWidth:741}),'SHARED_VIEWPORT_FIELD');
 assert.equal(meshScrollCoherencePolicy({view:'works',viewportWidth:390}),'SHARED_VIEWPORT_FIELD');
 const css=readFileSync(new URL('../app/encyclopedia/vixen-estate/vixen-electrical-breath-rgi13.css',import.meta.url),'utf8');
 assert.match(css,/body\[data-view="collection"\] #vixenLivingMesh\.vixen-living-mesh\{display:none!important;\}/);
});
test('source-bound approved visual form changes 39-carrier geometry across full viewport',()=>{
 const base=buildLivingMesh({width:360,height:300,time:.35,view:'overview',sourceIds:field.source_ids});
 const staged=buildLivingMesh({width:360,height:300,time:.35,view:'overview',
  sourceIds:field.source_ids,opticalField:field});
 assert.equal(staged.fibers.length,39);
 assert.equal(staged.visual_form_id,field.form_id);
 assert.equal(staged.preview_score_digest,field.score_digest);
 assert.notDeepEqual(base.scene.trails[0].points,staged.scene.trails[0].points);
 assert.equal(staged.empirical_credit,0);
 assert.equal(MESH_CONTRACT.source_mutation,false);
});
test('synthesis field is visual-only and host-frame supplied',()=>{
 const s=readFileSync(new URL('../app/encyclopedia/vixen-estate/vixen-live-mesh-rgi13.mjs',import.meta.url),'utf8');
 assert.match(s,/renderHostFrame:\(\{time:phase=0/);
 assert.match(s,/opticalField:normalizeComposerVisualField\(opticalField\)/);
 assert.match(s,/VIXEN_ELECTRIC_FOUNDRY\?\.approvedVisualField/);
});
