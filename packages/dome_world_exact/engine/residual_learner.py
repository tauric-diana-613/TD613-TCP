"""residual_learner.py -- T5 Basis Adapter: the first lightweight LOCAL training module.

The smallest thing that demonstrates *dynamic local training on the vector substrate*.
Standard ML fits a dense float parameter vector by gradient descent; this learner does
something different and EXACT: it grows a small dictionary (the forced basis B of
algebraic-integer seeds) by reading residuals. "Capture" (r = x - Px == 0) is the
substrate's word for *learned*; persistent off-axis residual is *novelty*; under a gate,
novelty becomes a NEW exact basis direction. Training here is gated dictionary growth,
not weight-fitting.

This module REUSES the shipped L0 exact core -- it does not reinvent it:
    integral_basis.gram_trace_form   the trace-form metric G (Newton's identities, exact)
    projector.projector_matrix       P = B (B^T G B)^-1 B^T G   (G-orthogonal projector)
    projector.residual               r = x - Px                 (exact)
    projector.residual_norm          <r,r>_G  (exact; == 0 IFF x is captured)
    projector.NO_PROJECTION          singular-basis sentinel
    integral_basis._guard_int_monic  algebraic-integer seed guard (G10)

Modeling choice (documented so it can be redirected): the substrate is ONE fixed ambient
number field K = Q(theta); the "model" is a forced basis B whose columns are the
coordinate vectors (in the power basis of K) of the current algebraic-integer seeds.
Observations are exact coordinate vectors in K. Growth = adjoin a new column to B inside
the SAME K, so the projector (and the basis Gram B^T G B) are re-derived exactly while the
ambient metric G is fixed. The default ambient field is the totally-real Q(sqrt2+sqrt3)
(x^4 - 10x^2 + 1): its trace form is positive-definite, so no nonzero seed is isotropic and
the re-derived projector is never accidentally singular.

GUARDRAILS (this is the MODEL-layer learning loop, deliberately separate from perception):
  * It adapts the MODEL (basis B) ONLY. It NEVER touches the perception engine's dynamical
    state, never imports the KIRA server, sets no engine flags. The closed perception loop
    stays closed (G3 holds by construction here -- this loop writes B, not the engine).
  * Exact (G8): B, G, P, r and every membership decision are Fraction/int. Floats appear
    ONLY in display fields (a centroid norm, a residual-norm preview) -- never in a gate.
  * Algebraic-integers only (G10): every proposed seed is validated monic-integer.
  * Witnessed (G5): each growth event is appended to a sha256 hash-chain.
  * Propose-for-confirm (G2): propose() only SUGGESTS; confirm() is the ONLY method that
    mutates B. observe() and propose() never grow the model.

Pure stdlib (fractions, math, json, hashlib). No numpy. No third-party deps.
"""
from __future__ import annotations

import hashlib
import json
import math
import os
import sys
from dataclasses import dataclass, field
from fractions import Fraction
from typing import Callable, List, Optional, Sequence, Union

# Reuse the shipped L0 exact core (flat modules at the L00M root) ------------- #
_HERE = os.path.dirname(os.path.abspath(__file__))
_ROOT = os.path.dirname(_HERE)
for _p in (_HERE, _ROOT):
    if _p not in sys.path:
        sys.path.insert(0, _p)

import integral_basis as _ib          # noqa: E402  (gram_trace_form, _guard_int_monic, ...)
import projector as _pj               # noqa: E402  (projector_matrix, residual, residual_norm)
from coords_to_minpoly import coords_to_minpoly   # noqa: E402  (A2.P0 exact in-field minpoly via SNF)
from capacity import Budget, capacity_decision, CapacityVerdict   # noqa: E402  (A3 Northcott capacity gate)

Frac = Fraction
NO_PROJECTION = _pj.NO_PROJECTION

Vector = List[Fraction]
Number = Union[int, Fraction]


# --------------------------------------------------------------------------- #
# tiny exact linear algebra (Fraction; no numpy) -- transpose / matvec / RREF
# --------------------------------------------------------------------------- #
def _t(M: Sequence[Sequence[Fraction]]) -> List[List[Fraction]]:
    return [[M[i][j] for i in range(len(M))] for j in range(len(M[0]))]


def _mv(M: Sequence[Sequence[Fraction]], v: Sequence[Fraction]) -> List[Fraction]:
    return [sum(M[i][j] * v[j] for j in range(len(v))) for i in range(len(M))]


