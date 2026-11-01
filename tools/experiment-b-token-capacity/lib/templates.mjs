export const TEMPLATE_VERSION='td613-capacity-renderer/v1-PROPOSED_NOT_ADOPTED';
const common='Use only the released evidence and your own exact prior final messages. Preserve source provenance, valid prior commitments, revisions, retractions, uncertainties and abstentions. No external sources or other-arm history. Never claim a prediction was observed. Candidate adjudication remains pending.';
export function renderTemplate({arm,stage,representation,evidence=[],history=[],handoffs=[]}){
 const framing=representation==='DOLLHOUSE'?'Pedagogue/Aperture: consequence order, burden and identifiability. Atlas/FADT: relation identity, finite admissibility, false twins.':'Audit consequences, observation limits, identifiability, relation preservation and admissibility in standard mathematical wording.';
 const tasks={
  BASELINE:'Record pre-exposure commitments and uncertainty. No research document has been exposed.',
  MODULAR_1:'First jurisdiction: inspect the released raw-source prefix and own prior commitments; produce a complete evidence-bound handoff.',
  MODULAR_2:'Second jurisdiction: reason only from the actual handoffs and own second-jurisdiction commitments; verify or falsify candidates. No raw-source retrieval.',
  UNION_1:'Unified generation: use all released raw evidence, definitions and verification opportunities. Generate, revise, falsify or abstain without jurisdictional bottlenecks.',
  UNION_2:'Unified verification: retain full raw evidence and own prior output; challenge candidates, preserve valid priors and revise where warranted.',
  SYNTHESIS:'Freeze final candidates, proof obligations, uncertainties and retraction dependencies; do not certify warrant or novelty.'
 };
 return JSON.stringify({template_version:TEMPLATE_VERSION,arm,stage,instructions:[common,framing,tasks[stage]],raw_evidence:evidence,own_prior_final_messages:history,handoffs});
}
export function renderEvaluatorTemplate({stage,evidence=[],candidate='',proof='',controls='',neutralPackets=[]}){
 return JSON.stringify({template_version:TEMPLATE_VERSION,stage,instructions:'Independently assess the neutral submission, preserve all assumptions and caveats, verify source grounding and proof obligations, reject validly constructed false twins, and keep warrant, novelty, representation contribution and masking distinct. Do not infer treatment identity from packet order. Record uncertainty; no self-certified scientific authority.',raw_evidence:evidence,candidate,proof,matched_controls:controls,neutral_packets:neutralPackets});
}
