import { GOLDEN_EGG_OPERATIONAL_SURFACES } from './golden-egg-evidence-closure-nogo.js';
import { canonicalPreregisteredLoomRoutePair } from './loom-route-pair-preregistration.js';
import {
  canonicalCustodyEpisode,
  sealMeasurementCustodyLedger,
  verifyMeasurementCustodyLedger,
  adjudicateSealedMeasurementCustody
} from './measurement-custody-ledger.js';

export const BLINDED_ADJUDICATION_LATCH_SCHEMA='td613.dome-world.blinded-acquisition-adjudication-latch/v0.1';
export const BLINDED_ADJUDICATION_LATCH_PARENT='78443279853b95ab0bf54eed1decd1b5eeadf78c';
const NONCE=/^[0-9a-f]{64}$/;
const ISO_Z=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const validTime=v=>typeof v==='string'&&ISO_Z.test(v)&&Number.isFinite(Date.parse(v));
const unique=a=>[...new Set(a)];
function canonicalize(value){
  if(Array.isArray(value))return value.map(canonicalize);
  if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().filter(k=>value[k]!==undefined).map(k=>[k,canonicalize(value[k])]));
  return value;
}
function canonicalJson(value){return JSON.stringify(canonicalize(value));}
async function sha256(value){
  const bytes=new TextEncoder().encode(typeof value==='string'?value:canonicalJson(value));
  const digest=await globalThis.crypto.subtle.digest('SHA-256',bytes);
  return `sha256:${[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('')}`;
}

function commitmentPayload(ledger,nonce,committed_at){
  return canonicalize({
    schema:BLINDED_ADJUDICATION_LATCH_SCHEMA,
    exact_parent:BLINDED_ADJUDICATION_LATCH_PARENT,
    ledger_root:ledger?.ledger_root||null,
    ledger_sealed_at:ledger?.sealed_at||null,
    entry_count:ledger?.entry_count??null,
    nonce,
    committed_at
  });
}

function completeSurfaceSet(ledger){
  const names=new Set((ledger?.entries||[]).map(e=>e?.name));
  return ledger?.entry_count===GOLDEN_EGG_OPERATIONAL_SURFACES.length&&GOLDEN_EGG_OPERATIONAL_SURFACES.every(name=>names.has(name));
}

function heldOpening(errors=[]){
  return freeze({
    schema:BLINDED_ADJUDICATION_LATCH_SCHEMA,
    exact_parent:BLINDED_ADJUDICATION_LATCH_PARENT,
    status:'HELD',
    errors:unique(errors),
    outcome_revealed:false,
    acquisition_status:null,
    parent_acquisition_status:null,
    thresholds_pass:null,
    adjudication_invoked:false,
    empirical_credit_from_latch:0,
    golden_egg_earned:false,
    live_loom_mutated:false,
    merge_authority:false,
    production_authority:false
  });
}

export async function commitBlindedAdjudication(ledger,{nonce,committed_at}={}){
  const errors=[];
  if(ledger?.status!=='SEALED')errors.push('SEALED_MEASUREMENT_LEDGER_REQUIRED');
  if(!NONCE.test(String(nonce||'')))errors.push('PRIVATE_256_BIT_HEX_NONCE_REQUIRED');
  if(!validTime(committed_at))errors.push('VALID_COMMIT_TIME_REQUIRED');
  if(validTime(ledger?.sealed_at)&&validTime(committed_at)&&Date.parse(committed_at)<=Date.parse(ledger.sealed_at))errors.push('COMMIT_MUST_FOLLOW_LEDGER_SEAL');
  const payload=commitmentPayload(ledger,nonce,committed_at);
  const commitment=await sha256(payload);
  const complete=completeSurfaceSet(ledger);
  const public_receipt=freeze({
    schema:BLINDED_ADJUDICATION_LATCH_SCHEMA,
    exact_parent:BLINDED_ADJUDICATION_LATCH_PARENT,
    status:errors.length?'INADMISSIBLE':'COMMITTED',
    errors:unique(errors),
    phase:complete?'SEALED_COMPLETE':'COLLECTING',
    entry_count:ledger?.entry_count??0,
    commitment,
    outcome_blinded:true,
    empirical_credit:0,
    golden_egg_earned:false,
    live_loom_mutated:false,
    merge_authority:false,
    production_authority:false
  });
  const private_opening=freeze({
    schema:BLINDED_ADJUDICATION_LATCH_SCHEMA,
    commitment,
    nonce:NONCE.test(String(nonce||''))?nonce:null,
    ledger_root:ledger?.ledger_root||null,
    ledger_sealed_at:ledger?.sealed_at||null,
    entry_count:ledger?.entry_count??0,
    committed_at:validTime(committed_at)?committed_at:null
  });
  return freeze({public_receipt,private_opening});
}

export function auditBlindedPublicReceipt(public_receipt){
  const serialized=JSON.stringify(public_receipt||{});
  const forbidden=['ledger_root','nonce','source_id','measurement_id','measured_at','recorded_at','thresholds_pass','parent_acquisition_status','envelope','digest','"value"'];
  const leaked=forbidden.filter(token=>serialized.includes(token));
  return freeze({
    schema:BLINDED_ADJUDICATION_LATCH_SCHEMA,
    status:leaked.length?'LEAK':'BLINDED',
    leaked,
    outcome_blinded:leaked.length===0
  });
}

