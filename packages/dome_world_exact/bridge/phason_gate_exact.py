#!/usr/bin/env python3
"""
phason_gate_exact.py — a runnable bridge from Ace's exact substrate to Tim's Ash/Phason Gate.

Two jobs, both mechanical and checkable:

  (1) VERIFY the cut-and-project geometry that the Dome-World v0.4.2 docs *posit* but the
      running v0.4.1 code does not yet implement. We confirm, EXACTLY (sympy, no float in any
      decision), that the matrices B_par / B_perp are an orthonormal cut-and-project pair and
      that the normalization constants are c_par = 1/sqrt(2(2+tau)), c_perp = 1/sqrt(2(2+tau')),
      i.e. ~0.371748 / ~0.601501 — NOT the 0.356822 / 0.788675 that shipped in an early draft.

  (2) DECIDE a custody phason flip with an EXACT acceptance-window test (membership over Q(tau)),
      replacing the float thresholds the current Ash signature uses
      (route = fold_density > .72 ? 'safe-harbor-buffer' : privacy_pressure > .48 ? ...).
      The boundary is decided by exact sign of an algebraic number, mirroring the residual-return
      package's certified-interval discipline. The document content never changes; only the
      admissible projection flips.

Field note: the custody field here is Q(tau) = Q(sqrt5), tau = (1+sqrt5)/2 = phi, tau' = 1-tau = psi.
The conjugate pair (tau, tau') used for the parallel/perp cut is the SAME (phi, psi) the GSA core is
built on (seed x^2 - x - 1, Tr(R) = phi + psi = 1). The cut-and-project trace tau + tau' = 1 is the
GSA locking condition. So the gate's exactness is not a metaphor bolted on — it lives in Ace's field.
"""
from __future__ import annotations
import hashlib, json
import sympy as sp

tau  = (1 + sp.sqrt(5)) / 2          # phi
tp   = 1 - tau                       # tau' = psi = (1 - sqrt5)/2
I3   = sp.eye(3)

# --- the matrices the docs give (icosahedral 6D -> 3D cut-and-project) -------------------------
def projector(t):
    return sp.Matrix([
        [1, -1, 0,  0,  t,  t],
        [t,  t, 1, -1,  0,  0],
        [0,  0, t,  t,  1, -1],
    ])

B_par_raw  = projector(tau)
B_perp_raw = projector(tp)
c_par  = 1 / sp.sqrt(2 * (2 + tau))
c_perp = 1 / sp.sqrt(2 * (2 + tp))
B_par  = c_par  * B_par_raw
B_perp = c_perp * B_perp_raw

def check(name, cond):
    print(f"  [{'PASS' if cond else 'FAIL'}] {name}")
    return cond

print("=" * 78)
print("  (1) EXACT VERIFICATION OF THE CUT-AND-PROJECT GEOMETRY  (sympy, exact)")
print("=" * 78)
ok = True
# row norm^2 of the raw matrices is 2(2+tau) and 2(2+tau')
ok &= check("raw parallel row norm^2 == 2(2+tau)",
            all(sp.simplify(B_par_raw.row(i).dot(B_par_raw.row(i)) - 2*(2+tau)) == 0 for i in range(3)))
ok &= check("raw perp     row norm^2 == 2(2+tau')",
            all(sp.simplify(B_perp_raw.row(i).dot(B_perp_raw.row(i)) - 2*(2+tp)) == 0 for i in range(3)))
# after normalization each block is an isometry: B B^T = I_3
ok &= check("B_par  B_par^T  == I_3  (parallel block is orthonormal)",
            sp.simplify(B_par * B_par.T - I3) == sp.zeros(3))
ok &= check("B_perp B_perp^T == I_3  (perp block is orthonormal)",
            sp.simplify(B_perp * B_perp.T - I3) == sp.zeros(3))
# the two 3-spaces are orthogonal complements: every parallel row _|_ every perp row
ok &= check("B_par  B_perp^T == 0  (E_par _|_ E_perp : a clean cut)",
            sp.simplify(B_par_raw * B_perp_raw.T) == sp.zeros(3))
# the constants, to 12 places, vs the values an early draft shipped
cpar_n, cperp_n = sp.N(c_par, 12), sp.N(c_perp, 12)
print(f"\n  c_par  (correct) = {cpar_n}    early-draft JSON 0.356822  -> {'OK' if abs(cpar_n-sp.Rational('0.356822'))>sp.Rational(1,10000) else '??'} (draft is WRONG)")
print(f"  c_perp (correct) = {cperp_n}   early-draft JSON 0.788675  -> {'OK' if abs(cperp_n-sp.Rational('0.788675'))>sp.Rational(1,10000) else '??'} (draft is WRONG)")
print(f"  (the sealed v0.4.2 doc already uses 0.37174803446 / 0.60150095501 — matches the exact values)")
print(f"\n  geometry verification: {'ALL PASS' if ok else 'SOME FAIL'}")

