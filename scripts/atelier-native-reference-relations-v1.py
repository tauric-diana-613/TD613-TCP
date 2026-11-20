#!/usr/bin/env python3
"""Source-typed native reference graph; never a semantic/causal graph union."""
from pathlib import Path
import hashlib,json,re

def table(root,relative):
    path=Path(root)/relative
    if path.is_symlink() or not path.is_file():raise ValueError('NATIVE_RELATION_REGISTRY_MISSING')
    raw=path.read_bytes()
    return [json.loads(x) for x in raw.decode('utf-8-sig').splitlines() if x.strip()],hashlib.sha256(raw).hexdigest()

def relations(src_root,em_root,chunks):
    def edge(eid,src,dst,kind,projection,evidence,native=None):
        return {'edge_id':eid,'src':src,'dst':dst,'relation_type':kind,'projection':projection,'evidence_id':evidence,'evidence_status':'CANDIDATE','authority':'RESEARCH_ONLY','native_record':native}
    rows,digest=table(src_root,'05-OPERATIONS/relations/typed-edges.jsonl')
    for i,row in enumerate(rows,1):
        if not row.get('edge_id') or not row.get('from_id') or not row.get('to_id'):raise ValueError('SRC_TYPED_RELATION_ENDPOINT')
        yield edge('SRC::'+row['edge_id'],'SRC::'+row['from_id'],'SRC::'+row['to_id'],row.get('relation') or 'UNRESOLVED_NATIVE_RELATION','SRC::'+str(row.get('graph_kind') or 'UNRESOLVED'),digest+':'+str(i),row)
    deriv,dd=table(em_root,'03-DERIVATIVES/derivative-index.jsonl')
    links,ld=table(em_root,'01-MANIFESTS/work-manifestations.jsonl')
    bypath={r.get('derivative_relative_path'):r for r in deriv}
    seen=set()
    for chunk in chunks:
        estate=chunk['estate'];sid=chunk['source_id'];node=estate+'::'+sid
        if node in seen:continue
        seen.add(node)
        if estate=='EMSTD613':
            row=bypath.get(sid.removeprefix('derivative:'))
            if row is None or row.get('derivative_sha256')!=chunk['source_sha256']:raise ValueError('EM_NATIVE_DERIVATIVE_DIGEST_NOT_BOUND')
            yield edge('EM-DERIV::'+sid,node,'EMSTD613::'+row['source_file_id'],'EXTRACTION_OF','EMSTD613::EXTRACTION',dd,row)
        elif estate=='SRC':
            match=re.search(r'zenodo-(\d+)-file-0\.md$',sid)
            if match:yield edge('SRC-DERIV::'+sid,node,'SRC::zenodo:'+match[1],'DERIVATIVE_FILENAME_LOOKUP','SRC::LOOKUP_NOT_IDENTITY_PROOF',chunk['source_sha256'])
    for i,row in enumerate(links,1):
        destination=row.get('work_id')
        target='EMSTD613::'+destination if destination else 'EMSTD613::UNASSIGNED_MANIFESTATION::'+row['source_file_id']
        yield edge('EM-LINK::'+str(i),'EMSTD613::'+row['source_file_id'],target,row.get('relation') or 'MANIFESTATION_CANDIDATE','EMSTD613::WORK_IDENTITY' if destination else 'EMSTD613::UNASSIGNED_NOT_A_WORK',ld+':'+str(i),row)
