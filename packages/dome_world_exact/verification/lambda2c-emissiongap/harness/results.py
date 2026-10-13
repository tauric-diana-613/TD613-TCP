"""
harness/results.py
==================
A single shared results document that every test APPENDS to. The path is taken
from the env var RESULTS_JSON (set by the orchestrator); otherwise it defaults to
<package>/output/results.json. The file ships mostly empty (an empty `results`
list) and is populated as the suite runs, landing in `output/` alongside the PDFs.

Each record is one proven claim:
    {
      "test_id":  "P1-IDENT-01",
      "paper":    "lambda_2c" | "emission_gap",
      "locus":    "Thm 3.1 / eq:lambda2c",
      "claim":    "lambda = 2c (the 2 is the inverted 1/2 of the KL quadratic term)",
      "equation": "lambda = 2*c",
      "status":   "FORCED" | "COMPUTED" | "FAILED",
      "detail":   {...}            # exact witnesses
    }
"""
import os
import json
import threading
import datetime

_LOCK = threading.Lock()
_DEFAULT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                        "output", "results.json")


def results_path():
    return os.environ.get("RESULTS_JSON", _DEFAULT)


def _skeleton(meta=None):
    return {
        "suite": "lambda2c-emissiongap-verification",
        "description": "Per-claim exact-arithmetic verification of the two companion papers.",
        "generated_utc": None,
        "completed_utc": None,
        "meta": meta or {},
        "results": [],
    }


def init_results(meta=None, path=None):
    """Reset the shared JSON to an empty skeleton at the start of a run."""
    path = path or results_path()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    doc = _skeleton(meta)
    doc["generated_utc"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    with _LOCK:
        with open(path, "w") as f:
            json.dump(doc, f, indent=2, default=str)
    return path


def record(test_id, paper, locus, claim, equation, status="FORCED", detail=None):
    """Append one proven-claim record to the shared JSON (read-modify-write)."""
    path = results_path()
    rec = {
        "test_id": test_id,
        "paper": paper,
        "locus": locus,
        "claim": claim,
        "equation": equation,
        "status": status,
        "detail": detail or {},
        "logged_utc": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }
    with _LOCK:
        if os.path.exists(path):
            try:
                with open(path) as f:
                    doc = json.load(f)
            except (json.JSONDecodeError, ValueError):
                doc = _skeleton()
        else:
            os.makedirs(os.path.dirname(path), exist_ok=True)
            doc = _skeleton()
            doc["generated_utc"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        doc["results"].append(rec)
        with open(path, "w") as f:
            json.dump(doc, f, indent=2, default=str)
    return rec


def finalize(summary=None):
    """Stamp completion time and an optional summary block at the end of a run."""
    path = results_path()
    with _LOCK:
        if not os.path.exists(path):
            return
        with open(path) as f:
            doc = json.load(f)
        doc["completed_utc"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        results = doc.get("results", [])
        doc["summary"] = {
            "total_claims": len(results),
            "forced": sum(1 for r in results if r["status"] == "FORCED"),
            "computed": sum(1 for r in results if r["status"] == "COMPUTED"),
            "failed": sum(1 for r in results if r["status"] == "FAILED"),
            "by_paper": {
                "lambda_2c": sum(1 for r in results if r["paper"] == "lambda_2c"),
                "emission_gap": sum(1 for r in results if r["paper"] == "emission_gap"),
            },
        }
        if summary:
            doc["summary"].update(summary)
        with open(path, "w") as f:
            json.dump(doc, f, indent=2, default=str)
    return doc.get("summary")