def _g_inner(a: Sequence[Fraction], b: Sequence[Fraction], G) -> Fraction:
    """Exact trace-form inner product <a, b>_G = a^T G b."""
    Gb = _mv(G, b)
    return sum(Frac(a[i]) * Gb[i] for i in range(len(a)))


def _g_norm2(a: Sequence[Fraction], G) -> Fraction:
    return _g_inner(a, a, G)


def _rref(M: Sequence[Sequence[Number]]):
    """Reduced row echelon form over Fraction. Returns (R, pivot_columns)."""
    A = [[Frac(x) for x in row] for row in M]
    rows = len(A)
    cols = len(A[0]) if rows else 0
    pivots: List[int] = []
    r = 0
    for col in range(cols):
        piv = None
        for i in range(r, rows):
            if A[i][col] != 0:
                piv = i
                break
        if piv is None:
            continue
        A[r], A[piv] = A[piv], A[r]
        inv = Frac(1) / A[r][col]
        A[r] = [v * inv for v in A[r]]
        for i in range(rows):
            if i != r and A[i][col] != 0:
                f = A[i][col]
                A[i] = [A[i][j] - f * A[r][j] for j in range(cols)]
        pivots.append(col)
        r += 1
        if r == rows:
            break
    return A, pivots


def _nullspace(M: Sequence[Sequence[Number]]) -> List[Vector]:
    """Basis of {v : M v = 0} over Q (exact). Empty list when M has full column rank."""
    R, pivots = _rref(M)
    cols = len(M[0]) if len(M) else 0
    pivot_set = set(pivots)
    basis: List[Vector] = []
    for free in range(cols):
        if free in pivot_set:
            continue
        v = [Frac(0)] * cols
        v[free] = Frac(1)
        for ri, pc in enumerate(pivots):
            v[pc] = -R[ri][free]
        basis.append(v)
    return basis


def _nearest_int(fr: Fraction) -> int:
    """Nearest integer to an exact Fraction, ties-to-even (deterministic, no float)."""
    fr = Frac(fr)
    q, rem = divmod(fr.numerator, fr.denominator)   # fr = q + rem/den, 0 <= rem < den
    twice = 2 * rem
    if twice < fr.denominator:
        return q
    if twice > fr.denominator:
        return q + 1
    return q if q % 2 == 0 else q + 1                # exact half -> even


# --------------------------------------------------------------------------- #
# seed identity: the minimal polynomial of an algebraic integer given by coords
# --------------------------------------------------------------------------- #
def minimal_polynomial_of_coords(coords: Sequence[Number], ambient_min_poly: Sequence[int]) -> List[int]:
    """Monic-integer minimal polynomial (high->low) of alpha = sum coords[i] theta^i in
    K = Q[x]/(ambient_min_poly).

    A2.P1: delegates to the EXACT Smith-normal-form bridge (training/coords_to_minpoly.py, the
    vendored invariant_factors kernel) so the learner and the bridge share ONE source of truth.
    The two agree on every case (test_cross_check_*); the bridge is the kernel-grade computation."""
    return coords_to_minpoly(coords, ambient_min_poly)