export async function openBlindedAdjudication(prereg,ledger,private_opening,{opened_at,episode}={}){
  const errors=[];
  if(!private_opening||!NONCE.test(String(private_opening.nonce||'')))errors.push('VALID_PRIVATE_OPENING_REQUIRED');
  if(!validTime(opened_at))errors.push('VALID_OPEN_TIME_REQUIRED');
  if(validTime(private_opening?.committed_at)&&validTime(opened_at)&&Date.parse(opened_at)<=Date.parse(private_opening.committed_at))errors.push('OPEN_MUST_FOLLOW_COMMIT');
  const expectedCommitment=await sha256(commitmentPayload(ledger,private_opening?.nonce,private_opening?.committed_at));
  if(private_opening?.commitment!==expectedCommitment)errors.push('COMMITMENT_OPENING_MISMATCH');
  if(private_opening?.ledger_root!==ledger?.ledger_root)errors.push('PRIVATE_OPENING_LEDGER_ROOT_MISMATCH');
  if(!completeSurfaceSet(ledger))return heldOpening([...errors,'ALL_FIVE_SURFACES_REQUIRED_BEFORE_OPENING']);
  if(errors.length)return freeze({
    ...heldOpening(errors),
    status:'INADMISSIBLE'
  });
  if(!episode)return freeze({
    ...heldOpening(['EPISODE_REQUIRED_FOR_CUSTODY_VERIFICATION']),
    status:'INADMISSIBLE'
  });
  const verification=await verifyMeasurementCustodyLedger(prereg,ledger,episode);
  if(verification.status!=='VERIFIED')return freeze({
    ...heldOpening(['SEALED_LEDGER_VERIFICATION_REQUIRED',...verification.errors]),
    status:'INADMISSIBLE'
  });
  const adjudication=await adjudicateSealedMeasurementCustody(prereg,ledger,episode);
  return freeze({
    schema:BLINDED_ADJUDICATION_LATCH_SCHEMA,
    exact_parent:BLINDED_ADJUDICATION_LATCH_PARENT,
    status:'OPENED',
    errors:[],
    outcome_revealed:true,
    adjudication_invoked:true,
    acquisition_status:adjudication.status,
    parent_acquisition_status:adjudication.parent_acquisition_status,
    ledger_root:ledger.ledger_root,
    nonce:private_opening.nonce,
    commitment:private_opening.commitment,
    opened_at,
    empirical_credit_from_latch:0,
    golden_egg_earned:false,
    live_loom_mutated:false,
    merge_authority:false,
    production_authority:false
  });
}

export async function runBlindedAdjudicationLatch(){
  const prereg=canonicalPreregisteredLoomRoutePair();
  const partialEpisode=canonicalCustodyEpisode({surfaces:['observer','reconstruction','joining']});
  const partialLedger=await sealMeasurementCustodyLedger(prereg,partialEpisode,'2026-09-02T00:02:10Z');
  const partialCommit=await commitBlindedAdjudication(partialLedger,{nonce:'0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',committed_at:'2026-09-02T00:02:11Z'});
  const partialAudit=auditBlindedPublicReceipt(partialCommit.public_receipt);
  const partialOpen=await openBlindedAdjudication(prereg,partialLedger,partialCommit.private_opening,{opened_at:'2026-09-02T00:02:12Z',episode:partialEpisode});
  const completeEpisode=canonicalCustodyEpisode();
  const completeLedger=await sealMeasurementCustodyLedger(prereg,completeEpisode,'2026-09-02T00:03:10Z');
  const completeCommit=await commitBlindedAdjudication(completeLedger,{nonce:'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',committed_at:'2026-09-02T00:03:11Z'});
  const completeAudit=auditBlindedPublicReceipt(completeCommit.public_receipt);
  const opened=await openBlindedAdjudication(prereg,completeLedger,completeCommit.private_opening,{opened_at:'2026-09-02T00:03:12Z',episode:completeEpisode});
  const passed=partialCommit.public_receipt.status==='COMMITTED'&&partialCommit.public_receipt.phase==='COLLECTING'&&partialAudit.status==='BLINDED'&&partialOpen.status==='HELD'&&partialOpen.adjudication_invoked===false&&partialOpen.outcome_revealed===false&&completeCommit.public_receipt.status==='COMMITTED'&&completeCommit.public_receipt.phase==='SEALED_COMPLETE'&&completeAudit.status==='BLINDED'&&opened.status==='OPENED'&&opened.acquisition_status==='CANDIDATE'&&opened.golden_egg_earned===false;
  return freeze({
    schema:BLINDED_ADJUDICATION_LATCH_SCHEMA,
    exact_parent:BLINDED_ADJUDICATION_LATCH_PARENT,
    partial_public_receipt:partialCommit.public_receipt,
    complete_public_receipt:completeCommit.public_receipt,
    partial_audit:partialAudit,
    complete_audit:completeAudit,
    partial_opening_attempt:partialOpen,
    opened,
    candidate_theorem:passed?'A_NONCE_BLINDED_COMMIT_REVEAL_LATCH_CAN_WITHHOLD_LEDGER_ROOT_SOURCE_MEASUREMENT_VALUE_THRESHOLD_AND_PARENT_STATUS_FROM_PUBLIC_PROGRESS_AND_REFUSE_EARLY_ADJUDICATION_UNTIL_COMPLETE_FIVE_SURFACE_CUSTODY_IS_SEALED_VERIFIED_AND_VALIDLY_OPENED_WITHOUT_ADDING_EMPIRICAL_CREDIT_OR_EARNING_THE_GOLDEN_EGG':'NOT_EARNED',
    assumptions:{commitment_hiding_requires_private_unique_high_entropy_nonce:true,public_receipt_security_does_not_hide_data_from_private_custodian:true},
    golden_egg_earned:false,
    live_loom_mutated:false,
    merge_authority:false,
    production_authority:false,
    passed
  });
}

export const BLINDED_ADJUDICATION_LATCH_CERTIFICATE=await runBlindedAdjudicationLatch();
