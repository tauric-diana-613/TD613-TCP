/**
 * 𝌋 The Operahouse is infrastructure; Vixen is a distinct Opera;
 * Em Works and manifestations are Vixen Performers.
 *
 * Cross-Opera passage is restricted to independently grounded, human-ratified,
 * per-source Work mappings. Lexical similarity, a shared index, matching hashes,
 * machine convenience, or a generic query are never warrants.
 */
export const CROSS_OPERA_SCHEMA='td613.vixen.cross-opera-warrant/v1';
export const VIXEN_OPERA='VIXEN_CYBERNETICS';
export const VIXEN_ESTATE='EMSTD613';

/**
 * Human-ratified Vixen ↔ Universal mappings only.
 * The current public acquisition contains ZERO such mappings.
 * A future mapping requires a new independently reviewed registry version.
 */
export const ADMITTED_VIXEN_CROSSWALKS=Object.freeze([]);
const HASH=/^[0-9a-f]{64}$/;
export function inspectVixenCrossOperaWarrant({work,source}={}){
 const registry=ADMITTED_VIXEN_CROSSWALKS;
 const workId=work?.work_id,sourceId=source?.source_file_id;
 const sourceBelongsToWork=typeof workId==='string'
   && typeof sourceId==='string'
   && (work.linked_sources||[]).some(s=>s.source_file_id===sourceId&&s.sha256===source.sha256);
 if(!sourceBelongsToWork)return Object.freeze({state:'HELD',reason:'SOURCE_NOT_IN_VIXEN_WORK',eligible:false});
 if(!Array.isArray(registry))return Object.freeze({state:'HELD',reason:'INVALID_WARRANT_REGISTRY',eligible:false});
 const candidate=registry.find(x=>
   x.opera===VIXEN_OPERA
   && x.estate===VIXEN_ESTATE
   && x.work_id===workId
   && x.source_file_id===sourceId
   && x.source_sha256===source.sha256
   && HASH.test(x.warrant_sha256||'')
   && typeof x.human_ratification_ref==='string'&&x.human_ratification_ref.length>0
   && x.status==='HUMAN_RATIFIED'
 );
 if(!candidate)return Object.freeze({state:'HELD',reason:'NO_HUMAN_RATIFIED_CROSS_OPERA_WARRANT',eligible:false});
 return Object.freeze({state:'CANDIDATE',eligible:true,record_id:candidate.universal_record_id,warrant_sha256:candidate.warrant_sha256,claim_ceiling:'WARRANT_PRESENT_NOT_SCIENTIFIC_ENTAILMENT'});
}
export function assertNoAutomaticCrossOperaEntry({work,source}={}){
 const r=inspectVixenCrossOperaWarrant({work,source});
 return r.eligible ? r : Object.freeze({state:'HELD',reason:r.reason,eligible:false});
}
