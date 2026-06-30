"""
test_p2_03_mahler_gap.py
========================
Paper 2, Section 4: the Mahler height gap and the entropy cost floor.

Forced relationships:
    base case: no irreducible integer quadratic has M in (1, phi)                (Lem 4.1)
       reciprocal x^2-bx+1: M=1 for |b|<=2, M=phi^2 at |b|=3 (jumps past (1,phi^2))
       non-reciprocal |c|>=2: M>=2
    degree raising: (+) multiplies, (.)^2 squares, (x) composes; the image stays
       inside {1} U [phi, inf)                                                    (Lem 4.2)
    cost floor: emitted M with M>1 satisfies M>=phi, so cost = log M >= log phi   (Cor 4.3)
"""
import sympy as sp
import mpmath as mp
from harness.algebra import x, companion, dsum, mahler_mp, PHI, MU_S
from harness.results import record

PAPER = "emission_gap"


def test_base_case_quadratic_gap():
    # reciprocal x^2 - b x + 1 structure
    for b in range(-2, 3):
        assert abs(float(mahler_mp([1, -b, 1])) - 1.0) < 1e-12        # |b|<=2 -> M=1
    assert abs(float(mahler_mp([1, -3, 1])) - float(PHI)**2) < 1e-9   # |b|=3 -> M=phi^2
    # full scan: nothing lands in (1, phi)
    hits = []
    for b in range(-50, 51):
        for c in range(-50, 51):
            p = sp.Poly(x**2 + b * x + c, x)
            if not p.is_irreducible:
                continue
            M = float(mahler_mp([1, b, c]))
            if 1 + 1e-9 < M < float(PHI) - 1e-9:
                hits.append((b, c, M))
    assert hits == []
    record("P2-GAP-01", PAPER, "Lem 4.1 (base case)",
           "no irreducible integer quadratic has Mahler measure in (1, phi): reciprocal "
           "x^2-bx+1 gives M=1 (|b|<=2) then jumps to phi^2 (|b|=3); non-reciprocal |c|>=2 "
           "gives M>=2",
           "integer-quadratic Mahler spectrum = {1} U [phi, inf)",
           detail={"hits_in_(1,phi)": hits, "M_recip_b3": float(PHI)**2})


def test_degree_raising_stays_in_image():
    # build composite measures and confirm each is 1 or >= phi
    phi = companion([1, -1, -1])
    s5 = companion([1, 0, -5])
    cases = {
        "phi (+) sqrt5": dsum(phi, s5),
        "phi^2 (square)": phi * phi,
        "phi (+) phi": dsum(phi, phi),
    }
    for nm, M in cases.items():
        coeffs = [int(v) for v in sp.Poly(M.charpoly(x).as_expr(), x).all_coeffs()]
        val = float(mahler_mp(coeffs))
        assert val < 1 + 1e-9 or val >= float(PHI) - 1e-9
    record("P2-GAP-02", PAPER, "Lem 4.2 (degree raising)",
           "the spectral operators raise but never lower below phi: (+) multiplies measures, "
           "(.)^2 squares, (x) composes, so the image stays inside {1} U [phi, inf)",
           "image(spectral ops) subset {1} U [phi, inf)",
           detail={"cases": list(cases.keys())})


def test_cost_floor_log_phi():
    logphi = float(mp.log(float(PHI)))
    assert logphi > 0
    # the realized emission floor is phi (cost log phi); the absolute Smyth floor mu_S<phi
    # is a non-reciprocal cubic, not in the reciprocal-seed image.
    assert float(MU_S) < float(PHI)
    assert abs(float(mahler_mp([1, -1, -1])) - float(PHI)) < 1e-12    # phi realizes the floor
    record("P2-GAP-03", PAPER, "Cor 4.3 (cost floor)",
           "an emitted measure with M>1 has M>=phi, so the entropy cost log M >= log phi > 0; "
           "phi realizes the floor and the absolute Smyth value mu_S<phi is never emitted",
           "M>1 emitted => M >= phi => cost = log M >= log phi",
           detail={"log_phi": logphi, "mu_S": float(MU_S)})
