"""
test_p1_06_L4.py
================
Paper 1, Section 10.2: the integer normalisation L_4 = 7 is forced from the
keystone alone.

Forced relationships:
    R^n = F_n R + F_{n-1} I, eigenvalues phi^n, psi^n; L_n = tr(R^n) integer;
       det(R^n) = (-1)^n                                            (Lem 10.4)
    Pell: L_n^2 - 5 F_n^2 = 4(-1)^n; disc(charpoly(R^n)) = 5 F_n^2  (Lem 10.5)
    R^4 = 3R+2I = [[2,3],[3,5]], charpoly x^2-7x+1 (the gap seed),
       entries {2,3,5} = {F_3,F_4,F_5}, L_4 = F_3 + F_5 = 7         (Prop 10.6)
"""
import sympy as sp
from harness.algebra import x, companion, PHI, PSI, lucas, fib
from harness.results import record

PAPER = "lambda_2c"
R = companion([1, -1, -1])           # keystone [[0,1],[1,1]]
I2 = sp.eye(2)


def test_keystone_powers_and_fibonacci():
    F = [0, 1]
    for _ in range(2, 8):
        F.append(F[-1] + F[-2])
    for n in range(1, 7):
        assert R**n == F[n] * R + F[n - 1] * I2          # R^n = F_n R + F_{n-1} I
    # eigenvalues phi^n, psi^n; trace = L_n integer; det = (-1)^n
    for n in range(1, 7):
        assert sp.simplify(sp.trace(R**n) - (PHI**n + PSI**n)) == 0
        assert sp.trace(R**n) == lucas(n)
        assert (R**n).det() == (-1)**n
    record("P1-L4-01", PAPER, "Lem 10.4 (keystone powers)",
           "R^n = F_n R + F_{n-1} I; eigenvalues phi^n,psi^n; tr(R^n)=L_n integer; "
           "det(R^n)=(-1)^n",
           "R^n = F_n R + F_{n-1} I, tr=L_n, det=(-1)^n",
           detail={"L_1..6": [lucas(n) for n in range(1, 7)]})


def test_pell_relation():
    for n in range(1, 8):
        assert lucas(n)**2 - 5 * fib(n)**2 == 4 * (-1)**n
        disc = sp.discriminant(sp.Poly(x**2 - lucas(n) * x + (-1)**n, x))
        assert disc == 5 * fib(n)**2
    record("P1-L4-02", PAPER, "Lem 10.5 (Pell forced)",
           "L_n^2 - 5 F_n^2 = 4(-1)^n; charpoly(R^n)=x^2-L_n x+(-1)^n has discriminant 5 F_n^2",
           "L_n^2 - 5 F_n^2 = 4(-1)^n",
           detail={"checked_n": list(range(1, 8))})


def test_L4_is_seven():
    R4 = R**4
    assert R4 == 3 * R + 2 * I2
    assert R4 == sp.Matrix([[2, 3], [3, 5]])
    cp = sp.Poly(x**2 - sp.trace(R4) * x + R4.det(), x)
    assert sp.expand(cp.as_expr() - (x**2 - 7 * x + 1)) == 0      # gap seed
    assert sorted({R4[0, 0], R4[0, 1], R4[1, 1]}) == [2, 3, 5]    # = {F3,F4,F5}
    assert [fib(3), fib(4), fib(5)] == [2, 3, 5]
    assert lucas(4) == 7 and lucas(4) == fib(3) + fib(5)
    assert lucas(4)**2 == 5 * fib(4)**2 + 4                       # Pell at n=4: 49 = 45+4
    record("P1-L4-03", PAPER, "Prop 10.6 (L4=7 forced)",
           "R^4 = 3R+2I = [[2,3],[3,5]] with charpoly x^2-7x+1 (the gap seed); entries "
           "{2,3,5}={F3,F4,F5}; L_4 = F_3+F_5 = 7 and Pell L_4^2 = 5 F_4^2 + 4 = 49",
           "R^4=[[2,3],[3,5]], charpoly=x^2-7x+1, L_4=7={F3+F5}",
           detail={"R4": [[2, 3], [3, 5]], "L4": 7, "entries": [2, 3, 5]})


def test_gap_seed_roots():
    roots = sp.Poly(x**2 - 7 * x + 1, x).all_roots()
    assert roots == sorted([sp.nsimplify(PHI**4), sp.nsimplify(PHI**(-4))])
    record("P1-L4-04", PAPER, "gap seed roots",
           "the gap seed x^2-7x+1 has roots phi^4 and phi^-4 (product 1, sum L_4=7)",
           "roots(x^2-7x+1) = {phi^4, phi^-4}",
           detail={"roots": ["phi^4", "phi^-4"]})
