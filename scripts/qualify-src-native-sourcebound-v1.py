#!/usr/bin/env python3
"""Read-only, public SRC method qualification. Never admits sources to a receiver.

Requires an authentic independent checkout of the retained SRC revision. Reports
Git-byte integrity separately from stale projection-seal membership. No network,
source writes, protected acquisition, model calls, Flight or scientific closure.
"""
import argparse
import collections
import hashlib
import importlib.util
import json
import re
from pathlib import Path
import subprocess
import sys

SRC_REVISION='b3e69acf587d534eeef2e01d0bb5bdbdecdbd320'
BASE=Path('packages/dome_world_exact/fixtures/a15-r0/SRC')
ROOT=Path(__file__).resolve().parents[1]

def imported(name,path):
    spec=importlib.util.spec_from_file_location(name,path)
    m=importlib.util.module_from_spec(spec);sys.modules[name]=m;spec.loader.exec_module(m);return m

def sha(raw):return hashlib.sha256(raw).hexdigest()
def canonical(value):return json.dumps(value,ensure_ascii=False,sort_keys=True,separators=(',',':'),allow_nan=False).encode()
def require(condition,message):
    if not condition:raise AssertionError(message)

def source_manifest(checkout):
    head=subprocess.check_output(['git','-C',str(checkout),'rev-parse','HEAD'],text=True).strip()
    require(head==SRC_REVISION,'Pinned SRC checkout HEAD drift')
    tree=subprocess.check_output(['git','-C',str(checkout),'ls-tree','-rz',SRC_REVISION,'--',BASE.as_posix()])
    out=[]
    for item in tree.split(b'\0'):
        if not item:continue
        meta,name=item.split(b'\t',1);mode,kind,blob=meta.split();path=name.decode()
        require(mode==b'100644' or mode==b'100755','Non-file source object refused')
        f=checkout/path
        require(not any(p.is_symlink() for p in (f,*f.parents)),'Source symlink refused')
        raw=f.read_bytes();oid=hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()
        lfs=False
        if oid!=blob.decode():
            pointer=subprocess.check_output(['git','-C',str(checkout),'cat-file','blob',blob.decode()])
            match=re.fullmatch(rb'version https://git-lfs.github.com/spec/v1\noid sha256:([0-9a-f]{64})\nsize ([0-9]+)\n',pointer)
            require(match is not None,'Original Git blob differs: '+path)
            require(sha(raw)==match[1].decode() and len(raw)==int(match[2]),'Original LFS payload differs: '+path)
            lfs=True
        out.append({'path':str(Path(path).relative_to(BASE)),'git_blob':blob.decode(),
                    'lfs_payload_verified':lfs,'bytes':len(raw),'sha256':sha(raw)})
    require(bool(out),'No original source files')
    return out

