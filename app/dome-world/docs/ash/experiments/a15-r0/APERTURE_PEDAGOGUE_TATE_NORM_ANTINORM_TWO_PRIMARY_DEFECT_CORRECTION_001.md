# Tate norm/anti-norm correction 001

Parent spec: da68b4311353864cdf69d6952a5a749f6fe742a1
First implementation: bbab361bc374ce48001132e324899b3dc81eb79a

Pre-witness implementation defect: the generic image-coordinate helper assumes a nonempty target eigenspace and calls transpose on the coordinate matrix. Degree 0 minus and degree 3 plus are rank-zero eigenspaces, so their coordinate matrices are empty.

Preregistered repair: when the target eigenspace has rank zero, require the corresponding operator to be the zero matrix, return exact=true only in that case, use lattice index 1, and skip transpose entirely.

No deck matrix, Tate quotient, norm/anti-norm identity, or candidate classification changes.

ZERO_RANK_EIGENSPACE != NONEMPTY_COORDINATE_MATRIX_DOMAIN

No theorem authority promoted.
