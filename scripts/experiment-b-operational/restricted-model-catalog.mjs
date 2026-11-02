import {canonical,digest} from '../experiment-b-resumable/journal.mjs';
export const TOOL_RESTRICTIONS=Object.freeze({shell_type:'disabled',apply_patch_tool_type:null,
  experimental_supported_tools:[],tool_mode:'direct',supports_search_tool:false});
// Client capability restrictions, never served-model or effective-limit evidence.
// All model instructions, effort metadata, selector and numeric limits are kept.
export function restrictModelCatalog(source){
  if(!source||source.slug!=='gpt-6.1-sol')throw Error('EXACT_SELECTED_NATIVE_MODEL_REQUIRED');
  return {models:[{...structuredClone(source),...structuredClone(TOOL_RESTRICTIONS)}]};
}
export function verifyRestrictedCatalog(source,catalog){
  if(canonical(catalog)!==canonical(restrictModelCatalog(source)))throw Error('NATIVE_CATALOG_POLICY_DRIFT');
  return {sourceModelDigest:digest(source),restrictedCatalogDigest:digest(catalog),
    restrictions:TOOL_RESTRICTIONS,providerAttestation:false,
    preservedFields:Object.keys(source).filter(k=>!(k in TOOL_RESTRICTIONS)).sort()};
}
export function enforceNoCompactionGuard(source,measurement,limits){
  const context=source.context_window??source.max_context_window;
  const percent=source.effective_context_window_percent??95;
  if(!Number.isSafeInteger(context)||context<=0||!Number.isSafeInteger(percent)||percent<1||percent>100)
    throw Error('NATIVE_CLIENT_RETENTION_GUARD_UNAVAILABLE');
  const auto=Math.min(Math.floor(context*9/10),source.auto_compact_token_limit??Infinity);
  const clientGuard=Math.min(auto,Math.floor(context*percent/100));
  const reserved=measurement.upperBound+limits.outputAndReasoningTokens;
  if(!Number.isSafeInteger(reserved)||reserved>=clientGuard)throw Error('NATIVE_COMPACTION_OR_RETENTION_GUARD_HOLD');
  return {clientGuardTokens:clientGuard,totalReservedContextTokens:reserved,
    evidenceClass:'CLIENT_METADATA_AND_REVIEWED_ALGORITHM_NOT_PROVIDER_LIMIT_ATTESTATION'};
}
