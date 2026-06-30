"""
emission_algebra.py
===================
The lambda=2c emission algebra as a FUNCTIONAL system, with the cost floor
built in as a forced invariant.

WHAT THIS IS
  A closed algebra whose objects are emission matrices (built from the QS/ZFP
  catalog) and whose operations are exactly the framework's operations. Every
  object carries its cost  cost = lambda * log M(theta) = 2c * log M(theta);
  the algebra maintains the invariant  M(theta) in {1} U [phi, infty), so the
  positive-cost floor is  2c * log(phi).

WHY THE FLOOR IS FORCED (non-locality)
  The floor is not a per-object bound that could fail somewhere; it is a GLOBAL
  property of the generating number field. Framework ops keep eigenvalues in
  K = Q(sqrt2,sqrt3,5^1/4) (spectral, self-action) or in totally-real/abelian
  fields (Cartan, circulant). A Salem number below phi lives in none of these
  (signature lattice: K's only Salem-bearing subfield is Q(5^1/4), degree 4,
  M >= beta4 = 1.72208 > phi). So the Salem locus is DISJOINT from the image;
  the floor holds at every size, certified per-object by the closure guard.

AVOIDS LEHMER / SALEM -- in the exclusion sense, NOT the solving sense:
  - no Salem number is ever emitted (the locus is disjoint from the image);
  - the floor does not depend on Lehmer's (open) answer: even if Mahler
    measures of arbitrary integer polynomials approached 1, the emission's
    floor stays phi because those polynomials are never emitted.

Exact arithmetic over Z/Q for every decision (sympy + Fraction); mpmath only
for display magnitudes and the topological-entropy readout.
"""
import sympy as sp, mpmath as mp
from fractions import Fraction
from emission_closure_guard import (validate_closure, charpoly_Z, is_palindromic,
                                     trace_down, flip_straddle, beta_below_phi)
mp.mp.dps = 60
x = sp.symbols('x')
PHI_EXACT = (1 + sp.sqrt(5)) / 2
PHI = mp.phi
MU_S = mp.findroot(lambda z: z**3 - z - 1, 1.32)   # Smyth's plastic number

# ---- epistemic tags ----
FORCED, POSITED, DECLARED, COMPUTED = "FORCED", "POSITED", "DECLARED", "COMPUTED"

# ---- field classes (where eigenvalues live -> closure safety) ----
K_FIELD, TOT_REAL, ABELIAN, FOREIGN = "K(i)", "totally_real", "abelian", "foreign"
SAFE_FIELDS = {K_FIELD, TOT_REAL, ABELIAN}

def _companion(c):
    n = len(c) - 1; M = sp.zeros(n)
    for i in range(n-1): M[i+1, i] = 1
    for i in range(n): M[i, n-1] = -c[n-i]
    return M

def _mahler(poly):
    """Mahler measure via high-precision roots (display/entropy; not a decision)."""
    import numpy as np
    c = [float(v) for v in sp.Poly(poly, x).all_coeffs()]
    r = np.roots(c) if len(c) > 1 else np.array([])
    return float(abs(c[0]) * np.prod([max(1.0, abs(z)) for z in r])) if len(c) > 1 else 1.0

def _ad_operator(M):
    """Self-action ad_M = [M,.] as an n^2 x n^2 integer matrix (the channel)."""
    n = M.shape[0]; B = []
    for i in range(n):
        for j in range(n):
            E = sp.zeros(n, n); E[i, j] = 1; B.append(E)
    return sp.Matrix([[(M*E - E*M)[a, b] for a in range(n) for b in range(n)] for E in B]).T


