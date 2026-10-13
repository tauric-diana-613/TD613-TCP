#!/usr/bin/env python3
"""The complete similarity residual: invariant factors via Smith normal form over Q[x].

Corpus gap (pattern.md, penrose.md, standing-wave.md, entangled.md, collapse.md):
  loom.classify exposes charpoly, minpoly, and a `derogatory` bit, but NOT the
  invariant-factor list. By Thm 6.9 the invariant factors are the COMPLETE similarity
  invariant; charpoly is complete only on non-derogatory plates (Thm 6.10), and even
  (charpoly, minpoly) is incomplete once an invariant factor has multiplicity >= 3.
  This module computes the full list exactly (Fraction/int), honoring G8.

Reference: Dummit & Foode, Abstract Algebra 3e, S12.2 (rational canonical form);
Newman, Integral Matrices (1972), Smith normal form over a PID.
Polynomials are coefficient lists LOW->HIGH (index = degree). loom uses HIGH->LOW for
minpolys; we convert at the boundary (and the conversion is itself a guard against the
order-ambiguity trap quasicrystal.md documents).
"""
from fractions import Fraction as F
from copy import deepcopy
from typing import List

Poly = List[F]   # low -> high

def trim(p: Poly) -> Poly:
    p = list(p)
    while len(p) > 1 and p[-1] == 0:
        p.pop()
    return p
def is_zero(p: Poly) -> bool:
    return all(c == 0 for c in p)
def deg(p: Poly) -> int:
    p = trim(p)
    return -1 if is_zero(p) else len(p) - 1
def padd(a: Poly, b: Poly) -> Poly:
    n = max(len(a), len(b)); r = [F(0)]*n
    for i, c in enumerate(a): r[i] += c
    for i, c in enumerate(b): r[i] += c
    return trim(r)
def pscale(a: Poly, s: F) -> Poly:
    return trim([c*s for c in a])
def psub(a: Poly, b: Poly) -> Poly:
    return padd(a, pscale(b, F(-1)))
def pmul(a: Poly, b: Poly) -> Poly:
    if is_zero(a) or is_zero(b): return [F(0)]
    r = [F(0)]*(deg(a)+deg(b)+1)
    for i, ca in enumerate(a):
        for j, cb in enumerate(b):
            r[i+j] += ca*cb
    return trim(r)
def pdivmod(a: Poly, b: Poly):
    """Euclidean division over Q[x]: a = q*b + r, deg r < deg b."""
    a = trim(a); b = trim(b)
    assert not is_zero(b), "division by zero polynomial"
    q = [F(0)]*max(1, deg(a)-deg(b)+1)
    r = list(a)
    while deg(r) >= deg(b) and not is_zero(r):
        shift = deg(r) - deg(b)
        coef = r[deg(r)] / b[deg(b)]
        q[shift] = coef
        sub = [F(0)]*shift + [coef*c for c in b]
        r = psub(r, sub)
    return trim(q), trim(r)
def monic(p: Poly) -> Poly:
    p = trim(p)
    if is_zero(p): return p
    lead = p[deg(p)]
    return [c/lead for c in p]

