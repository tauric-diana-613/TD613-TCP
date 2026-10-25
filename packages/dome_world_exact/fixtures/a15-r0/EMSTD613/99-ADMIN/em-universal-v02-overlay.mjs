/**
 * EMSTD613 Atelier · v0.2-candidate overlay on native provenance register.
 * Does not rewrite PR #962 profile, custody, original source files, or evidence.
 * Executed as an adapter, not as a declaration of full parity.
 */
import { blankProfile, validateProfile, METHOD } from '../../ATELIER_METHOD/atelier-core-v02.mjs';
import { inspectEmCorpus } from './em-atelier-parity.mjs';

export function emV02Overlay(){
  const native=inspectEmCorpus();
  const profile=blankProfile('EMSTD613',{display_name:'EMSTD613 Lineage Atelier',source_policy:'NATIVE_CORPUS_CUSTODY_ONLY_NO_NEW_INTAKE'});
  profile.provenance='NATIVE_EM_PR962_SOURCE_SHA_70b5a0f9e94626cba6068f41c6117e7978800bbd';
  profile.source_count=native.source_file_count;
  profile.work_count=native.operational_work_count;
  profile.epoch='EXACT_EM_SOURCE_PR962_PINNED_NO_NEW_SEAL';
  profile.rights_state='NATIVE_SOURCE_RIGHTS_BOUND_NO_AUTOMATIC_EXPORT';
  profile.status='SOURCE_MANIFEST_REGISTERED_RESEARCH_UNPROMOTED';
  profile.claim_ceiling='NATIVE_MANIFEST_REVIEW_ONLY_ADVANCED_ASSAYS_NOT_EXECUTED';
  profile.identity_sensitivity={
    independent_work_count_interval:native.independent_work_count_interval,
    independent_work_count_exact:'UNRESOLVED',
    work_identity_fully_resolved:false,
    supported_groups_require_split_collapse:true
  };
  profile.register_states=Object.fromEntries(Object.entries(native.registry_states).map(([k,v])=>[k,{declared:v.declared,present:v.present,consistent:v.consistent}]));
  const testedSynthetic=['STAGE_ORDER_PERMUTATION_IDENTIFIABILITY'];
  for(const k of testedSynthetic){
    profile.modules[k].implementation_state='IMPLEMENTED_TESTED';
    profile.modules[k].corpus_execution='NOT_TESTED';
  }
  profile.modules.CUSTODY_SNAPSHOT_AND_RIGHTS.implementation_state='DOCUMENTED_ONLY';
  profile.modules.WORK_EDITION_MANIFESTATION_CAPTURE_IDENTITY.implementation_state='DOCUMENTED_ONLY';
  profile.modules.FOREIGN_DONOR_ARCHITECTURE_STYLE_FACTORIAL.implementation_state='DOCUMENTED_ONLY';
  profile.modules.TYPED_MULTIPLEX_GRAPH.implementation_state='HELD_MISSING_IMPLEMENTATION';
  profile.modules.QUERY_CONDITIONED_CANONICAL_SUFFICIENCY.implementation_state='HELD_MISSING_IMPLEMENTATION';
  profile.modules.HELD_OUT_ARCHITECTURAL_PLACEMENT.implementation_state='HELD_MISSING_IMPLEMENTATION';
  profile.modules.PUBLIC_RECOGNITION_BREADCRUMB_ROUTE.implementation_state='DOCUMENTED_ONLY';
  profile.consent_and_contact={outbound_contact_authorized:false,public_recognition_route_enabled:false};
  profile.unearned_findings=[];
  profile.scientific_promotion_authority=false;
  validateProfile(profile,METHOD);
  return profile;
}
