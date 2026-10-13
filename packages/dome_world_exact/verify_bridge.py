#!/usr/bin/env python3
"""
verify_bridge.py -- one-command verification for the Dome-World x Aperture x Vector-Substrate bridge.

Runs, in order:
  ENV  -- python >= 3.10, and mpmath (engine) + sympy (bridges) + pytest (tests) importable
  A    -- the shipped residual-learner engine's OWN tests (engine/test_*.py)        expect 34 passed
  B    -- the three bridge demos, each checked for its load-bearing output markers

Exits 0 IFF everything is green, so it doubles as a CI gate. A genuine failure names the
step that failed -- investigate it, do not hand-wave it. No network is required.

    python3 verify_bridge.py
"""
from __future__ import annotations
import os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ENGINE = os.path.join(HERE, "engine")
BRIDGE = os.path.join(HERE, "bridge")


def c(s, code):  # color only on a tty
    return f"\033[{code}m{s}\033[0m" if sys.stdout.isatty() else s
def ok(s):  return c(s, "32")
def bad(s): return c(s, "31")
def head(s):return c(s, "1;36")


def rule(t):
    print("\n" + "=" * 78 + f"\n  {head(t)}\n" + "=" * 78)


def run(cmd, cwd=None):
    p = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    return p.returncode, (p.stdout or "") + (p.stderr or "")


def env_check():
    rule("ENV")
    okp = sys.version_info >= (3, 10)
    print(f"  python {sys.version.split()[0]}  {'ok' if okp else 'TOO OLD (need 3.10+)'}")
    for mod, why in [("mpmath", "engine: capacity"), ("sympy", "bridges"), ("pytest", "engine tests")]:
        try:
            m = __import__(mod)
            print(f"  {mod:8} {getattr(m,'__version__','?'):9} importable   ({why})")
        except Exception as e:
            print(f"  {mod:8} {bad('MISSING')}    ({why}: pip install {mod})  [{e.__class__.__name__}]")
            okp = False
    return okp


def engine_tests():
    rule("PART A -- residual-learner engine tests (the real, verified modules)")
    rc, out = run([sys.executable, "-m", "pytest", ".", "-q", "-p", "no:cacheprovider"], cwd=ENGINE)
    last = next((l for l in reversed(out.splitlines()) if l.strip()), "")
    print("  " + (ok(last) if rc == 0 else bad(last)))
    if rc != 0:
        print(out[-1500:])
    return rc == 0


def bridge_demos():
    rule("PART B -- bridge + trainer demos (exact decisions; markers checked)")
    checks = [
        ("bridge/phason_gate_exact.py", [
            "geometry verification: ALL PASS",
            "CUSTODY PHASON FLIP",
        ]),
        ("bridge/vsub_aperture_training_bridge.py", [
            "det G == disc(f): True",
            '"grade": "FORCED"',
            '"grade": "CONSTRUCTION"',
        ]),
        ("bridge/aperture_residual_bridge.py", [
            '"projection_residual_before": "96"',
            '"grade": "FORCED"',
            '"grade": "CONSTRUCTION"',
            "witness chain intact across both steps: True",
        ]),
        ("trainer/trainer_demo.py", [
            "CONSTRUCTION",
            '"growth_events": 1',
            "SESSION OK: True",
        ]),
    ]
    allok = True
    for relpath, markers in checks:
        rc, out = run([sys.executable, os.path.join(HERE, relpath)])
        missing = [m for m in markers if m not in out]
        good = rc == 0 and not missing
        allok = allok and good
        print(f"  {relpath:40} {ok('PASS') if good else bad('FAIL')}"
              + ("" if good else bad(f"  missing: {missing or ['nonzero exit']}")))
        if not good:
            print(out[-1200:])
    return allok


def main():
    e = env_check()
    if not e:
        print(bad("\n  Missing a required dependency -- see requirements.txt, then re-run."))
        return 2
    a = engine_tests()
    b = bridge_demos()
    rule("BOTTOM LINE")
    print("  engine tests : " + (ok("GREEN") if a else bad("RED")))
    print("  bridge demos : " + (ok("GREEN") if b else bad("RED")))
    print()
    if a and b:
        print(ok("  ALL GREEN. Exact training engine + bridges run end-to-end."))
        return 0
    print(bad("  NOT all green -- inspect the step named above."))
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
