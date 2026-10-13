"""
test_p1_03_frameshift.py
========================
Paper 1, Section 7: the frame-shift conformal constant.

Forced relationship:
    2cC = sqrt(1+4C)  =>  c = sqrt(1+4C)/(2C)        (Def 7.1 / eq:frameshift)
    at the golden gate C=1:  c = sqrt5/2,  lambda = 2c = sqrt5 = phi - psi
"""
import sympy as sp
from harness.algebra import PHI, PSI
from harness.results import record

PAPER = "lambda_2c"
c, C = sp.symbols('c C', positive=True)


def test_frameshift_solution():
    sol = sp.solve(sp.Eq(2 * c * C, sp.sqrt(1 + 4 * C)), c)
    cfs = [s for s in sol if s != 0][0]
    assert sp.simplify(cfs - sp.sqrt(1 + 4 * C) / (2 * C)) == 0
    record("P1-FRAME-01", PAPER, "Def 7.1 / eq:frameshift",
           "the gate balance 2cC = sqrt(1+4C) solves to the frame-shift constant "
           "c = sqrt(1+4C)/(2C)",
           "c = sqrt(1+4C)/(2C)",
           detail={"c_frame": "sqrt(1+4C)/(2C)"})


def test_golden_value():
    cfs = sp.sqrt(1 + 4 * C) / (2 * C)
    c1 = sp.simplify(cfs.subs(C, 1))
    assert sp.simplify(c1 - sp.sqrt(5) / 2) == 0
    assert sp.simplify(2 * c1 - sp.sqrt(5)) == 0
    assert sp.simplify(sp.sqrt(5) - (PHI - PSI)) == 0      # lambda = sqrt5 = phi - psi
    record("P1-FRAME-02", PAPER, "eq:frameshift at C=1",
           "at the golden gate C=1 the frame-shift gives c=sqrt5/2 and lambda=2c=sqrt5=phi-psi",
           "c(1)=sqrt5/2, lambda=sqrt5=phi-psi",
           detail={"c": float(sp.sqrt(5) / 2), "lambda": float(sp.sqrt(5))})
