#!/usr/bin/env python3
"""
run_tests.py
============
Step 3 of the workflow: run the test suite one file at a time (step by step), each
test appending its proven claim to the single shared results JSON. The populated
JSON lands at output/results.json alongside the rendered PDFs.

The shared JSON is initialized ONCE here (with environment metadata); each per-file
pytest invocation runs with RESULTS_NO_INIT=1 so it appends rather than resets.

Usage:  python run_tests.py
"""
import os
import sys
import glob
import subprocess

ROOT = os.path.dirname(os.path.abspath(__file__))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from harness.results import init_results, finalize, results_path  # noqa: E402


def _versions():
    import platform
    v = {"python": platform.python_version()}
    for mod in ("sympy", "mpmath", "numpy", "pytest"):
        try:
            v[mod] = __import__(mod).__version__
        except Exception:
            v[mod] = "missing"
    return v


def _ordered_test_files():
    files = glob.glob(os.path.join(ROOT, "tests", "test_*.py"))
    # constants first, then Paper 1, then Paper 2; zero-padded names sort naturally
    return sorted(files, key=lambda p: os.path.basename(p))


def main():
    os.environ["RESULTS_JSON"] = os.path.join(ROOT, "output", "results.json")
    path = init_results(meta={"trigger": "run_tests.py", "versions": _versions()})
    os.environ["RESULTS_NO_INIT"] = "1"          # per-file runs append, never reset

    env = dict(os.environ)
    overall = 0
    files = _ordered_test_files()
    print(f"[run_tests] {len(files)} test files; results -> {path}\n")
    for tf in files:
        name = os.path.basename(tf)
        print(f"================ {name} ================")
        rc = subprocess.call(
            [sys.executable, "-m", "pytest", tf, "-v", "--no-header",
             "-p", "no:cacheprovider"],
            cwd=ROOT, env=env,
        )
        overall |= rc
        print()

    summary = finalize(summary={"runner": "run_tests.py", "aggregate_exit": overall})
    print("[run_tests] summary:")
    for k, val in (summary or {}).items():
        print(f"    {k}: {val}")
    print(f"[run_tests] populated JSON written to {path}")
    return overall


if __name__ == "__main__":
    sys.exit(main())
