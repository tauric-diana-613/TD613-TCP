/**
 * Source-bound computation over Vixen's original recorded folios. Their
 * independent source statuses stay preserved: previews are neither authored
 * theorems nor scientific ratification.
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
 const sourceContext=[folio.id,folio.title,folio.summary.slice(0,320),
  (folio.links||[]).join(' ')].join(' · ');
 const humanQuestion=typeof opts.operatorQuestion==='string'?opts.operatorQuestion.trim().slice(0,240):'';
 const ranking=scoreUnifiedSynthesisCandidates(corpus,{
  lagTicks:opts.lagTicks??36,candidateLimit:4,sourceContext,operatorQuestion:humanQuestion
 });
 if(ranking.query_provenance.human_question_supplied!==Boolean(humanQuestion))
  throw new TypeError('SOURCE_CONTEXT_MISATTRIBUTED_TO_HUMAN_OPERATOR');
 const math=computeSalonObservatoryDiagnostics({clock_probe:{lag_ticks:opts.lagTicks??36,active_clock_id:'k'}});
 return Object.freeze({
  schema:'emstd613.vixen.theory-wardrobe-computation/v1',folio_id:id,folio_title:folio.title,
  folio_kind:kind,source_title_locus_ornament:folio.status==='BRANDING_ORNAMENT_ONLY',
  foundry:Object.freeze({lab_id:result?.corpus_coordinates.lab_id??null,
    model:result?.optical_engine.program??null,
    source_work_count:result?.corpus_coordinates.source_works.length??0,
    source_work_ids:result?.corpus_coordinates.source_works??Object.freeze([]),
    metrics:result?.metrics??Object.freeze([])}),
  synthesis:Object.freeze({
    engine:'BROWSER_ISOMORPHIC_UNIFIED_CANDIDATE_RANKING',
    candidate_count:ranking.candidate_count,conditioning_folio:id,
    question:sourceContext,human_question:humanQuestion||null,
    question_origin:humanQuestion?'HUMAN_SUPPLIED_PLUS_FOLIO_CONTEXT':'ARCHIVAL_FOLIO_CONTEXT_ONLY',
    query_provenance:ranking.query_provenance,
    state:'UNRATIFIED_SOURCE_CONDITIONED_CANDIDATE_RANKING',
    top_candidate:ranking.top_candidate?Object.freeze({id:ranking.top_candidate.id,title:ranking.top_candidate.title,score:ranking.top_candidate.score}):null,
    scored_candidates:Object.freeze(ranking.candidates.map(c=>Object.freeze({
      id:c.id,title:c.title,regime:c.regime,score:c.score,breakdown:Object.freeze({...c.breakdown}),
      research_question:c.researchQuestion||null,falsifier:c.falsifier||null
    }))),
    engine_trace:Object.freeze({
      src_projective_links:ranking.src_atelier?.projective_routing?.candidate_link_count??null,
      src_contextual_role_passes:ranking.src_atelier?.context_roles?.pass_count??null,
      src_tomography_candidates:ranking.src_atelier?.phase2_tomography?.candidate_count??null,
      src_tomography_composite:ranking.src_atelier?.phase2_tomography?.composite_score??null,
      native_host_executable_invoked:false,manuscript_passages_read_by_wardrobe:false,
      mode:'LOCAL_IN_BROWSER_ENGINE_ADAPTER',
      attribution:'TECHNICAL_INSTRUMENT_REUSE_NOT_SCHOLARLY_AUTHORSHIP'
    })
  }),
  diagnostics:Object.freeze({svd_class:math?.svd_conditioning.classification??null,
    arrival_inversions:math?.vernier_summary.arrival_inversions??null}),
  authority:Object.freeze({technical_methods_elevated:0,empirical_credit:0,
    source_register_count:roster.theories.length,experimental_subject_count:null,
    experiment_design_state:'UNDETERMINED_BY_ARCHIVAL_CENSUS',
    research_proposal_review:'PODIUM_SCORE_AND_HUMAN_COMPOSER_REQUIRED',
    scientific_closure:'HUMAN_RESERVED'})
 });
}
