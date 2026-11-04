#!/usr/bin/env python3
"""Pre-registered vague-to-specific retrieval quality evaluation.

Gold relevance must be independently annotated before seeing ranked outputs.
Source-free software tests do not establish model quality on real corpora.
"""
from __future__ import annotations
import argparse
import json
import statistics
from pathlib import Path

ESTATES=("SRC","EMSTD613","WENDBINE")
def benchmark(cases,rankings,*,k=20):
    if not isinstance(cases,list) or len(cases)<9 or not 1<=k<=100:
        raise ValueError("HELDOUT_BENCHMARK_MINIMUM_NINE")
    ids=set();by_estate={v:[] for v in ESTATES};results=[]
    for case in cases:
        cid=case.get("query_id")
        target=case.get("target_estate")
        if not isinstance(cid,str) or not cid or cid in ids or target not in ESTATES:
            raise ValueError("BENCHMARK_QUERY_ID_OR_ESTATE_INVALID")
        ids.add(cid)
        if case.get("difficulty") not in ("VAGUE","INTERMEDIATE","SPECIFIC") or not isinstance(case.get("query"),str):
            raise ValueError("BENCHMARK_QUERY_CLASS_REQUIRED")
        gold=case.get("relevant_source_ids")
        decoys=case.get("decoy_source_ids")
        if not isinstance(gold,list) or not gold or not all(isinstance(x,str) for x in gold) or \
           not isinstance(decoys,list) or not decoys or any(x in gold for x in decoys):
            raise ValueError("RELEVANCE_AND_DECOY_CONTROLS_REQUIRED")
        rows=rankings.get(cid)
        if not isinstance(rows,list):raise ValueError("MISSING_INDEPENDENT_MODEL_RANKING")
        ranked=[]
        for row in rows:
            if row.get("estate") not in ESTATES or not isinstance(row.get("source_id"),str) or \
               row.get("retrieval_class")!="LOCAL_SEMANTIC_CANDIDATE_NO_RELATION_PROMOTION":
                raise ValueError("RANKING_EVIDENCE_CLASS_INVALID")
            ref=(row["estate"],row["source_id"])
            if ref not in ranked:ranked.append(ref)
            if len(ranked)>=k:break
        wanted={(target,x) for x in gold}
        decoy={(target,x) for x in decoys}
        recall=len(wanted.intersection(ranked))/len(wanted)
        rank=next((i+1 for i,ref in enumerate(ranked) if ref in wanted),None)
        event={"query_id":cid,"target_estate":target,"difficulty":case["difficulty"],
            "recall_at_k":recall,"reciprocal_rank":1/rank if rank else 0.0,
            "decoy_in_top_k":bool(decoy.intersection(ranked)),
            "retrieved_unique_source_ids":len(ranked)}
        by_estate[target].append(event);results.append(event)
    for estate,rows in by_estate.items():
        if len(rows)<3 or not any(row["difficulty"]=="VAGUE" for row in rows):
            raise ValueError("BENCHMARK_ESTATE_COVERAGE_INSUFFICIENT:"+estate)
    groups={estate:{"queries":len(rows),
         "mean_recall_at_k":round(statistics.mean(x["recall_at_k"] for x in rows),4),
         "mean_reciprocal_rank":round(statistics.mean(x["reciprocal_rank"] for x in rows),4),
         "decoy_hit_count":sum(x["decoy_in_top_k"] for x in rows)}
         for estate,rows in by_estate.items()}
    return {"schema":"td613.atelier-semantic-parity-benchmark/v1",
       "at_k":k,"by_estate":groups,"individual_queries":results,
       "machine_result_status":"PERFORMANCE_MEASURED_RELEVANCE_HUMAN_GATED",
       "automatic_parity_certification":False,
       "requires_gold_registration_before_model_output":True}

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--preregistered-gold",type=Path,required=True)
    p.add_argument("--local-ranked-output",type=Path,required=True)
    p.add_argument("--k",type=int,default=20)
    a=p.parse_args()
    for path in [a.preregistered_gold,a.local_ranked_output]:
        if not path.is_absolute() or not path.is_file() or path.is_symlink():
            raise ValueError("OPERATOR_LOCAL_BENCHMARK_FILE_REQUIRED")
    gold=json.loads(a.preregistered_gold.read_text("utf8"))
    if gold.get("schema")!="td613.atelier-gold-queries/v1" or not gold.get("preregistered_at_utc"):
        raise ValueError("PREREGISTERED_GOLD_SCHEMA_OR_TIME_REQUIRED")
    ranked=json.loads(a.local_ranked_output.read_text("utf8"))
    print(json.dumps(benchmark(gold["cases"],ranked,k=a.k),indent=2))
if __name__=="__main__":main()
