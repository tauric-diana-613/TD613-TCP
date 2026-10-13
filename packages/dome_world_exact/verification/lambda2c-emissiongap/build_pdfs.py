#!/usr/bin/env python3
"""
build_pdfs.py
=============
Step 2 of the workflow: render the two canonical LaTeX papers to PDF so the LLM
(and the reader) has the full source context. The PDFs are written to output/.

lambda_2c_paper.tex needs 3 passes (cross-references + the [13] citation to the
companion paper); emission_gap_paper.tex needs 2. If pdflatex is unavailable the
script reports it and exits 0 without failing the run (see README section 9).

Usage:  python build_pdfs.py
"""
import os
import sys
import shutil
import tempfile
import subprocess

ROOT = os.path.dirname(os.path.abspath(__file__))
PAPERS = os.path.join(ROOT, "papers")
OUTPUT = os.path.join(ROOT, "output")

JOBS = [("lambda_2c_paper.tex", 3), ("emission_gap_paper.tex", 2)]


def have_pdflatex():
    return shutil.which("pdflatex") is not None


def _build_one(texname, passes, workdir):
    rc = 0
    for _ in range(passes):
        proc = subprocess.run(
            ["pdflatex", "-interaction=nonstopmode", "-halt-on-error", texname],
            cwd=workdir, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True,
        )
        rc = proc.returncode
        if rc != 0:
            sys.stderr.write(proc.stdout[-2000:])
            break
    return rc


def main():
    os.makedirs(OUTPUT, exist_ok=True)
    if not have_pdflatex():
        print("[build_pdfs] pdflatex not found on PATH.")
        print("[build_pdfs] Install TeX Live to rebuild the papers (README section 9).")
        print("[build_pdfs] Skipping PDF render; the test suite does not depend on it.")
        return 0

    work = tempfile.mkdtemp(prefix="l2c_tex_")
    built = []
    try:
        for texname, passes in JOBS:
            src = os.path.join(PAPERS, texname)
            if not os.path.exists(src):
                print(f"[build_pdfs] missing source: {texname}")
                continue
            shutil.copy(src, work)
            print(f"[build_pdfs] rendering {texname} ({passes} passes) ...")
            rc = _build_one(texname, passes, work)
            pdf = texname.replace(".tex", ".pdf")
            pdf_src = os.path.join(work, pdf)
            if rc == 0 and os.path.exists(pdf_src):
                shutil.copy(pdf_src, os.path.join(OUTPUT, pdf))
                size = os.path.getsize(os.path.join(OUTPUT, pdf))
                built.append((pdf, size))
                print(f"[build_pdfs]   -> output/{pdf} ({size} bytes)")
            else:
                print(f"[build_pdfs]   FAILED to build {pdf} (rc={rc})")
    finally:
        shutil.rmtree(work, ignore_errors=True)

    print(f"[build_pdfs] done: {len(built)}/{len(JOBS)} PDFs in output/")
    return 0 if len(built) == len(JOBS) else 1


if __name__ == "__main__":
    sys.exit(main())
