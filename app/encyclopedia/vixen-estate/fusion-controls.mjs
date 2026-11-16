/**
 * 𝌋 Vixen Semantic–Semiotic Fusion Control Contract
 * Pure bounded scoring controls shared by browser UI, retrieval and Podium.
 * Ablation changes active contribution, never invents new evidence or proofs.
 */
export const FUSION_CHANNEL_KEYS=Object.freeze(['lexical','semantic','semiotic','src']);
export const FUSION_WEIGHT_POLICIES=Object.freeze(['PRESERVE_BASELINE','RENORMALIZE_ACTIVE']);
export const FUSION_PROFILES=Object.freeze({
 FULL_FUSION:Object.freeze({lexical:true,semantic:true,semiotic:true,src:true}),
 LEXICAL_ONLY:Object.freeze({lexical:true,semantic:false,semiotic:false,src:false}),
 SEMANTIC_ONLY:Object.freeze({lexical:false,semantic:true,semiotic:false,src:false}),
 SEMIOTIC_ONLY:Object.freeze({lexical:false,semantic:false,semiotic:true,src:false}),
 SRC_ONLY:Object.freeze({lexical:false,semantic:false,semiotic:false,src:true}),
 NO_SEMANTIC:Object.freeze({lexical:true,semantic:false,semiotic:true,src:true}),
 NO_SEMIOTIC:Object.freeze({lexical:true,semantic:true,semiotic:false,src:true}),
 NO_SRC:Object.freeze({lexical:true,semantic:true,semiotic:true,src:false})
});
export const FUSION_PROFILE_IDS=Object.freeze(Object.keys(FUSION_PROFILES));
const own=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);
export function normalizeFusionControls(spec=null){
 if(spec==null)spec={};
 if(typeof spec!=='object'||Array.isArray(spec))throw new TypeError('VIXEN_FUSION_CONTROLS_OBJECT_REQUIRED');
 for(const key of Object.keys(spec)){
  if(!['channels','weight_policy','profile'].includes(key))throw new TypeError('VIXEN_FUSION_UNKNOWN_CONTROL:'+key);
 }
 const profile=spec.profile==null?'FULL_FUSION':String(spec.profile);
 if(!own(FUSION_PROFILES,profile))throw new TypeError('VIXEN_FUSION_UNKNOWN_PROFILE:'+profile);
 const input=spec.channels??{};
 if(typeof input!=='object'||!input||Array.isArray(input))throw new TypeError('VIXEN_FUSION_CHANNELS_OBJECT_REQUIRED');
 for(const key of Object.keys(input)){
  if(!FUSION_CHANNEL_KEYS.includes(key)||typeof input[key]!=='boolean')throw new TypeError('VIXEN_FUSION_INVALID_CHANNEL:'+key);
 }
 const channels=Object.freeze({...FUSION_PROFILES[profile],...input});
 if(!FUSION_CHANNEL_KEYS.some(key=>channels[key]))throw new TypeError('VIXEN_FUSION_ZERO_ACTIVE_CHANNELS');
 const weight_policy=spec.weight_policy??'PRESERVE_BASELINE';
 if(!FUSION_WEIGHT_POLICIES.includes(weight_policy))throw new TypeError('VIXEN_FUSION_UNKNOWN_WEIGHT_POLICY');
 return Object.freeze({schema:'td613.vixen.fusion-controls/v1',profile,channels,weight_policy});
}
export function fusionWeightsForMode(mode,srcConditioned=false,srcWeights=null){
 const source=(srcWeights&&typeof srcWeights==='object')?srcWeights:{};
 const useSource=mode==='src_projective'||(mode==='hybrid'&&srcConditioned);
 if(useSource){
  const x={
   lexical:Number(source.lex??0),
   semantic:Number(source.sem??0),
   semiotic:Number(source.semi??0),
   src_proj:Number(source.src_proj??0),
   src_sig:Number(source.src_sig??0)
  };
  if(Object.values(x).some(v=>!Number.isFinite(v)||v<0||v>1))throw new TypeError('VIXEN_FUSION_INVALID_SRC_WEIGHTS');
  return Object.freeze(x);
 }
 if(['lexical','phrase','exact'].includes(mode)){
  return Object.freeze({lexical:0.80,semantic:0,semiotic:0.15,src_proj:0,src_sig:0});
 }
 return Object.freeze({lexical:0.50,semantic:0.30,semiotic:0.20,src_proj:0,src_sig:0});
}
export function scoreFusionChannels(raw={},controls=null,mode='hybrid',srcConditioned=false,srcWeights=null){
 const spec=normalizeFusionControls(controls);
 const base=fusionWeightsForMode(mode,srcConditioned,srcWeights);
 const enabled=spec.channels;
 const parts={
  lexical: enabled.lexical?base.lexical*Math.max(0,Number(raw.lexical)||0):0,
  semantic: enabled.semantic?base.semantic*Math.max(0,Number(raw.semantic)||0):0,
  semiotic: enabled.semiotic?base.semiotic*Math.max(0,Number(raw.semiotic)||0):0,
  src_proj: enabled.src?base.src_proj*Math.max(0,Number(raw.src_proj)||0):0,
  src_sig: enabled.src?base.src_sig*Math.max(0,Number(raw.src_sig)||0):0
 };
 const baselineSum=Object.values(base).reduce((a,b)=>a+b,0);
 const activeBaseSum=base.lexical*(+enabled.lexical)+base.semantic*(+enabled.semantic)+base.semiotic*(+enabled.semiotic)+
  (base.src_proj+base.src_sig)*(+enabled.src);
 const factor=spec.weight_policy==='RENORMALIZE_ACTIVE'&&activeBaseSum>0?baselineSum/activeBaseSum:1;
 const activeScore=Object.values(parts).reduce((a,b)=>a+b,0)*factor;
 return Object.freeze({
  active_score:Math.max(0,Math.min(1,activeScore)),
  raw_contributions:Object.freeze({...parts}),
  effective_contributions:Object.freeze(Object.fromEntries(Object.entries(parts).map(([k,v])=>[k,+(v*factor).toFixed(6)]))),
  weights:base,active_weight_sum:+activeBaseSum.toFixed(6),
  baseline_weight_sum:+baselineSum.toFixed(6),
  normalization_factor:+factor.toFixed(6),
  controls:spec
 });
}
export function boundedFusionComparisonSpec(params={}){
 if(!params||typeof params!=='object'||Array.isArray(params))throw new TypeError('VIXEN_FUSION_COMPARE_PARAMETERS_OBJECT_REQUIRED');
 const query=params.query;
 if(typeof query!=='string'||query.trim().length<2||query.length>200)throw new TypeError('VIXEN_FUSION_QUERY_LENGTH_2_TO_200');
 const mode=String(params.mode??'hybrid');
 if(!['hybrid','lexical','phrase','exact','src_projective'].includes(mode))throw new TypeError('VIXEN_FUSION_INVALID_MODE');
 if(mode==='exact')throw new TypeError('VIXEN_FUSION_ABLATION_NOT_SUPPORTED_FOR_EXACT_BYTES');
 const profiles=params.profiles??['FULL_FUSION','NO_SEMANTIC','NO_SEMIOTIC'];
 if(!Array.isArray(profiles)||profiles.length<1||profiles.length>6||new Set(profiles).size!==profiles.length||
    profiles.some(id=>!FUSION_PROFILE_IDS.includes(id)))throw new TypeError('VIXEN_FUSION_PROFILES_MUST_BE_UNIQUE_1_TO_6');
 const limit=Number(params.limit??10);
 if(!Number.isInteger(limit)||limit<1||limit>24)throw new TypeError('VIXEN_FUSION_LIMIT_1_TO_24');
 const weight_policy=params.weight_policy??'PRESERVE_BASELINE';
 if(!FUSION_WEIGHT_POLICIES.includes(weight_policy))throw new TypeError('VIXEN_FUSION_UNKNOWN_WEIGHT_POLICY');
 return Object.freeze({query:query.trim(),mode,profiles:Object.freeze([...profiles]),limit,weight_policy});
}
