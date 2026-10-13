#!/usr/bin/env python3
"""
run_all.py
==========
Master orchestrator. Runs the full workflow end to end:

    1. build_pdfs.py  -> renders both papers to output/*.pdf
    2. run_tests.py   -> runs the suite step by step, populating output/results.json

After this completes, output/ contains the two PDFs and the fully populated
results JSON. Equivalent to running the two scripts in sequence.

Usage:  python run_all.py
"""
import sys

import build_pdfs
import run_tests


def main():
    print("########## STEP 2: render papers ##########")
    pdf_rc = build_pdfs.main()
    print("\n########## STEP 3: run verification suite ##########")
    test_rc = run_tests.main()
    print("\n########## DONE ##########")
    print(f"build_pdfs exit={pdf_rc}, run_tests exit={test_rc}")
    # PDF render failure (e.g. no TeX Live) does not fail the verification result.
    return test_rc


if __name__ == "__main__":
    sys.exit(main())