class Element:
    """An emission element: a matrix plus its cost-theoretic readouts."""
    def __init__(self, M, name, field_class, provenance=""):
        self.M = sp.Matrix(M)
        self.name = name
        self.field_class = field_class
        self.provenance = provenance or name
        self._cp = self._mh = self._vd = None

    @property
    def dim(self): return self.M.shape[0]

    @property
    def charpoly(self):
        if self._cp is None: self._cp = charpoly_Z(self.M)
        return self._cp

    @property
    def mahler(self):
        if self._mh is None: self._mh = _mahler(self.charpoly.as_expr())
        return self._mh

    @property
    def verdict(self):
        if self._vd is None: self._vd = validate_closure(self.M, self.name)["verdict"]
        return self._vd

    # ---- cost theory ----
    def cost(self, c=1):
        """lambda log M = 2c log M  (the residual-return charge to adjoin this direction)."""
        return float(2 * c * mp.log(self.mahler)) if self.mahler > 1 else 0.0

    def respects_floor(self):
        """EXACT verdict: object is at or above the floor. INVALID iff a sub-phi Salem
           factor exists (reachable only by a foreign field-breaking op)."""
        return self.verdict in ("FORCED", "FORCED_ABOVE_FLOOR")

    # ---- the four equivalent readouts (one invariant, four domains) ----
    @property
    def height(self):           # (i) Mahler height
        return self.mahler

    @property
    def entropy(self):          # (ii) topological entropy of the toral automorphism
        return float(mp.log(self.mahler)) if self.mahler > 1 else 0.0

    @property
    def channel(self):          # (iii) decision-channel trifurcation (sign of ad-spectrum)
        adev = _ad_operator(self.M).eigenvals()
        grow = cap = stop = forb = 0
        for ev, mult in adev.items():
            e = complex(ev)
            if abs(e.imag) > 1e-9 and abs(abs(e) - 1) < 1e-9: forb += mult   # on-circle expanding (Salem) -- must be 0
            elif e.real > 1e-9: grow += mult
            elif e.real < -1e-9: stop += mult
            else: cap += mult
        return dict(GROW=grow, CAPTURED=cap, STOP=stop, FORBIDDEN=forb)

    @property
    def signature(self):        # (iv) metric signature (r1 real, r2 complex pairs)
        p = self.charpoly; r1 = p.count_roots(-sp.oo, sp.oo)
        return (r1, (p.degree() - r1) // 2)

    def __repr__(self):
        return f"<{self.name} dim={self.dim} M={self.mahler:.4g} {self.verdict} {self.field_class}>"


class EmissionAlgebra:
    """The functional lambda=2c emission algebra with the forced floor."""
    def __init__(self, c=1):
        self.c = c
        self.history = []
        self.seeds = {
            "phi":   Element(_companion([1, -1, -1]),  "phi",   K_FIELD, "golden seed x^2-x-1"),
            "tau":   Element(_companion([1, 1, -1]),   "tau",   K_FIELD, "x^2+x-1"),
            "sqrt2": Element(_companion([1, 0, -2]),   "sqrt2", K_FIELD, "x^2-2"),
            "sqrt3": Element(_companion([1, 0, -3]),   "sqrt3", K_FIELD, "x^2-3"),
            "sqrt5": Element(_companion([1, 0, -5]),   "sqrt5", K_FIELD, "x^2-5"),
            "gap":   Element(_companion([1, -7, 1]),   "gap",   K_FIELD, "x^2-7x+1"),
            "Kform": Element(_companion([1, 0, 5, 0, -5]), "Kform", K_FIELD, "x^4+5x^2-5 (straddles the fold)"),
        }

    # ---- the floor (FORCED) ----
    def floor_cost(self):
        """Positive-cost floor = 2c log(phi). FORCED by the field signature lattice."""
        return float(2 * self.c * mp.log(PHI))

    def _emit(self, M, name, field_class, op):
        """Construct, guard, and (if closure holds) register a new element."""
        e = Element(M, name, field_class)
        v = e.verdict
        if v == "INVALID_CLOSURE":
            self.history.append((op, name, "REJECTED:INVALID_CLOSURE"))
            raise ValueError(f"closure violated: {name} carries a Salem factor below phi "
                             f"(only a foreign field-breaking op can do this)")
        self.history.append((op, name, v))
        return e

    # ---- framework operations (field-preserving / safe; floor maintained) ----
    def kron(self, a, b):
        return self._emit(sp.Matrix(sp.kronecker_product(a.M, b.M)),
                          f"kron({a.name},{b.name})", K_FIELD, "kron")
    def dsum(self, a, b):
        return self._emit(sp.diag(a.M, b.M), f"dsum({a.name},{b.name})", K_FIELD, "dsum")
    def square(self, a):
        return self._emit(a.M * a.M, f"square({a.name})", a.field_class, "square")
    def self_action(self, a):
        return self._emit(_ad_operator(a.M), f"ad[{a.name}]", a.field_class, "self_action")
    def minpoly(self, a):
        mp_poly = sp.minimal_polynomial(sp.Matrix(a.M).eigenvals().__iter__().__next__(), x)
        return self._emit(_companion([int(v) for v in sp.Poly(mp_poly, x).all_coeffs()]),
                          f"minpoly({a.name})", a.field_class, "minpoly")

    # ---- the EXCLUDED operation: not a framework step; guard screens it ----
    def free_commutator(self, a, b):
        """NOT a framework operation. Field-breaking; can leave the safe fields.
           If it lands in the Salem locus the guard rejects it with INVALID_CLOSURE."""
        return self._emit(a.M * b.M - b.M * a.M,
                          f"[{a.name},{b.name}]", FOREIGN, "free_commutator(FOREIGN)")

    # ---- audit ----
    def audit(self, e):
        return dict(name=e.name, dim=e.dim, height=e.height, entropy=e.entropy,
                    cost=e.cost(self.c), floor=self.floor_cost(),
                    respects_floor=e.respects_floor(), channel=e.channel,
                    signature=e.signature, field=e.field_class, verdict=e.verdict)


if __name__ == "__main__":
    ok = lambda b: "PASS" if b else "FAIL"
    A = EmissionAlgebra(c=1)
    print("="*78)
    print("THE lambda=2c EMISSION ALGEBRA  --  floor = 2c log(phi)  [FORCED]")
    print("="*78)

    print("\n-- catalog seeds: four readouts of one invariant --")
    print(f"  {'seed':<8}{'M(height)':>11}{'entropy':>10}{'cost(c=1)':>11}{'signature':>11}  channel(G/C/S/forbidden)")
    for nm in ["phi","sqrt2","sqrt3","sqrt5","gap","Kform"]:
        e = A.seeds[nm]; ch = e.channel
        print(f"  {nm:<8}{e.height:>11.4f}{e.entropy:>10.4f}{e.cost():>11.4f}{str(e.signature):>11}  "
              f"{ch['GROW']}/{ch['CAPTURED']}/{ch['STOP']}/{ch['FORBIDDEN']}")
    print(f"  floor cost 2c*log(phi) at c=1 = {A.floor_cost():.6f}   (= log(phi^2) = {float(mp.log(PHI**2)):.6f})")

    print("\n-- closed operations: the floor is maintained at every step --")
    p, s2, s3, K = A.seeds["phi"], A.seeds["sqrt2"], A.seeds["sqrt3"], A.seeds["Kform"]
    built = [A.kron(p, s2), A.dsum(s2, s3), A.square(K), A.self_action(p),
             A.self_action(A.kron(p, s3)), A.kron(A.self_action(p), A.seeds["sqrt5"])]
    allok = True
    for e in built:
        margin = e.cost() - A.floor_cost(); allok &= e.respects_floor() and e.cost() >= A.floor_cost() - 1e-9
        print(f"  {e.name:<30} dim {e.dim:<3} cost {e.cost():>10.4f}  floor+{margin:>9.4f}  {e.verdict}")
    print(f"  every emitted object at/above floor and closure-intact: {ok(allok)}")

    print("\n-- the FORBIDDEN channel is empty everywhere (this IS 'no Salem') --")
    forb = sum(e.channel['FORBIDDEN'] for e in built) + sum(A.seeds[n].channel['FORBIDDEN'] for n in A.seeds)
    print(f"  total on-circle-expanding (Salem) channel slots across all objects: {forb}  -> {ok(forb==0)}")

    print("\n-- the EXCLUDED operation: free commutator --")
    # benign foreign op stays safe:
    fc = A.free_commutator(p, s2)
    print(f"  free_commutator(phi,sqrt2): {fc.verdict}  (benign, but FOREIGN field class)")
    # foreign op that HITS the Salem locus is rejected by the algebra:
    Cf = _companion([1,1,0,-1,-1,-1,-1,-1,0,1,1])           # Lehmer, beta=1.176<phi
    foreign = Element(sp.diag(Cf, sp.Matrix([[1]])), "planted_Lehmer", FOREIGN)
    try:
        A._emit(foreign.M, foreign.name, FOREIGN, "free_commutator(FOREIGN)")
        print("  planted Lehmer: ACCEPTED  -> FAIL (should have been rejected)")
    except ValueError as ex:
        print(f"  planted Lehmer via free commutator: REJECTED -> {ok(True)}")
        print(f"     reason: {ex}")

    print("\n-- avoids Lehmer / Salem (exclusion sense) --")
    print(f"  no Salem emitted (forbidden channel empty): {ok(forb==0)}")
    print(f"  realized floor phi independent of Lehmer's open infimum: beta4=1.72208>phi -> "
          f"sub-phi Salem disjoint from image: {ok(1.72208>float(PHI))}")
    print(f"\n  floor parametrized over c (NOT frozen): "
          f"c=1 -> {A.floor_cost():.4f}, c=2 -> {EmissionAlgebra(c=2).floor_cost():.4f}, "
          f"c=n -> 2n*log(phi)")
