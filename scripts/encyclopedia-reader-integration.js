// Generated into the existing reader before GLOSSARY_LIST, not a separate UI tab.
// The canonical Edition 1.4 audit JSON remains byte-unchanged.
(function() {
  'use strict';
  const element=document.getElementById('td613-reference-records');
  const receipt=document.getElementById('td613-research-addendum-20261023');
  if(!element||!receipt) throw new Error('Research accession / lineage record missing');
  const indexed=element.textContent.trim().split('\n').filter(Boolean).map(JSON.parse);
  const accessions=indexed.filter(r=>r.id.startsWith('R-')&&r.origin&&r.origin.research_intake_path);
  const catalog=JSON.parse(receipt.textContent);
  const candidates=new Set(catalog.coverage.all_candidate_ids_csv.split(','));
  const groups=catalog.adoption;
  const label=id=>groups.typed_formal_or_existing_implementation.includes(id)?'BOUNDED FORMAL / EXISTING IMPLEMENTATION':
    groups.research_protocol_ready_to_specify.includes(id)?'PROTOCOL READY TO SPECIFY':
    groups.empirical_or_model_claim_held.includes(id)?'EVIDENCE HELD':'ORIGINAL SOURCE STATUS RETAINED';
  if(accessions.length!==3||candidates.size!==279) throw new Error('Accession coverage incomplete');
  for(const item of accessions){
    const r=item.record;
    if(r.kind==='concept'){
      AUDIT.glossary.push({id:r.record_id,term:r.title,description:r.body,category:r.family,
        status:r.evidence.disposition,also:r.aliases.join('; '),sources:[],
        note:r.evidence.claim_ceiling,original_source_paths:r.sources});
    } else {
      AUDIT.laboratory_concordance.push({id:r.record_id,title:r.title,finding:r.body,
        evidence_class:r.evidence.disposition,ceiling:r.evidence.claim_ceiling,
        sources:[],original_source_paths:r.sources,missing_evidence:r.evidence.missing_evidence});
    }
  }
  window.TD613ResearchIntegration=Object.freeze({
    accessionIds:()=>accessions.map(r=>r.id),
    assessment:id=>candidates.has(id)?Object.freeze({id,disposition:label(id),ledger_id:'R-ENCYCLOPEDIA-LAB-279-20261023',
      limit:'A research classification adds no empirical or independent verification credit.'}):null
  });
})();
