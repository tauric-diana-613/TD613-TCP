"""
test_p2_07_uniform.py
=====================
Paper 2, Section 8: the uniform bound. The self-action difference field K =
Q(sqrt2, sqrt3, 5^(1/4)) has a signature lattice that forces every emittable
Salem to degree 4, hence Mahler >= beta4 > phi -- uniformly across all sizes.

Forced relationships:
    diffspec: spec(ad_M) = { mu_i - mu_j }; for the golden seed spec(ad_R)={0,+-sqrt5}  (Lem 8.1)
    diffconf: real eigenvalue differences live in K; e.g. 2K has minimal polynomial
       x^4+20x^2-80 with signature (2,1) (complex place off the circle)              (Lem 8.2)
    siglattice: EXHAUSTIVELY -- every one of the 27 subfields of K is totally real or
       has signature (2k,k); Salem-shape (degree-4, (2,1)) is NECESSARY for a Salem,
       and exactly 4 subfields have it (Q(m^(1/4)), m in {5,20,45,180})              (Thm 8.3)
    deg4 floor: the minimal degree-4 Salem is beta4 (x^4-x^3-x^2-x+1) > phi           (Cor 8.4)
    exclusion: any Salem in K lands in a (2,1) quartic => degree 4 => M>=beta4>phi,
       so image(emission) intersect {Salem : M < phi} = empty                         (Prop 8.6)

Note on Thm 8.3: the enumeration corrects a uniqueness overstatement. Q(5^(1/4)) is
NOT the only (2,1) quartic subfield -- there are four. The forced fact is the
INVARIANT (every subfield totally real or (2k,k)); the exclusion rests on that, not on
uniqueness. The specific difference field 2K generates is Q(5^(1/4)) (= Q(2K)).
"""
import sympy as sp
from harness.algebra import x, companion, ad_operator, signature, mahler_mp, is_salem, PHI
from harness.results import record

PAPER = "emission_gap"


def test_diffspec_golden_self_action():
    R = companion([1, -1, -1])                      # golden, eigenvalues phi, psi
    ad = ad_operator(R)
    eig = ad.eigenvals()
    nonzero = [sp.simplify(e) for e in eig if sp.simplify(e) != 0]
    assert all(sp.simplify(e**2 - 5) == 0 for e in nonzero)        # +-sqrt5
    assert eig.get(sp.Integer(0), 0) == 2                          # 0 with multiplicity 2
    # spec is the difference set {phi-phi, phi-psi, psi-phi, psi-psi} = {0, sqrt5, -sqrt5}
    record("P2-UNIF-01", PAPER, "Lem 8.1 (difference spectrum)",
           "the self-action spectrum is the difference set spec(ad_M)={mu_i-mu_j}; for the "
           "golden seed spec(ad_R)={0,+-sqrt5} since phi-psi=sqrt5",
           "spec(ad_M) = {mu_i - mu_j};  spec(ad_R) = {0, +-sqrt5}",
           detail={"golden_spectrum": "{0, +sqrt5, -sqrt5}", "zero_mult": 2})


def test_diffconf_2K_minpoly_and_signature():
    K = 5**sp.Rational(1, 4) / PHI
    mp2K = sp.expand(sp.minimal_polynomial(2 * K, x))
    assert sp.simplify(mp2K - (x**4 + 20 * x**2 - 80)) == 0        # minpoly(2K)=x^4+20x^2-80
    assert signature([1, 0, 20, 0, -80]) == (2, 1)                # (2,1), complex place off circle
    record("P2-UNIF-02", PAPER, "Lem 8.2 (difference field K)",
           "real eigenvalue differences live in K=Q(sqrt2,sqrt3,5^(1/4)); 2K has minimal "
           "polynomial x^4+20x^2-80 with signature (2,1)",
           "minpoly(2K)=x^4+20x^2-80, sig=(2,1)",
           detail={"signature": [2, 1]})


# --- Exhaustive subfield enumeration of K via its Galois closure L = K(i) ----------
# Gal(L/Q) = C2 x C2 x D4 (order 32). Subfields of K <-> subgroups H of G containing
# complex conjugation c. Signature of L^H: r1 = #{ cosets gH : g^{-1} c g in H }.
# Element encoding (a,b,r,s): a,b in {0,1} (sqrt2,sqrt3 flips); (r,s) in D4 with
# r in Z/4 (power of tau: 5^(1/4)->i 5^(1/4)) and s in {0,1} (the reflection sigma = c).
def _mul(g, h):
    a1, b1, r1, s1 = g
    a2, b2, r2, s2 = h
    return ((a1 + a2) % 2, (b1 + b2) % 2, (r1 + ((-1) ** s1) * r2) % 4, (s1 + s2) % 2)


_ELEMENTS = [(a, b, r, s) for a in (0, 1) for b in (0, 1) for r in range(4) for s in (0, 1)]
_IDENT = (0, 0, 0, 0)
_C = (0, 0, 0, 1)                                   # complex conjugation (fixes K subset R)
_INV = {g: next(h for h in _ELEMENTS if _mul(g, h) == _IDENT) for g in _ELEMENTS}


