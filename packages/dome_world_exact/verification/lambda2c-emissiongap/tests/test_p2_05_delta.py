"""
test_p2_05_delta.py
===================
Paper 2, Section 6: the delta -- a decidable trace-down (Sturm) certificate for
whether a reciprocal factor emits a Salem number.

Forced relationships:
    trace-down: R(x) = x^m T(x + 1/x) for reciprocal R of degree 2m             (Def 6.1)
    salemflip : R (irreducible, reciprocal, deg 2m>=4) is Salem  <=>  T is
       totally real with exactly one root in (2, inf) and m-1 in (-2, 2)         (Lem 6.2)
    delta     : M emits a Salem iff some reciprocal factor's T straddles t=2     (Thm 6.3)
    specflip  : spectral on-circle eigenvalues (4th roots of unity) have
       trace-downs in {2, 0, -2}, never astride (2, inf)                         (Prop 6.4)
"""
import sympy as sp
from harness.algebra import x, t, trace_down, flip_straddle, is_salem
from harness.results import record

PAPER = "emission_gap"


def test_trace_down_reconstruction():
    # for R reciprocal of degree 2m, R(x) = x^m T(x + 1/x). Verify on beta4.
    b4 = [1, -1, -1, -1, 1]                         # x^4 - x^3 - x^2 - x + 1, m=2
    T = trace_down(b4)
    m = 2
    recon = sp.expand(x**m * T.as_expr().subs(t, x + 1 / x))
    assert sp.simplify(recon - sp.Poly(b4, x).as_expr()) == 0
    record("P2-DELTA-01", PAPER, "Def 6.1 (trace-down)",
           "the trace-down T satisfies R(x)=x^m T(x+1/x) for reciprocal R of degree 2m; "
           "verified by reconstructing x^4-x^3-x^2-x+1 from its trace-down",
           "R(x) = x^m T(x + 1/x)",
           detail={"seed": "x^4-x^3-x^2-x+1", "m": 2})


def test_salemflip_straddle():
    # beta4 and Lehmer are Salem: their trace-downs straddle t=2.
    for coeffs, name in (([1, -1, -1, -1, 1], "beta4"),
                         ([1, 1, 0, -1, -1, -1, -1, -1, 0, 1, 1], "Lehmer")):
        straddle, counts = flip_straddle(coeffs)
        assert straddle and counts["above"] == 1     # exactly one trace-down root > 2
        assert is_salem(coeffs)
    record("P2-DELTA-02", PAPER, "Lem 6.2 (salem flip)",
           "a Salem polynomial's trace-down is totally real with exactly one root in (2,inf) "
           "and the rest in (-2,2); verified for beta4 and Lehmer",
           "Salem <=> T totally real, one root in (2,inf), m-1 in (-2,2)",
           detail={"checked": ["beta4", "Lehmer"]})


def test_delta_battery():
    # delta theorem: Salem iff straddle. Battery of (poly, expected_salem).
    battery = {
        "beta4 (Salem)":            ([1, -1, -1, -1, 1], True),
        "cyclotomic x^4+x^3+x^2+x+1": ([1, 1, 1, 1, 1], False),   # roots of unity, on circle
        "biquadratic x^4-10x^2+1":  ([1, 0, -10, 0, 1], False),   # totally real, not Salem
        "Lehmer (Salem)":           ([1, 1, 0, -1, -1, -1, -1, -1, 0, 1, 1], True),
    }
    for nm, (coeffs, expect) in battery.items():
        straddle, _ = flip_straddle(coeffs)
        assert straddle == expect == is_salem(coeffs), nm
    record("P2-DELTA-03", PAPER, "Thm 6.3 (delta)",
           "M emits a Salem iff a reciprocal factor's trace-down straddles t=2; the Sturm "
           "certificate agrees with Salem classification across a battery (cyclotomic and "
           "totally-real reciprocals do NOT straddle)",
           "emits Salem <=> trace-down straddles t=2 (Sturm-decidable)",
           detail={"battery": {k: v[1] for k, v in battery.items()}})


def test_specflip_fourth_roots():
    # on-circle 4th roots of unity have trace-down rho(z)=z+1/z in {2, 0, -2}
    vals = {}
    for k, z in enumerate([sp.Integer(1), sp.I, sp.Integer(-1), -sp.I]):
        rho = sp.simplify(z + 1 / z)
        vals[str(z)] = rho
        assert rho in (sp.Integer(2), sp.Integer(0), sp.Integer(-2))
        assert rho <= 2                                # never astride (2, inf)
    record("P2-DELTA-04", PAPER, "Prop 6.4 (spectral flip)",
           "spectral on-circle eigenvalues (4th roots of unity) have trace-downs z+1/z in "
           "{2,0,-2}, never in (2,inf); so spectral operators cannot produce the Salem "
           "straddle",
           "rho({1,i,-1,-i}) = {2,0,-2}, never > 2",
           detail={"trace_downs": {k: str(v) for k, v in vals.items()}})
