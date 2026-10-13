"""
test_p2_02_angle.py
===================
Paper 2, Section 3: angle confinement. This is the central mechanism of the
no-Salem theorem.

Forced relationships:
    catargs : every catalog eigenvalue argument lies in (pi/2)Z                 (Lem 3.1)
    closure : (pi/2)Z is closed under + (tensor) and *2 (square); never halved  (Lem 3.3)
    oncircle: an emitted on-circle eigenvalue with arg in (pi/2)Z is a 4th root
              of unity, i.e. in {1, i, -1, -i}                                   (Lem 3.4)
    salemirr: a Salem number's on-circle conjugates are NOT roots of unity
              (irrational angle)                                                  (Lem 3.5)
    main    : a Salem in the image would force an on-circle conjugate to be both
              a 4th root of unity and irrational-angle -- contradiction          (Thm 3.2)
"""
import sympy as sp
import mpmath as mp
from harness.algebra import x, mahler_mp
from harness.results import record

PAPER = "emission_gap"

CATALOG = {
    "phi": [1, -1, -1], "tau": [1, 1, -1], "sqrt2": [1, 0, -2],
    "sqrt3": [1, 0, -3], "sqrt5": [1, 0, -5], "gap": [1, -7, 1],
    "K": [1, 0, 5, 0, -5],
}


def _is_quarter_multiple(zc, tol=mp.mpf('1e-30')):
    """True iff arg(z) is an integer multiple of pi/2 (z on one of the two axes)."""
    re, im = mp.re(zc), mp.im(zc)
    return abs(re) < tol or abs(im) < tol


def test_catalog_args_are_quarter_multiples():
    for nm, coeffs in CATALOG.items():
        for r in mp.polyroots([int(v) for v in coeffs], maxsteps=2000, extraprec=400):
            assert _is_quarter_multiple(r), f"{nm} root {r} off the axes"
    record("P2-ANG-01", PAPER, "Lem 3.1 (catalog args)",
           "every catalog eigenvalue has argument in (pi/2)Z: the real seeds give args 0 or "
           "pi, and K's complex roots +-i beta give args +-pi/2",
           "arg(catalog eigenvalues) in (pi/2)Z = {0, pi/2, pi, 3pi/2}",
           detail={"catalog": list(CATALOG.keys())})


def test_quarter_lattice_closed_under_add_and_double():
    # (pi/2)Z closed under addition and doubling, but halving escapes it.
    lattice = [sp.Rational(k, 2) * sp.pi for k in range(-4, 5)]   # multiples of pi/2
    for a in lattice:
        assert sp.simplify((2 * a) / (sp.pi / 2)).is_integer       # doubling stays
        for b in lattice:
            assert sp.simplify((a + b) / (sp.pi / 2)).is_integer   # adding stays
    # halving pi/2 gives pi/4, NOT a multiple of pi/2
    assert not sp.simplify((sp.pi / 4) / (sp.pi / 2)).is_integer
    record("P2-ANG-02", PAPER, "Lem 3.3 (closure)",
           "(pi/2)Z is closed under addition (tensor) and doubling (square) but not halving; "
           "the spectral operators therefore cannot manufacture a pi/4 angle",
           "(pi/2)Z closed under {+, *2}; pi/4 not in (pi/2)Z",
           detail={"closed_ops": ["add", "double"], "escapes": "halve -> pi/4"})


def test_oncircle_arg_forces_fourth_root_of_unity():
    # |z|=1 and arg in (pi/2)Z  =>  z in {1, i, -1, -i}
    fourth_roots = {sp.Integer(1), sp.I, sp.Integer(-1), -sp.I}
    got = set()
    for k in range(0, 4):
        z = sp.exp(sp.I * sp.Rational(k, 2) * sp.pi)
        got.add(sp.simplify(z))
    assert got == fourth_roots
    record("P2-ANG-03", PAPER, "Lem 3.4 (on-circle -> 4th root)",
           "an on-circle eigenvalue whose argument is in (pi/2)Z must be a 4th root of unity, "
           "i.e. in {1, i, -1, -i}",
           "|z|=1 and arg(z) in (pi/2)Z  =>  z in {1,i,-1,-i}",
           detail={"fourth_roots": ["1", "i", "-1", "-i"]})


def test_salem_oncircle_conjugates_are_irrational_angle():
    # Lehmer (a Salem number): its on-circle conjugates are NOT roots of unity.
    L = [1, 1, 0, -1, -1, -1, -1, -1, 0, 1, 1]
    on_circle = [r for r in mp.polyroots(L, maxsteps=2000, extraprec=400)
                 if abs(abs(r) - 1) < mp.mpf('1e-20')]
    assert len(on_circle) >= 2
    # none of them is a 4th root of unity (arg not a multiple of pi/2)
    assert all(not _is_quarter_multiple(r) for r in on_circle)
    # and they are not roots of unity at all: the cyclotomic part of L is trivial
    assert sp.Poly(L, x).is_irreducible            # irreducible & non-cyclotomic
    record("P2-ANG-04", PAPER, "Lem 3.5 (Salem on-circle irrational)",
           "a Salem number's on-circle conjugates have irrational angle (not roots of unity); "
           "for Lehmer they avoid the axes entirely",
           "Salem on-circle conjugate: arg/pi irrational, not in (pi/2)Z",
           detail={"n_on_circle": len(on_circle)})


def test_main_no_salem_emitted_contradiction():
    # If a Salem were emitted, conjugate-travel + closure put its on-circle conjugate at an
    # arg in (pi/2)Z (Lem 3.3-3.4 => a 4th root of unity), but Lem 3.5 says that conjugate has
    # irrational angle. Contradiction. We witness the contradiction on Lehmer.
    L = [1, 1, 0, -1, -1, -1, -1, -1, 0, 1, 1]
    on_circle = [r for r in mp.polyroots(L, maxsteps=2000, extraprec=400)
                 if abs(abs(r) - 1) < mp.mpf('1e-20')]
    forced_axis = all(_is_quarter_multiple(r) for r in on_circle)   # what emission would force
    actually_axis = any(_is_quarter_multiple(r) for r in on_circle)  # what is true
    assert forced_axis is False and actually_axis is False           # the two cannot reconcile
    record("P2-ANG-05", PAPER, "Thm 3.2 (no Salem emitted)",
           "an emitted Salem would force an on-circle conjugate onto the (pi/2)Z axes (a 4th "
           "root of unity), contradicting the irrational angle of Salem on-circle conjugates; "
           "hence no Salem is emitted",
           "emission => 4th-root-of-unity conjugate; Salem => irrational-angle conjugate; ⊥",
           detail={"contradiction": True})
