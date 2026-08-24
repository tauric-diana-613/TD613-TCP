import tempfile
import unittest
from pathlib import Path

import srcquery


class TraceQueryTests(unittest.TestCase):
    def test_trace_preserves_missing_hops_instead_of_guessing(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            result = srcquery.trace(root, "zenodo:missing")
        self.assertEqual(result["status"], "UNRESOLVED_TARGET")
        self.assertIn("CAPTURE", result["missing_hops"])
        self.assertIn("TYPED_RELATION", result["missing_hops"])
        self.assertEqual(result["relations"], [])


if __name__ == "__main__":
    unittest.main()