def char_matrix(A: List[List[F]]) -> List[List[Poly]]:
    """xI - A as a matrix of polynomials."""
    n = len(A)
    M = [[None]*n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            base = [F(-A[i][j])]            # constant term -A[i][j]
            if i == j: base = [F(-A[i][j]), F(1)]   # + x on the diagonal
            M[i][j] = trim(base)
    return M

def smith_normal_form_diagonal(M: List[List[Poly]]) -> List[Poly]:
    """Diagonal of the Smith normal form of a square polynomial matrix over Q[x]."""
    M = [[trim(e) for e in row] for row in deepcopy(M)]
    n = len(M); m = len(M[0])
    def swap_rows(a, b): M[a], M[b] = M[b], M[a]
    def swap_cols(a, b):
        for r in range(n): M[r][a], M[r][b] = M[r][b], M[r][a]
    def row_op(dst, src, factor):           # row_dst -= factor * row_src
        for c in range(m): M[dst][c] = psub(M[dst][c], pmul(factor, M[src][c]))
    def col_op(dst, src, factor):           # col_dst -= factor * col_src
        for r in range(n): M[r][dst] = psub(M[r][dst], pmul(factor, M[r][src]))
    def row_add(dst, src):
        for c in range(m): M[dst][c] = padd(M[dst][c], M[src][c])

    for t in range(min(n, m)):
        while True:
            # locate a nonzero pivot of minimal degree in the active submatrix
            best = None
            for i in range(t, n):
                for j in range(t, m):
                    if not is_zero(M[i][j]):
                        d = deg(M[i][j])
                        if best is None or d < best[0]:
                            best = (d, i, j)
            if best is None:
                break                        # submatrix all zero
            _, pi, pj = best
            swap_rows(t, pi); swap_cols(t, pj)
            pivot = M[t][t]
            changed = False
            for i in range(t+1, n):
                if not is_zero(M[i][t]):
                    q, r = pdivmod(M[i][t], pivot)
                    row_op(i, t, q)
                    if not is_zero(r): changed = True
            for j in range(t+1, m):
                if not is_zero(M[t][j]):
                    q, r = pdivmod(M[t][j], pivot)
                    col_op(j, t, q)
                    if not is_zero(r): changed = True
            if changed:
                continue                     # a smaller-degree entry surfaced; re-pivot
            # row t and col t are now clear except (t,t); enforce divisibility of the rest
            nondiv = False
            for i in range(t+1, n):
                for j in range(t+1, m):
                    if not is_zero(M[i][j]):
                        _, r = pdivmod(M[i][j], M[t][t])
                        if not is_zero(r):
                            row_add(t, i); nondiv = True; break
                if nondiv: break
            if nondiv:
                continue
            break
        if not is_zero(M[t][t]):
            M[t][t] = monic(M[t][t])
    return [M[i][i] for i in range(min(n, m))]

def invariant_factors(A: List[List[F]]) -> List[Poly]:
    """The nontrivial (degree >= 1) invariant factors f_1 | f_2 | ... | f_k,
       prod = charpoly, f_k = minpoly. The COMPLETE similarity invariant (Thm 6.9)."""
    diag = smith_normal_form_diagonal(char_matrix(A))
    return [monic(d) for d in diag if deg(d) >= 1]

def is_similar(A: List[List[F]], B: List[List[F]]) -> bool:
    """A ~ B over Q  <=>  identical invariant factors (Thm 6.9). No spectrum shortcut."""
    return invariant_factors(A) == invariant_factors(B)

def pretty(p: Poly) -> str:
    p = trim(p); terms = []
    for i in range(deg(p), -1, -1):
        c = p[i]
        if c == 0: continue
        terms.append(f"{c}x^{i}" if i else f"{c}")
    return " + ".join(terms) or "0"

# ---------- demonstration ----------
def companion_high(coeffs_high_to_low: List[int]) -> List[List[F]]:
    """Companion of a monic polynomial given HIGH->LOW (loom convention)."""
    assert coeffs_high_to_low[0] == 1
    n = len(coeffs_high_to_low) - 1
    C = [[F(0)]*n for _ in range(n)]
    for i in range(1, n): C[i][i-1] = F(1)
    for i in range(n): C[i][n-1] = F(-coeffs_high_to_low[n-i])
    return C
def block_diag(*mats):
    n = sum(len(m) for m in mats); M = [[F(0)]*n for _ in range(n)]; off = 0
    for m in mats:
        s = len(m)
        for i in range(s):
            for j in range(s): M[off+i][off+j] = m[i][j]
        off += s
    return M

if __name__ == '__main__':
    C = companion_high([1,-1,-1])                 # companion(phi), x^2 - x - 1
    print("=== the corpus phi(+)phi witness (Ex. 6.11) ===")
    print("companion(phi):           invariant factors", [pretty(f) for f in invariant_factors(C)])
    phiphi = block_diag(C, C)
    print("phi (+) phi:              invariant factors", [pretty(f) for f in invariant_factors(phiphi)])
    Cq = companion_high([1,-2,-1,2,1])            # companion((x^2-x-1)^2)
    print("companion((x^2-x-1)^2):   invariant factors", [pretty(f) for f in invariant_factors(Cq)])
    print("phi(+)phi ~ companion((x^2-x-1)^2)? ", is_similar(phiphi, Cq),
          "  (charpoly identical, NOT similar)")

    print("\n=== the k>=3 case minpoly+charpoly CANNOT separate (why the full list is needed) ===")
    J2 = [[F(0),F(1)],[F(0),F(0)]]; J1 = [[F(0)]]
    M1 = block_diag(J2, J2)                        # elementary divisors x^2, x^2
    M2 = block_diag(J2, J1, J1)                    # elementary divisors x^2, x, x
    f1, f2 = invariant_factors(M1), invariant_factors(M2)
    print("J2(+)J2:        charpoly = x^4, minpoly = x^2, invariant factors", [pretty(f) for f in f1])
    print("J2(+)J1(+)J1:   charpoly = x^4, minpoly = x^2, invariant factors", [pretty(f) for f in f2])
    print("same charpoly AND same minpoly, similar? ", is_similar(M1, M2),
          " <- minpoly alone says 'maybe', invariant factors say NO")