def g_orthogonal_integer_vector(columns: Sequence[Sequence[Number]], G) -> Optional[List[int]]:
    """A nonzero integer vector G-orthogonal to every column (for building genuinely off-axis
    observations in demos/tests). Returns None if the columns already span the space."""
    rows = [_mv(G, [Frac(c) for c in col]) for col in columns]   # col^T G == (G col)^T  (G symmetric)
    ns = _nullspace(rows)
    if not ns:
        return None
    v = ns[0]
    denom_lcm = 1
    for f in v:
        denom_lcm = math.lcm(denom_lcm, f.denominator)
    w = [int(f * denom_lcm) for f in v]
    g = 0
    for x in w:
        g = math.gcd(g, abs(x))
    g = g or 1
    return [x // g for x in w]


# --------------------------------------------------------------------------- #
# proposal + witness records
# --------------------------------------------------------------------------- #
@dataclass(frozen=True)
class SeedProposal:
    """A gated SUGGESTION to grow the basis. Carrying it does nothing; only confirm() acts."""
    min_poly: List[int]                 # monic-integer minpoly (high->low) -- the seed identity (G10)
    coords: List[Number]                # EXACT algebraic-integer coords adjoined as a new column of B
    centroid: List[Fraction]            # exact residual-field centroid the seed came from
    streak: int                         # consecutive persistent ticks behind it
    centroid_norm: float                # DISPLAY only (float)
    snap: str = "exact"                 # "exact" = centroid IS an algebraic integer; else "nearest_integer_fallback"
    reason: str = "persistent off-axis residual centroid, calibrated"


# --------------------------------------------------------------------------- #
# the learner
# --------------------------------------------------------------------------- #
class ResidualLearner:
    """Streaming residual reader + gated basis-growth proposer over one ambient field.

      observe(x)  -> None        read r = x - Px, update the residual-field centroid (exact
                                 Welford) + persistence counter. Never mutates the model.
      propose()   -> SeedProposal | None   suggest the nearest monic-integer seed ONLY when
                                 the centroid has persisted >= N ticks AND calibration passes.
                                 Pure query -- never mutates the model.
      confirm(p)  -> dict        the ONLY mutator: adjoin p's seed, re-derive P exactly,
                                 witness the growth, reset the accumulator.
      state()     -> dict        exact snapshot (Fraction/int) + float display fields.
    """

    def __init__(
        self,
        ambient_min_poly: Sequence[int],
        seeds: Sequence[Sequence[Number]],
        *,
        persistence_N: int = 3,
        epsilon: Fraction = Fraction(1, 100),
        height_bound: int = 256,
        degree_bound: Optional[int] = None,
        budget: Optional[Budget] = None,
        calibration_ok: Optional[Callable[[], bool]] = None,
        witness_path: Optional[str] = None,
    ):
        self.ambient_min_poly: List[int] = _ib._guard_int_monic(ambient_min_poly)
        self.degree: int = len(self.ambient_min_poly) - 1
        self._ib = _ib.integral_basis_for(self.ambient_min_poly)
        self._G = _ib.gram_trace_form(self._ib)                  # exact ambient metric (fixed)

        if not seeds:
            raise ValueError("need at least one initial seed (forced basis cannot be empty)")
        self._cols: List[Vector] = [self._as_coords(s) for s in seeds]
        for col in self._cols:                                   # G10: initial seeds algebraic-integer
            minimal_polynomial_of_coords([_require_int(c) for c in col], self.ambient_min_poly)
        self._P = _pj.projector_matrix(self._B_matrix(), self._G)
        if self._P is NO_PROJECTION:
            raise ValueError("initial seeds are not independent (B^T G B singular)")

        self.persistence_N = int(persistence_N)
        self.epsilon = Frac(epsilon)
        self.height_bound = int(height_bound)
        self.degree_bound = degree_bound
        # A3.P1: the Northcott (degree, height) budget supersedes the crude height/degree caps. The
        # default subsumes today's behavior (admits phi / 2sqrt6 / sqrt7); the old bounds map in for
        # back-compat (height_bound -> height_max, degree_bound -> degree_max, default 64).
        self.budget = budget if budget is not None else Budget(
            degree_max=(int(degree_bound) if degree_bound is not None else 64),
            height_max=int(height_bound))
        self._last_verdict: Optional[CapacityVerdict] = None   # the last propose()'s capacity decision
        self._calibration_ok: Callable[[], bool] = calibration_ok or (lambda: True)
        self._witness_path = witness_path

        # residual-field accumulator (exact Welford on the off-axis residual coords)
        self._mean: Vector = [Frac(0)] * self.degree
        self._M2: Vector = [Frac(0)] * self.degree
        self._n_acc: int = 0
        self._streak: int = 0
        self._last_residual: Vector = [Frac(0)] * self.degree
        self._last_residual_norm: Fraction = Frac(0)

        # witness hash-chain (G5)
        self._witness: List[dict] = []
        self._prev_hash: str = "genesis"

    # -- coordinate intake (exact only; G8) --------------------------------- #
    def _as_coords(self, x) -> Vector:
        if hasattr(x, "power_coords"):                           # accept an integral_basis.FieldElement
            x = x.power_coords
        coords = list(x)
        if len(coords) != self.degree:
            raise ValueError(f"observation must have length {self.degree}: {x!r}")
        return [_exact(c) for c in coords]

    def _B_matrix(self) -> List[List[Fraction]]:
        """B as the rows x cols matrix projector_matrix expects (degree x num_seeds)."""
        return _t(self._cols)

    # -- (1) observe -------------------------------------------------------- #
    def observe(self, x) -> None:
        coords = self._as_coords(x)
        r = _pj.residual(coords, self._P)                       # exact r = x - Px
        rn = _pj.residual_norm(coords, self._P, self._G)        # exact <r,r>_G ; ==0 IFF captured
        self._last_residual = r
        self._last_residual_norm = rn

        if rn == 0:                                             # captured -> no persistent novelty
            self._reset_accumulator()
            return

        if self._n_acc == 0:
            self._welford_update(r)
            self._streak = 1
            return

        c2 = _g_norm2(self._mean, self._G)
        if c2 == 0:                                             # centroid collapsed -> restart direction
            self._reset_accumulator()
            self._welford_update(r)
            self._streak = 1
            return

        # exact direction test: is r within epsilon of the established centroid direction?
        # ||r - proj_c r||^2_G  <=  epsilon^2 ||r||^2_G   (all exact Fraction; no float gate)
        coeff = _g_inner(r, self._mean, self._G) / c2
        comp = [r[i] - coeff * self._mean[i] for i in range(self.degree)]
        dev2 = _g_norm2(comp, self._G)
        base2 = _g_norm2(r, self._G)
        if dev2 <= (self.epsilon * self.epsilon) * base2:
            self._welford_update(r)
            self._streak += 1
        else:                                                  # direction changed -> fresh streak
            self._reset_accumulator()
            self._welford_update(r)
            self._streak = 1
        return None

    def _welford_update(self, r: Vector) -> None:
        self._n_acc += 1
        n = self._n_acc
        for i in range(self.degree):
            delta = r[i] - self._mean[i]
            self._mean[i] += delta / n
            delta2 = r[i] - self._mean[i]
            self._M2[i] += delta * delta2

    def _reset_accumulator(self) -> None:
        self._mean = [Frac(0)] * self.degree
        self._M2 = [Frac(0)] * self.degree
        self._n_acc = 0
        self._streak = 0

    # -- (2) propose (pure; never mutates) ---------------------------------- #
    def propose(self) -> Optional[SeedProposal]:
        if self._streak < self.persistence_N:
            return None
        if not self._calibration_ok():                         # G1-style calibration gate (stub)
            return None

        centroid = list(self._mean)                            # exact Fraction centroid
        if all(c == 0 for c in centroid):
            return None

        seed_coords, min_poly, snap = self._seed_from_centroid(centroid)   # A2.P1: exact bridge first
        if min_poly is None:
            return None
        if _pj.residual_norm([Frac(c) for c in seed_coords], self._P, self._G) == 0:
            return None                                        # already in span(B): nothing new
        # A3.P1: the DERIVED Northcott-admissibility gate REPLACES the tuned height/degree caps.
        # GROW iff the seed is Northcott-admissible (degree + height within budget); else REJECT/STOP.
        self._last_verdict = capacity_decision(min_poly, _g_norm2(centroid, self._G), self.budget)
        if self._last_verdict.decision != "GROW":
            return None                                        # REJECT (over budget) or STOP (below floor)
        return SeedProposal(
            min_poly=min_poly,
            coords=seed_coords,
            centroid=centroid,
            streak=self._streak,
            centroid_norm=math.sqrt(float(_g_norm2(centroid, self._G))),
            snap=snap,
        )

    def _seed_from_centroid(self, centroid):
        """A2.P1 -- (seed_coords, min_poly, snap). EXACT path: the persistent centroid is itself an
        exact element of K; if it is an algebraic integer, its coords ARE the real seed and
        coords_to_minpoly gives the EXACT monic-integer minpoly -- no rounding. FALLBACK (clearly
        labeled "nearest_integer_fallback", flagged for A2.P3/Arakelov LLL-PSLQ recovery): a genuinely
        non-exact / non-algebraic-integer centroid drops to the nearest-integer lattice snap.
        min_poly is None when neither yields a valid seed."""
        exact = [Frac(c) for c in centroid]
        try:
            return exact, coords_to_minpoly(exact, self.ambient_min_poly), "exact"
        except (ValueError, TypeError):
            pass
        snapped = [Frac(_nearest_int(c)) for c in centroid]    # A2.P3 will replace with LLL/PSLQ recovery
        if all(s == 0 for s in snapped):
            return snapped, None, "nearest_integer_fallback"
        try:
            return snapped, coords_to_minpoly(snapped, self.ambient_min_poly), "nearest_integer_fallback"
        except (ValueError, TypeError):
            return snapped, None, "nearest_integer_fallback"

    # -- (3) confirm (the ONLY mutator) ------------------------------------- #
    def confirm(self, proposal: SeedProposal) -> dict:
        if not isinstance(proposal, SeedProposal):
            raise TypeError("confirm() requires a SeedProposal from propose()")
        # G10 at the mutation point (A2.P1): the seed must be an algebraic integer -- coords_to_minpoly
        # validates that EXACTLY (clean raise otherwise) and yields the canonical minpoly we witness.
        seed_minpoly = coords_to_minpoly(proposal.coords, self.ambient_min_poly)
        new_col = [Frac(c) for c in proposal.coords]

        candidate_cols = self._cols + [new_col]
        new_P = _pj.projector_matrix(_t(candidate_cols), self._G)
        if new_P is NO_PROJECTION:                             # refuse a degenerate growth
            raise ValueError("proposed seed makes B^T G B singular; growth refused")

        self._cols = candidate_cols                            # <-- the single point B changes
        self._P = new_P
        record = self._witness_growth(proposal, seed_minpoly)
        self._reset_accumulator()                              # novelty is now captured
        return record

    # -- witness hash-chain (G5) -------------------------------------------- #
    def _witness_growth(self, proposal: SeedProposal, min_poly) -> dict:
        body = {
            "event": "basis_growth",
            "index": len(self._witness),
            "min_poly": list(min_poly),
            "coords": [str(c) for c in proposal.coords],       # exact (Fraction-safe) serialization
            "snap": proposal.snap,
            "num_seeds": len(self._cols),
            "streak": proposal.streak,
            "prev_hash": self._prev_hash,
        }
        digest = hashlib.sha256(
            (self._prev_hash + json.dumps(body, sort_keys=True, separators=(",", ":"))).encode()
        ).hexdigest()[:16]
        record = dict(body, hash=digest)
        self._witness.append(record)
        self._prev_hash = digest
        if self._witness_path:
            with open(self._witness_path, "a", encoding="utf-8") as fh:
                fh.write(json.dumps(record, sort_keys=True) + "\n")
        return record

    def verify_witness(self) -> bool:
        """Re-walk the hash-chain; True iff every link is intact (tamper-evident, G5)."""
        prev = "genesis"
        for rec in self._witness:
            body = {k: rec[k] for k in
                    ("event", "index", "min_poly", "coords", "snap", "num_seeds", "streak", "prev_hash")}
            if body["prev_hash"] != prev:
                return False
            digest = hashlib.sha256(
                (prev + json.dumps(body, sort_keys=True, separators=(",", ":"))).encode()
            ).hexdigest()[:16]
            if digest != rec["hash"]:
                return False
            prev = digest
        return True

    # -- snapshot ----------------------------------------------------------- #
    def state(self) -> dict:
        BtGB = _matmul(_t(self._B_matrix()), _mv_matrix(self._G, self._B_matrix()))
        centroid = list(self._mean) if self._n_acc else None
        return {
            # exact (Fraction/int)
            "ambient_min_poly": list(self.ambient_min_poly),
            "degree": self.degree,
            "num_seeds": len(self._cols),
            "seed_coords": [list(col) for col in self._cols],
            "gram": [list(row) for row in self._G],
            "basis_gram": BtGB,
            "streak": self._streak,
            "n_accumulated": self._n_acc,
            "centroid": centroid,
            "last_residual": list(self._last_residual),
            "last_residual_norm": self._last_residual_norm,     # exact; ==0 IFF captured
            "captured": self._last_residual_norm == 0,
            "witness_len": len(self._witness),
            "witness_head": self._prev_hash,
            # display (float) ONLY
            "centroid_norm": (math.sqrt(float(_g_norm2(self._mean, self._G))) if self._n_acc else 0.0),
            "last_residual_norm_float": float(self._last_residual_norm),
        }


# small exact matrix helpers used only by state() ---------------------------- #
def _matmul(A, B):
    n, k, m = len(A), len(B), len(B[0])
    return [[sum(A[i][t] * B[t][j] for t in range(k)) for j in range(m)] for i in range(n)]


def _mv_matrix(G, B):
    """G (dxd) times B (dxk) -> dxk, exact."""
    return _matmul(G, B)


def _exact(c: Number) -> Fraction:
    if isinstance(c, float):
        raise TypeError("observations must be exact (int/Fraction), not float (G8)")
    return Frac(c)


def _require_int(c: Number) -> int:
    f = Frac(c)
    if f.denominator != 1:
        raise ValueError(f"seed coordinate must be an integer (algebraic-integer seed, G10): {c!r}")
    return int(f)


def variance_calibration(learner: "ResidualLearner", *, warm_up: Optional[int] = None,
                         max_rel_spread: Fraction = Fraction(1, 4)) -> Callable[[], bool]:
    """A concrete G1 calibration over a learner's EXACT Welford accumulator (consumes the otherwise-unused
    per-coordinate variance ``_M2``). The off-axis centroid is 'calibrated' -- trustworthy enough to surface
    a seed -- once it has both (i) WARMED UP (``_n_acc >= warm_up``, default ``persistence_N``) and (ii)
    SETTLED: its accumulated per-coordinate sample spread is within a declared fraction of the centroid's
    coordinate magnitude,
        sum_i M2_i  <=  max_rel_spread * n * sum_i mean_i^2 .
    This is exact Fraction throughout (no float in the gate) and is distinct from persistence: persistence
    tests that the residual DIRECTION holds, calibration tests that its MAGNITUDE has settled, so an
    aligned-but-volatile stream persists yet stays uncalibrated. Install via ``calibration_ok=...``; the
    constructor default remains permissive (``lambda: True``) so existing behaviour is unchanged."""
    wu = int(warm_up) if warm_up is not None else learner.persistence_N
    ratio = Frac(max_rel_spread)

    def ok() -> bool:
        n = learner._n_acc
        if n < wu:
            return False
        scale = sum(m * m for m in learner._mean)          # exact sum_i mean_i^2 (centroid magnitude^2)
        if scale == 0:
            return False
        spread = sum(learner._M2)                           # exact sum_i M2_i (total squared deviation)
        return spread <= ratio * n * scale

    return ok


# --------------------------------------------------------------------------- #
# __main__: the smallest demonstration -- capture -> persistent novelty ->
#           propose -> confirm -> residual drops to 0 (all exact)
# --------------------------------------------------------------------------- #
def _demo() -> None:
    PHI4 = [1, 0, -10, 0, 1]                                    # x^4 - 10x^2 + 1 == minpoly(sqrt2+sqrt3)
    one = [1, 0, 0, 0]                                         # the element 1
    theta = [0, 1, 0, 0]                                       # the generator theta = sqrt2 + sqrt3
    learner = ResidualLearner(PHI4, [one, theta], persistence_N=3)

    G = learner._G
    print("ambient field: Q(sqrt2+sqrt3),  min_poly x^4 - 10x^2 + 1")
    print("trace-form Gram G =", [[str(v) for v in row] for row in G])
    w = g_orthogonal_integer_vector(learner._cols, G)          # a genuinely off-axis integer direction
    print("forced basis B = span{1, theta};  off-axis novelty w =", w,
          " (G-orthogonal to B:", all(_g_inner(col, [Frac(x) for x in w], G) == 0 for col in learner._cols), ")")

    print("\n-- captured stream (x in span B): residual stays exactly 0 --")
    for (a, b) in [(2, 1), (-3, 4), (5, -2)]:
        x = [Frac(a), Frac(b), Frac(0), Frac(0)]               # a*1 + b*theta in span(B)
        learner.observe(x)
        print(f"  x = {a}*1 + {b}*theta   residual_norm = {learner.state()['last_residual_norm']}"
              f"   propose() = {learner.propose()}")

    print("\n-- persistent off-axis novelty (x = in-span + w): centroid persists --")
    proposal = None
    for tick in range(1, 5):
        x = [Frac(1) + w[0], Frac(0) + w[1], Frac(0) + w[2], Frac(0) + w[3]]   # (1) + w
        learner.observe(x)
        st = learner.state()
        proposal = learner.propose()
        print(f"  tick {tick}: residual_norm = {st['last_residual_norm']}  streak = {st['streak']}"
              f"  centroid = {[str(v) for v in st['centroid']]}  propose = "
              f"{'None' if proposal is None else 'SEED ' + str(proposal.coords)}")

    print("\n-- propose -> confirm (the only mutator) --")
    print("  proposal min_poly (high->low) =", proposal.min_poly, " coords =", proposal.coords)
    rec = learner.confirm(proposal)
    print("  GREW basis: num_seeds ->", learner.state()["num_seeds"],
          " witness hash =", rec["hash"], " chain_ok =", learner.verify_witness())

    print("\n-- after growth: the novel component is now captured (residual -> 0) --")
    x = [Frac(1) + w[0], Frac(0) + w[1], Frac(0) + w[2], Frac(0) + w[3]]
    learner.observe(x)
    print("  residual_norm =", learner.state()["last_residual_norm"],
          "  propose() =", learner.propose())


if __name__ == "__main__":
    _demo()