# --- (2) an EXACT acceptance-window custody gate ----------------------------------------------
# A room's window W_r is an axis-aligned box on the hidden custody coordinate r_perp in R^3.
# Admission is EXACT: each component compared to rational bounds by exact sign over Q(tau).
def in_window_exact(r_perp, lo, hi):
    """Exact membership: returns (inside: bool, per_axis: list[(val, relation)])."""
    rows = []
    inside = True
    for i in range(3):
        v = sp.nsimplify(r_perp[i])
        ge = sp.simplify(v - lo[i]).is_nonnegative      # exact: True/False for algebraic reals
        le = sp.simplify(hi[i] - v).is_nonnegative
        on_lo = sp.simplify(v - lo[i]) == 0
        on_hi = sp.simplify(hi[i] - v) == 0
        rel = "on-boundary" if (on_lo or on_hi) else ("inside" if (ge and le) else "exterior")
        inside &= bool(ge and le)
        rows.append((sp.N(v, 8), rel))
    return inside, rows

def custody_coord(n_vec, w):
    """r_perp = c_perp * B_perp_raw * n + w(t), computed exactly in Q(tau)."""
    n = sp.Matrix(n_vec)
    return sp.simplify(B_perp * n + sp.Matrix(w))

def phason_event(artifact_id, internal_coord, prev_proj, new_proj, boundary, relation):
    return {
        "schema": "td613.phason-gate/v1",
        "artifact_id": artifact_id,
        "artifact_content_changed": False,          # the document is byte-identical
        "projection_changed": True,
        "hidden_coordinate_changed": internal_coord,
        "previous_projection": prev_proj,
        "new_projection": new_proj,
        "window_id": "W_Public-Export",
        "boundary_crossed": boundary,
        "boundary_relation": relation,
        "operator_message": "Artifact unchanged; admissible projection changed.",
        "projection_model": {
            "convention": "icosahedral_cut_and_project_tau_conjugate_v1",
            "field": "Q(tau) = Q(sqrt5)  [same field as GSA seed x^2 - x - 1]",
            "c_parallel": str(sp.N(c_par, 12)),
            "c_perpendicular": str(sp.N(c_perp, 12)),
        },
        "decision_basis": "exact-sign-over-Q(tau)-no-float-threshold",
    }

print("\n" + "=" * 78)
print("  (2) EXACT CUSTODY GATE — a phason flip decided with NO float threshold")
print("=" * 78)

# One fixed document, identified by a content hash. Its 6D custody manifest n is INVARIANT.
doc_bytes = b"Confidential affidavit; Anishinaabemowin passages; named witness."
artifact_id = "ash_" + hashlib.sha256(doc_bytes).hexdigest()[:8]
n_vec = [1, -1, 0, 1, 0, 0]    # custody manifest (provenance/consent/stewardship/.../claim/recall)

# W_Public-Export window on r_perp (the narrowest room). Rational bounds.
lo = [sp.Rational(-3, 2)] * 3
hi = [sp.Rational( 3, 2)] * 3

# t0: institutional shift w0 keeps the artifact admissible -> public-weather export
w0 = [sp.Rational(0), sp.Rational(0), sp.Rational(0)]
r0 = custody_coord(n_vec, w0)
inside0, rows0 = in_window_exact(r0, lo, hi)
print(f"\n  artifact_id        : {artifact_id}   (content hash; n is invariant)")
print(f"  r_perp @ t0        : {[str(x) for x in rows0]}")
print(f"  admissible @ t0    : {inside0}  -> projection = {'public-weather' if inside0 else 'quarantine'}")

# t1: a stewardship review fails. w(t) shifts the custody coordinate across dW. Content UNCHANGED.
# choose w1 so component 0 lands strictly outside [-3/2, 3/2] -> exact exterior, exact flip.
w1 = [sp.Rational(1, 2), sp.Rational(0), sp.Rational(0)]
r1 = custody_coord(n_vec, w1)
inside1, rows1 = in_window_exact(r1, lo, hi)
print(f"\n  -- institutional shift w(t): stewardship_status review FAILS (document not rewritten) --")
print(f"  r_perp @ t1        : {[str(x) for x in rows1]}")
print(f"  admissible @ t1    : {inside1}  -> projection = {'public-weather' if inside1 else 'quarantine'}")

if inside0 and not inside1:
    evt = phason_event(artifact_id, "stewardship_status", "public-weather", "quarantine",
                       "unverified-cultural-language-material", rows1[0][1])
    print("\n  CUSTODY PHASON FLIP (emitted event):")
    print("  " + json.dumps(evt, indent=2).replace("\n", "\n  "))
    print("\n  Same document. New custody state. Different admissible projection — decided exactly.")
else:
    print("\n  (no flip under these inputs)")
