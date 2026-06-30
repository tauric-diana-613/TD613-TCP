"""
conftest.py  --  pytest configuration for the verification suite.

* Puts the package root on sys.path so `from harness... import ...` works whether
  pytest is launched from the root or via the orchestrator.
* Initializes the shared results JSON at session start (unless the orchestrator
  already did, signalled by RESULTS_NO_INIT=1), and finalizes it at session end.
"""
import os
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from harness.results import init_results, finalize  # noqa: E402


def pytest_sessionstart(session):
    if os.environ.get("RESULTS_NO_INIT") != "1":
        init_results(meta={"trigger": "pytest", "rootdir": ROOT})


def pytest_sessionfinish(session, exitstatus):
    finalize(summary={"pytest_exitstatus": int(exitstatus)})
