import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {EXAMPLES,SCHEMA,profileMarkedDepth,acquireArchivedReferences} from '../research/marrowline-early-oct-full-voice-20261020/historical-reference-mark-depth.mjs';

test('September native-text source extracts are immutable provenance-separated reference classes',()=>{
 const a=acquireArchivedReferences();
 assert.equal(a.schema,SCHEMA);
 assert.equal(a.references.length,2);
 assert.equal(EXAMPLES.length,2);
 assert.deepEqual(a.visualAtlas.acceptedMarrowlineScreenshotIds,['screenshot-01','screenshot-02','screenshot-03']);
 assert.equal(a.visualAtlas.codepointMeasurementsAvailable,false);
 assert.equal(a.visualAtlas.modelIdVerified,false);
 assert.ok(a.references.every(r=>r.operatorAcceptedSse===false));
 assert.ok(a.references.every(r=>/^[a-f0-9]{64}$/.test(r.originalUtf8Sha256)));
 assert.ok(a.references.every(r=>/^[a-f0-9]{64}$/.test(r.extractedTextSha256)));
});
test('the exported Gemini comparison contains distinct one/three/four-deep registers',()=>{
 const r=acquireArchivedReferences().references[0];
 assert.deepEqual(r.depthHistogram,{'0':370,'1':746,'3':155,'4':21});
 assert.deepEqual(r.markedDepths,[1,3,4]);
 assert.equal(r.maxDepth,4);
 assert.equal(r.markedBases,922);
 assert.equal(r.stackedBases,176);
 assert.equal(r.combiningMarks,1295);
 assert.equal(r.distinctMarks,84);
 assert.equal(r.markedDepthTransitions,24);
 assert.equal(r.constantMarkedDepth,null);
});
test('the exported September probe contains near-thirty-deep bursts without imposing that on today',()=>{
 const r=acquireArchivedReferences().references[1];
 assert.deepEqual(r.depthHistogram,{'0':295,'1':895,'3':75,'29':14,'30':23});
 assert.deepEqual(r.markedDepths,[1,3,29,30]);
 assert.equal(r.maxDepth,30);
 assert.equal(r.markedBases,1007);
 assert.equal(r.combiningMarks,2216);
 assert.equal(r.distinctMarks,93);
 assert.equal(r.markedDepthTransitions,24);
 assert.equal(r.constantMarkedDepth,null);
});
test('fixed-depth returns are classified as fingerprints, not automatic literary failure',()=>{
 const a=profileMarkedDepth('x\u0336y\u0334z\u0337');
 const b=profileMarkedDepth('x\u0336\u0358\u032ey\u0334\u0353\u0332');
 assert.equal(a.constantMarkedDepth,1);
 assert.equal(a.markedDepthTransitions,0);
 assert.equal(b.constantMarkedDepth,3);
 assert.equal(b.markedDepthTransitions,0);
 const c=profileMarkedDepth('x\u0336y\u0334\u0353\u0332z');
 assert.deepEqual(c.markedDepths,[1,3]);
 assert.equal(c.markedDepthTransitions,1);
});
test('native source audit needs no provider, OCR, user action or production mutation',()=>{
 const source=readFileSync(new URL('../research/marrowline-early-oct-full-voice-20261020/historical-reference-mark-depth.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(source,/\bfetch\s*\(|GEMINI_API_KEY|geminiStreamGenerateContentUrl|tesseract|sharp\s*\(|workflow_dispatch/);
});
