// Distinct comparator dispatcher. Exact portable algorithms, not original Em-corpus execution.
import {resolveWorkManifestations,motifCandidateSieve,independentEvidenceSupport} from '../E3B4/seed/atelier-parity-operators-v02.mjs';
import {discriminateMechanisms} from '../E3B4/seed/atelier-mechanism-discrimination-v02.mjs';
import {spans,anchoredSpecimen,epoch} from './em-methods-v01.mjs';
export function portableOracle(f,operation,p={}){
 switch(operation){
 case 'WORK_IDENTITY_SPLIT_COLLAPSE_SENSITIVITY':return {portable_works:f.works.map(w=>resolveWorkManifestations({work_id:w.work_id,works:f.works,manifestations:f.manifestations,source_rows:f.source_files,epoch}))};
 case 'MOTIF_VS_MECHANISM_NULL':return {lexical:motifCandidateSieve({snapshot_id:epoch,source_spans:spans(f),terms:p.terms??['trace']})};
 case 'FORMAL_OPERATOR_AND_AUTHORITY_LAUNDERING':{const args=anchoredSpecimen(f,p.specimen??'SIGNED');return args?discriminateMechanisms(args):null}
 case 'GENEALOGY_AND_SOURCE_INDEPENDENCE':{const roots=new Map(f.originals.map(o=>[o.original_id,o.ancestor_id]));return {independence:independentEvidenceSupport(f.derivatives.map(d=>({evidence_id:d.derivative_id,source_id:d.source_file_id,ancestor_id:roots.get(d.original_id)})))};}
 default:return {status:'HELD_NO_SOURCE_FREE_NATIVE_COMPARATOR',original_em_corpus_execution:0};
 }
}
