/**
 * Source-bound computation over recorded TCC catalogue entries. Inventory
 * cardinality is NOT experimental design, preregistration or admission.
 * Any scientific proposal must pass native Podium Score and human Composer.
 * Historical RC optics/engineering records are retained but never performed as
 * Vixen authorship. All output is bounded, synthetic and human-unratified.
 */
import {assessVixenLab} from './observatory-vixen-corpus.mjs';
import {auditVixenFolioCensus,classifyVixenFolio} from './vixen-stage-subject-contract.mjs';
import {scoreUnifiedSynthesisCandidates,computeSalonObservatoryDiagnostics} from './synthesis-salon-engine.mjs';
export const VIXEN_THEORY_IDS=Object.freeze(['TCC-01','TCC-02','TCC-03','TCC-04','TCC-05','TCC-06','TCC-07','TCC-08']);
export function selectVixenTheoryFolios(corpus){
 if(!Array.isArray(corpus?.formula_folios)||corpus.formula_folios.length!==22)
   throw new TypeError('VIXEN_FOLIO_SOURCE_CENSUS_HELD');
 auditVixenFolioCensus(corpus);
 const theories=corpus.formula_folios.filter(f=>classifyVixenFolio(f).stage_role==='OPERA'&&VIXEN_THEORY_IDS.includes(f.id));
 const methods=corpus.formula_folios.filter(f=>f.group==='couture');
 if(theories.length!==8||new Set(theories.map(f=>f.id)).size!==8||methods.length!==14)
   throw new TypeError('VIXEN_THEORY_TECHNICAL_BOUNDARY_HELD');
 return Object.freeze({theories:Object.freeze(theories),retained_technical_count:methods.length});
}
export function computeVixenTheoryReceipt(corpus,id,opts={}){
 const roster=selectVixenTheoryFolios(corpus);
 const folio=roster.theories.find(f=>f.id===id);
 if(!folio)throw new TypeError('TECHNICAL_METHOD_NOT_VIXEN_PERFORMER');
 const kind=classifyVixenFolio(folio).kind;
 // Folio status is source metadata, not a grant of experimental authority.
 const controls={gain:opts.gain??.72,witness:opts.witness??.88,voltage:opts.voltage??.83,twist:opts.twist??.45,sampleIndex:opts.sampleIndex??40};
 const result=assessVixenLab(corpus,'LAB_'+id,controls,{x:0,y:0});
 if(result&&result.corpus_coordinates.source_folio!==id)throw new Error('FOLIO_TO_COMPUTATION_ID_MISMATCH');
 const sourceQuestion=[folio.id,folio.title,folio.summary.slice(0,320),
  (folio.links||[]).join(' '),String(opts.operatorQuestion||'').slice(0,240)].join(' · ');
 const ranking=scoreUnifiedSynthesisCandidates(corpus,
  {lagTicks:opts.lagTicks??36,candidateLimit:4,operatorQuestion:sourceQuestion});
 const math=computeSalonObservatoryDiagnostics({clock_probe:{lag_ticks:opts.lagTicks??36,active_clock_id:'k'}});
 return Object.freeze({
  schema:'emstd613.vixen.theory-wardrobe-computation/v1',folio_id:id,folio_title:folio.title,
  folio_kind:kind,source_title_locus_ornament:folio.status==='BRANDING_ORNAMENT_ONLY',
  foundry:Object.freeze({lab_id:result?.corpus_coordinates.lab_id??null,
    model:result?.optical_engine.program??null,
    source_work_count:result?.corpus_coordinates.source_works.length??0,
    source_work_ids:result?.corpus_coordinates.source_works??Object.freeze([]),
    metrics:result?.metrics??Object.freeze([])}),
  synthesis:Object.freeze({engine:'NATIVE_UNIFIED_CANDIDATE_RANKING',candidate_count:ranking?.candidate_count??0,
    conditioning_folio:id,question:sourceQuestion,
    state:'UNRATIFIED_SOURCE_CONDITIONED_CANDIDATE_RANKING',
    top_candidate:ranking?.top_candidate?Object.freeze({id:ranking.top_candidate.id,title:ranking.top_candidate.title,score:ranking.top_candidate.score}):null}),
  diagnostics:Object.freeze({svd_class:math?.svd_conditioning.classification??null,
    arrival_inversions:math?.vernier_summary.arrival_inversions??null}),
  authority:Object.freeze({technical_methods_elevated:0,empirical_credit:0,
    source_register_count:roster.theories.length,experimental_subject_count:null,
    experiment_design_state:'UNDETERMINED_BY_ARCHIVAL_CENSUS',
    research_proposal_review:'PODIUM_SCORE_AND_HUMAN_COMPOSER_REQUIRED',
    scientific_closure:'HUMAN_RESERVED'})
 });
}