def qualify(checkout):
    checkout=Path(checkout).resolve();src=checkout/BASE
    before=source_manifest(checkout)
    report={'schema':'td613.src.sourcebound-method-qualification/v1','source_revision':SRC_REVISION,
      'implementation_base':'9d044b4074a8bce8a974c7213b8ba2d8da4ef4fa',
      'evidence_class':'PUBLIC_REPOSITORY_SOURCE_BOUND_EXECUTION',
      'source_files_verified':len(before),'source_manifest_sha256':sha(canonical(before)),
      'checks':[],'protected_flights':'HELD','human_scientific_closure':'RESERVED',
      'real_source_receiver_admissions':0,'independent_empirical_replications':0}
    def check(name,fn):
        try:detail=fn();report['checks'].append({'name':name,'status':'PASS','detail':detail})
        except Exception as e:report['checks'].append({'name':name,'status':'FAIL','error':str(e)} )
    builder=imported('qualified_original_builder',src/'99-ADMIN/build-phase2-assays.py')
    query=imported('qualified_original_query',src/'99-ADMIN/srcquery.py')
    route=imported('qualified_original_router',src/'99-ADMIN/run-projective-routing-grammar-assay.py')
    bridge=imported('qualified_native_bridge',ROOT/'scripts/atelier-native-inheritance-bridge-v1.py')
    adapter=imported('qualified_tomography_adapter',ROOT/'scripts/atelier-src-method-adapter-v1.py')
    def rows(p):return [json.loads(l) for l in (src/p).read_text(encoding='utf-8-sig').splitlines() if l.strip()]
    current=json.loads((src/'04-RECEIPTS/phase2/current-seal.json').read_bytes());snapshot=current['atelier_snapshot_id']
    report['declared_epoch']=current
    conservation,tomography=builder.conservation_and_tomography(src,snapshot)
    roles,passes=builder.contextual_roles_and_compilers(src,snapshot)
    for name,actual in [('claim-evidence-tomography',tomography),('contextual-role-assertions',roles),('compilation-passes',passes)]:
        def diff(name=name,actual=actual):
            expected=rows('05-OPERATIONS/phase2/'+name+'.jsonl');require(actual==expected,'Original builder differential failed')
            return {'rows':len(actual),'ordered_values_sha256':sha(canonical(actual)),'original_builder_executed':True}
        check('original-builder:'+name,diff)
    p=src/'05-OPERATIONS/phase2/claim-evidence-tomography.jsonl'
    bundle=adapter.load(p,snapshot=snapshot,seal_binding='RESOLVE_MATCHED_CURRENT_SEAL',expected_sha256=sha(p.read_bytes()))
    def adapter_parity():
        require(bundle['rows']==tomography,'Adapter changed native rows')
        require(bundle['source_bytes']==p.read_bytes(),'Adapter changed source bytes')
        for field,value in [('delta_evidence','UNKNOWN'),('delta_asserted_authority','UNKNOWN'),('composite_score',None)]:
            hits=adapter.query(bundle,field,value,limit=100);require(hits['total']==len(tomography),'Unknown/null lost')
            require([x['row'] for x in hits['rows']]==tomography,'Typed query changed rows')
        require(adapter.query(bundle,'ABSENT',None)['total']==0,'Absent collapsed into null')
        require(adapter.query(bundle,'composite_score',False)['total']==0,'Boolean collapsed into null')
        return {'rows':len(tomography),'bytes_sha256':bundle['source_sha256'],
                'receiver':'NOT_ADMITTED_PUBLIC_SOURCE','seal_binding':'DECLARED_PLACEHOLDER_ONLY'}
    check('source-to-adapter-exact-readback-unknown-null-absence',adapter_parity)
    def source_witnesses():
        registry=rows('04-RECEIPTS/assays/2026-08-24-phase15-authority-recompilation/witnessed-evidence.jsonl')
        witnesses={x['evidence_id']:x for x in registry}
        require(len(witnesses)==len(registry),'Duplicate witness identities')
        refs={eid for row in tomography for eid in row['evidence_ids']}
        require(refs<=witnesses.keys(),'Unresolved tomography evidence identifier')
        committed={x['path']:x for x in before};kinds=collections.Counter();line_pins=0
        for eid in sorted(refs):
            w=witnesses[eid];kinds[w['evidence_kind']]+=1
            require(w['source_path'] in committed,'Witness source missing from pinned Git estate')
            located=rows(w['source_path']);locator=w['source_locator']
            if 'jsonl_line' in locator:
                line=locator['jsonl_line'];require(type(line) is int and 1<=line<=len(located),'Witness line unavailable')
                line_pins+=1
            if 'rows' in locator:require(locator['rows']==len(located),'Archive witness row count differs')
        return {'tomography_rows':len(tomography),'distinct_resolved_evidence_ids':len(refs),
          'line_locators_in_bounds':line_pins,'source_kinds':dict(kinds),
          'scope':'GIT_VERIFIED_METADATA_AND_ARCHIVE_LOCATORS; semantic entailment and external source custody unestablished'}
    check('source-witness-identities-paths-and-locator-bounds',source_witnesses)
    def projections():
        out={}
        for projection,key in bridge.PROJECTIONS.items():
            result=bridge.native_projection(src,projection,limit=1000)
            original=rows(bridge.SRC_METHODS[key])
            require([x['record'] for x in result['matches']]==original,'Projection altered rows')
            require(result['scientific_topology_established'] is False,'Projection promoted to geometry')
            out[projection]=len(original)
        require(bridge.native_projection(src,'RELATIONAL_TOPOLOGY',term='ABSENT-NEGATIVE-CONTROL')['returned']==0,'Unsupported relation fabricated')
        try:bridge.native_projection(src,'HOLONOMY')
        except ValueError:pass
        else:raise AssertionError('Unsupported projection accepted')
        return {'native_registry_readback_counts':out,'geometric_engine_qualification':False}
    check('seven-native-projections-and-unsupported-relation-controls',projections)
    documents=route.load_documents(src);explore=route.explore_observations(documents)
    signatures=route.signature_observations(documents);markers=route.field_marker_observations(documents)
    summary=route.summary(documents,explore,signatures,markers);report['projective_summary']=summary
    def route_cli():
        completed=subprocess.run([sys.executable,'-B',str(src/'99-ADMIN/run-projective-routing-grammar-assay.py'),'--root',str(src),'--self-test'],check=True,capture_output=True,text=True)
        require(json.loads(completed.stdout)==summary,'CLI differs from direct original execution')
        require(len(explore)>0 and summary['explore_classification_counts'].get('UNRESOLVED_MACHINE',0)>0,'Missing routing negative controls')
        return {'documents':len(documents),'observations':len(explore),'cli_direct_equal':True,'native_cue':'Explore X.'}
    check('original-projective-routing-cli-direct-differential',route_cli)
    def withdrawal():
        byid={d.entity_id:d for d in documents};changed=0;asof=0
        for row in explore:
            if row['observation_status']!='LATER_EXACT_RESOLUTION_CANDIDATE':continue
            d=byid[row['source_id']]
            removed={c['target_id'] for c in row['machine_candidates'] if c['match_kind']=='EXACT_OR_TITLE_SUBSTRING' and c['temporal_relation']=='LATER'}
            after=route.classify_explore(route.lexical_candidates(row['raw_token'],d,[x for x in documents if x.entity_id not in removed]))
            changed+=after!=row['observation_status']
            time=route.parse_iso(d.created) or route.parse_iso(d.publication_date)
            prior=[x for x in documents if (route.parse_iso(x.created) or route.parse_iso(x.publication_date)) is not None and (route.parse_iso(x.created) or route.parse_iso(x.publication_date))<=time]
            prior_class=route.classify_explore(route.lexical_candidates(row['raw_token'],d,prior))
            require(prior_class!='LATER_EXACT_RESOLUTION_CANDIDATE','Future result leaked into prior view');asof+=1
        require(changed>0,'Withdrawal produced no observed classification change')
        return {'later_exact_cases':asof,'classification_changes_after_logical_target_withdrawal':changed,
          'scope':'DOCUMENT_TARGET_WITHDRAWAL_ONLY; six-dimensional platform withdrawal remains documentary',
          'source_availability_events_written':0,'historical_records_rewritten':0}
    check('chronology-and-logical-destination-withdrawal',withdrawal)
    def typed_roles():
        require(all({'subject_id','architecture_id','scope','asserted_at','role_normalized','evidence_ids'}<=set(x) for x in roles),'Context lost')
        contexts=collections.defaultdict(set)
        for x in roles:contexts[x['subject_id']].add((x['architecture_id'],json.dumps(x['scope'],sort_keys=True),x['asserted_at'],x['role_normalized']))
        multiple=sum(len(x)>1 for x in contexts.values());require(multiple>0,'Contextual multiplicity missing')
        return {'assertions':len(roles),'compiler_passes':len(passes),'subjects_with_multiple_contexts':multiple,'intrinsic_role_inference':False}
    check('typed-role-context-traversal',typed_roles)
    def trace_control():
        edge=rows('05-OPERATIONS/relations/typed-edges.jsonl')[0]
        traced=query.trace(src,edge['from_id']);missing=query.trace(src,'QUALIFICATION-ABSENT-ENTITY')
        require(traced['status']=='RESOLVED' and traced['relations'],'Witnessed traversal absent')
        require(missing['status']=='UNRESOLVED_TARGET' and missing['relations']==[] and missing['missing_hops'],'Negative relation guessed')
        return {'witnessed_trace_relations':len(traced['relations']),'negative_missing_hops':missing['missing_hops'],
          'scope':'ORIGINAL_QUERY_ON_GIT_VERIFIED_BYTES; STALE_SEAL_NOT_ACCEPTED'}
    check('original-exact-id-traversal-and-missing-hop-control',trace_control)
    def authority_control():
        data=rows('05-OPERATIONS/phase2/authority-jurisdiction-assertions.jsonl');subject=data[0]['subject']['id']
        result=query.authority(src,subject,None)
        require(result['controlling_formulation'] is None and result['newest_manifestation_is_not_authority'] is True,'Latest promoted to control')
        return {'retained_formulations':len(result['applicable_witnessed_formulations']),'controlling_formulation':None,'scope':'ORIGINAL_READBACK_WITHOUT_SEALED_QUERY_ADMISSION'}
    check('authority-chronology-nonpromotion',authority_control)
    def seals():
        manifest=json.loads((src/current['path']).read_bytes());status=collections.Counter();drift=[];newline_matches=0
        for e in manifest['entries']:
            f=src/e['path'];ok=f.is_file() and len(f.read_bytes())==e['bytes'] and sha(f.read_bytes())==e['sha256']
            status['match' if ok else 'drift_or_missing']+=1
            if not ok:
                drift.append(e['path'])
                if f.is_file():
                    variant=f.read_bytes().replace(b'\r\n',b'\n').replace(b'\n',b'\r\n')
                    newline_matches+=len(variant)==e['bytes'] and sha(variant)==e['sha256']
        failures={}
        qsha=sha((src/'99-ADMIN/srcquery.py').read_bytes())
        for operation in bridge.QUERY_INPUTS:
            try:bridge.native_src_query(src,snapshot,current['seal_id'],operation,'QUALIFICATION-ABSENT',expected_source_sha=qsha)
            except ValueError as e:failures[operation]=str(e)
            else:failures[operation]='CONSUMED_FILES_VERIFIED'
        require(any('QUERY_INPUT_SEAL_DRIFT' in x for x in failures.values()),'Stale seal was not detected')
        report['seal_audit']={'entry_counts':dict(status),'drift_paths':drift,'exact_crlf_replay_matches':newline_matches,'query_admission':failures,
          'original_seal_rewritten':False,'external_source_authentication':False}
        return report['seal_audit']
    check('seal-digest-membership-and-stale-query-refusal',seals)
    def predecessor_differential():
        original=subprocess.check_output(['git','-C',str(ROOT),'show',
          report['implementation_base']+':scripts/atelier-native-inheritance-bridge-v1.py'])
        namespace={'__name__':'retained_predecessor_bridge'}
        exec(compile(original,'GIT:retained-predecessor-bridge','exec'),namespace)
        qsha=sha((src/'99-ADMIN/srcquery.py').read_bytes())
        prior=namespace['native_src_query'](src,snapshot,current['seal_id'],'summary',expected_source_sha=qsha)
        require(prior['method']=='ORIGINAL_NATIVE_SRCQUERY_EXECUTED','Predecessor reproduction failed')
        try:bridge.native_src_query(src,snapshot,current['seal_id'],'summary',expected_source_sha=qsha)
        except ValueError as e:require(str(e).startswith('QUERY_INPUT_SEAL_DRIFT:'),'Unexpected refusal')
        else:raise AssertionError('Repaired bridge accepted stale epoch')
        return {'predecessor_bridge_sha256':sha(original),'predecessor_accepted_stale_epoch':True,
          'repaired_bridge_refused_stale_epoch':True,'original_source_bytes_changed':False}
    check('reproduced-predecessor-seal-bypass-and-completed-repair',predecessor_differential)
    def sealed_replay():
        results={};qsha=sha((src/'99-ADMIN/srcquery.py').read_bytes())
        target=rows('05-OPERATIONS/relations/typed-edges.jsonl')[0]['from_id']
        subject=rows('05-OPERATIONS/phase2/authority-jurisdiction-assertions.jsonl')[0]['subject']['id']
        for operation in bridge.QUERY_INPUTS:
            identifier=subject if operation=='authority' else target
            expected=query.summarize(src) if operation=='summary' else getattr(query,operation)(src,identifier,None) if operation=='authority' else getattr(query,operation)(src,identifier)
            actual=bridge.replay_native_src_query(src,snapshot,current['seal_id'],operation,identifier,
                expected_source_sha=qsha,allow_line_ending_replay=True)
            require(actual['result']==expected,'Sealed replay changed native query result')
            require(actual['replay']['receiver_admission'] is False,'Replay crossed admission boundary')
            results[operation]={'native_result_exact':True,'transforms':len(actual['replay']['transforms']),
              'verified_consumed_files':len(actual['source_binding']['verified_inputs'])}
        return {'operations':results,'scope':'EXACT_CONSUMED_SEAL_BYTES_IN_TEMPORARY_COPY',
                'originals_changed':False,'seal_rewritten':False,'external_origin_authenticated':False}
    check('explicit-sealed-byte-replay-four-native-query-operations',sealed_replay)
    def no_promotion():
        require(all(x.get('coordinate_inference_permitted') is False for x in signatures),'Signature promoted')
        require('HOLONOMY' in summary['automatic_promotions_forbidden'],'Holonomy protection absent')
        proposals=rows('06-INSTRUMENTS/phase2/inspired-assay-notebook.jsonl')
        return {'signature_groups':len(signatures),'literal_markers':len(markers),'documentary_proposals':len(proposals),
          'src_native_holonomy_tomography_integration':'NOT_ESTABLISHED','receiver_path':'SYNTHETIC_ONLY_UNCHANGED'}
    check('proposal-holonomy-and-signature-nonpromotion',no_promotion)
    def immutability():
        after=source_manifest(checkout);require(before==after,'Original source changed during qualification')
        return {'all_original_git_objects_match_before_after':True,'files':len(after)}
    check('retained-original-source-immutability',immutability)
    report['passed']=sum(x['status']=='PASS' for x in report['checks']);report['failed']=len(report['checks'])-report['passed']
    report['disposition']='BOUNDED_NATIVE_METHODS_AND_EXPLICIT_SEALED_REPLAY_CONFIRMED_FLIGHTS_HELD' if not report['failed'] else 'QUALIFICATION_FAILURE'
    return report

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--src-checkout',required=True,type=Path);p.add_argument('--output',type=Path)
    a=p.parse_args();result=qualify(a.src_checkout)
    text=json.dumps(result,ensure_ascii=False,sort_keys=True,indent=2,allow_nan=False)+'\n'
    if a.output:
        if a.output.exists():raise SystemExit('Refusing to overwrite qualification receipt')
        a.output.write_text(text,encoding='utf8')
    print(text);return bool(result['failed'])
if __name__=='__main__':sys.dont_write_bytecode=True;raise SystemExit(main())