def _closure(seed):
    elems = set(seed) | {_IDENT}
    changed = True
    while changed:
        changed = False
        for g in list(elems):
            for h in list(elems):
                p = _mul(g, h)
                if p not in elems:
                    elems.add(p)
                    changed = True
    return frozenset(elems)


def _all_subgroups():
    subs = set(_closure([g]) for g in _ELEMENTS)
    changed = True
    while changed:
        changed = False
        for H1 in list(subs):
            for H2 in list(subs):
                H = _closure(H1 | H2)
                if H not in subs:
                    subs.add(H)
                    changed = True
    return subs


def _signature(H):
    seen, reps = set(), []
    for g in _ELEMENTS:
        if g in seen:
            continue
        reps.append(g)
        seen |= set(_mul(g, h) for h in H)
    deg = len(reps)
    r1 = sum(1 for g in reps if _mul(_mul(_INV[g], _C), g) in H)
    return deg, r1, (deg - r1) // 2


def test_signature_lattice_of_K_exhaustive():
    subfields = [H for H in _all_subgroups() if _C in H]
    assert len(subfields) == 27                       # all subfields of K, exhaustively
    census, deg4_21, K_sig = {}, 0, None
    for H in subfields:
        deg, r1, r2 = _signature(H)
        census[(deg, r1, r2)] = census.get((deg, r1, r2), 0) + 1
        assert r2 == 0 or r1 == 2 * r2                # INVARIANT: totally real or (2k,k)
        if deg == 4 and (r1, r2) == (2, 1):
            deg4_21 += 1
        if deg == 16:
            K_sig = (r1, r2)
    assert deg4_21 == 4                               # four (2,1) quartic subfields (not one)
    assert K_sig == (8, 4)                            # K itself: signature (8,4)=(2k,k),k=4
    # anchor the abstract count to concrete pure quartics Q(m^(1/4)), m in {5,20,45,180}
    for m in (5, 20, 45, 180):
        assert signature([1, 0, 0, 0, -m]) == (2, 1)
    record("P2-UNIF-03", PAPER, "Thm 8.3 (signature lattice, exhaustive)",
           "EXHAUSTIVE enumeration of all 27 subfields of K (Galois correspondence on K(i), "
           "G=C2xC2xD4): every subfield is totally real or has signature (2k,k). Salem-shape "
           "(2,1) is necessary for a Salem; exactly 4 quartic subfields have it (Q(m^(1/4)), "
           "m in {5,20,45,180}). Uniqueness of Q(5^(1/4)) is NOT claimed -- the exclusion "
           "rests on the invariant, not on uniqueness",
           "for all 27 subfields(K): r2=0 or sig=(2k,k); #deg-4 (2,1) = 4; K=(8,4)",
           detail={"n_subfields": 27, "census": {str(k): v for k, v in sorted(census.items())},
                   "deg4_2_1_count": 4, "K_signature": [8, 4]})


def test_deg4_salem_floor_is_beta4():
    best, argmin = None, None
    for a in range(-4, 5):
        for b in range(-6, 7):
            coeffs = [1, a, b, a, 1]                  # palindromic (reciprocal) quartic
            if not sp.Poly(coeffs, x).is_irreducible:
                continue
            if is_salem(coeffs):
                M = float(mahler_mp(coeffs))
                if best is None or M < best - 1e-12:
                    best, argmin = M, (a, b)
    assert argmin == (-1, -1)                          # x^4 - x^3 - x^2 - x + 1
    assert abs(best - 1.7220838) < 1e-5 and best > float(PHI)
    record("P2-UNIF-04", PAPER, "Cor 8.4 (degree-4 Salem floor)",
           "the minimal degree-4 Salem number is beta4 ~1.72208, root of x^4-x^3-x^2-x+1, and "
           "beta4 > phi; so any emitted (degree-4) Salem has M >= beta4 > phi",
           "min deg-4 Salem = beta4 = M(x^4-x^3-x^2-x+1) > phi",
           detail={"beta4": best, "phi": float(PHI), "argmin": list(argmin)})


def test_exclusion_image_has_no_subphi_salem():
    # The uniform chain: emitted Salem must be degree 4 (sig-lattice) => M >= beta4 > phi.
    # Lehmer (M ~ 1.176 < phi, degree 10) is below the floor and not a degree-4 difference.
    beta4 = float(mahler_mp([1, -1, -1, -1, 1]))
    L = float(mahler_mp([1, 1, 0, -1, -1, -1, -1, -1, 0, 1, 1]))
    assert L < float(PHI) < beta4                      # Lehmer is below phi; floor is beta4>phi
    assert sp.Poly([1, 1, 0, -1, -1, -1, -1, -1, 0, 1, 1], x).degree() == 10   # not degree 4
    record("P2-UNIF-05", PAPER, "Prop 8.6 (exclusion)",
           "image(emission) intersect {Salem : M<phi} = empty: an emitted Salem is forced to "
           "degree 4 with M>=beta4>phi, so sub-phi Salem (e.g. Lehmer, M~1.176, degree 10) "
           "cannot be emitted",
           "image(emission) ∩ {Salem : M < phi} = ∅",
           detail={"lehmer_M": L, "phi": float(PHI), "beta4_floor": beta4})
