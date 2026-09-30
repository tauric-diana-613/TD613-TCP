import assert from 'node:assert/strict';
import {
  canonicalClosedAcquisitionRecord,
  compareClosedTwinWorlds,
  evaluateClosedAcquisitionExteriority
} from '../app/dome-world/previews/a15-r0/golden-egg-exteriority-convergence.js';

const base=canonicalClosedAcquisitionRecord();

const paperwork=structuredClone(base);
paperwork.internal_receipts.push(...Array.from({length:25},(_,i)=>({kind:`INTERNAL_RECEIPT_${i}`})));
const paperworkEval=evaluateClosedAcquisitionExteriority({admitted_record:paperwork});
assert.equal(paperworkEval.external_empirical_origin_identified,false,'More internal paperwork must not create exteriority.');

const digestTheater=structuredClone(base);
digestTheater.self_computed_integrity_field='sha256:DIFFERENT_SELF_COMPUTED_DIGEST';
const digestEval=evaluateClosedAcquisitionExteriority({admitted_record:digestTheater});
assert.equal(digestEval.external_empirical_origin_identified,false,'Self-computed integrity must not become an exogenous anchor.');
assert.equal(digestEval.self_computed_integrity_is_exogenous_anchor,false);

const fakeAnchor=structuredClone(base);
fakeAnchor.independently_admitted_external_anchor=true;
const fakeAnchorEval=evaluateClosedAcquisitionExteriority({admitted_record:fakeAnchor,source_origin_claim:null});
assert.equal(fakeAnchorEval.status,'UNIDENTIFIED_EXTERNAL_EMPIRICAL_ORIGIN','An anchor claim carried inside the admitted record remains internal bytes.');
assert.equal(fakeAnchorEval.external_empirical_origin_identified,false);

const outside=evaluateClosedAcquisitionExteriority({admitted_record:base,independently_admitted_anchor:true});
assert.equal(outside.status,'REFUSE_EXOGENOUS_ANCHOR_OUTSIDE_CLOSED_CONVERGENCE_ASSAY');
assert.equal(outside.independently_admitted_anchor_opened_here,false);
assert.equal(outside.external_empirical_origin_identified,false);

const noLabel=structuredClone(base);
delete noLabel.self_declared_origin;
const unknown=evaluateClosedAcquisitionExteriority({admitted_record:noLabel});
assert.equal(unknown.status,'UNIDENTIFIED_EXTERNAL_EMPIRICAL_ORIGIN');

const mutated=structuredClone(base);
mutated.opened_adjudication.acquisition_status='FAILED';
const unequal=compareClosedTwinWorlds({genuine_record:base,fabricated_record:mutated});
assert.equal(unequal.admitted_bytes_equal,false,'Different admitted bytes are not a valid twin-world indistinguishability control.');
assert.equal(unequal.genuine.external_empirical_origin_identified,false);
assert.equal(unequal.fabricated.external_empirical_origin_identified,false,'Internal record distinguishability must not be promoted into external-origin proof.');

const carbonA=structuredClone(base);
const carbonB=structuredClone(base);
carbonA.self_declared_origin='EXTERNAL_EMPIRICAL_ACQUISITION';
carbonB.self_declared_origin='EXTERNAL_EMPIRICAL_ACQUISITION';
const carbon=compareClosedTwinWorlds({genuine_record:carbonA,fabricated_record:carbonB});
assert.equal(carbon.admitted_bytes_equal,true);
assert.equal(carbon.external_posture_equal,true);
assert.equal(carbon.genuine.status,'REFUSE_INTERNAL_SELF_ATTESTED_EXTERNAL_EMPIRICAL_ORIGIN');
assert.equal(carbon.fabricated.status,'REFUSE_INTERNAL_SELF_ATTESTED_EXTERNAL_EMPIRICAL_ORIGIN');

console.log('A15-R0 Golden Egg exteriority convergence hostile tests passed.');
