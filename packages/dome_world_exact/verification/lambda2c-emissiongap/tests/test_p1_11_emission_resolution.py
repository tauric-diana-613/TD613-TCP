"""
test_p1_11_emission_resolution.py
=================================
Paper 1, Section 15: the reciprocal-seed cost floor is resolved within the system.
Paper 1 states the resolution in the framework's own terms and cites the Emission-
Gap paper for the full proofs (verified independently in the test_p2_* modules).
This module checks Paper 1's in-system forced statements.

Forced relationships:
    the catalog is the 7 seeds; their Mahler measures lie in {1} U [phi, inf), min phi,
       and none is a Salem number                                       (Sec 15.1-15.2)
    Thm 15.x (floor resolved): emittable theta with M>1 has cost lambda log M >= lambda
       log phi > 0; the band (1, mu_S) is disjoint from the catalog measures
"""
import sympy as sp
import mpmath as mp
from harness.algebra import mahler_mp, is_salem, PHI, MU_S
from harness.results import record

PAPER = "lambda_2c"

CATALOG = {
    "phi   x^2-x-1":   [1, -1, -1],
    "tau   x^2+x-1":   [1, 1, -1],
    "sqrt2 x^2-2":     [1, 0, -2],
    "sqrt3 x^2-3":     [1, 0, -3],
    "sqrt5 x^2-5":     [1, 0, -5],
    "gap   x^2-7x+1":  [1, -7, 1],
    "K     x^4+5x^2-5":[1, 0, 5, 0, -5],
}


def test_catalog_measures_and_no_salem():
    measures = {}
    for nm, c in CATALOG.items():
        M = float(mahler_mp(c))
        measures[nm] = M
        assert M >= float(PHI) - 1e-9                  # every measure >= phi
        assert not is_salem(c)                         # no catalog seed is a Salem number
    assert abs(min(measures.values()) - float(PHI)) < 1e-9    # realized minimum is phi
    record("P1-EMIS-01", PAPER, "Sec 15.1-15.2 (catalog)",
           "the catalog's seven seed Mahler measures lie in {1} U [phi, inf) with minimum phi, "
           "and no catalog seed is a Salem number",
           "M(catalog) subset {1} U [phi, inf), min = phi, no Salem",
           detail={"measures": {k: round(v, 5) for k, v in measures.items()}})


def test_floor_resolved_in_system():
    # cost = lambda log M >= lambda log phi > 0; band (1, mu_S) disjoint from catalog measures.
    logphi = float(mp.log(float(PHI)))
    assert logphi > 0
    in_band = [nm for nm, c in CATALOG.items()
               if 1 + 1e-9 < float(mahler_mp(c)) < float(MU_S) - 1e-9]
    assert in_band == []
    record("P1-EMIS-02", PAPER, "Thm 15.x (floor resolved)",
           "for emittable theta with M>1 the cost lambda log M >= lambda log phi > 0; the band "
           "(1, mu_S) is disjoint from the catalog measures (full proof in Emission-Gap paper)",
           "lambda log M >= lambda log phi > 0; (1, mu_S) disjoint from catalog",
           detail={"log_phi": logphi, "catalog_in_(1,mu_S)": in_band})
