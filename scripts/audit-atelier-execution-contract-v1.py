"""Mechanical inspection: never load queries, labels, rankings or corpus text."""
import ast
import hashlib
import json
from pathlib import Path

import argparse
p = argparse.ArgumentParser(description=__doc__)
p.add_argument('--driver-root', type=Path, required=True)
p.add_argument('--tokenizer-json', type=Path, required=True)
p.add_argument('--dependency-root', type=Path)
a = p.parse_args()
prior = a.driver_root
if not prior.is_absolute() or not prior.is_dir() or not a.tokenizer_json.is_absolute():
    raise ValueError('ABSOLUTE_LOCAL_INSPECTION_INPUTS_REQUIRED')
summary = []
for name in ('execute_semantics.py', 'final_research_verification.py', 'final_native_assay.py'):
    data = (prior / name).read_bytes()
    tree = ast.parse(data)
    calls = []
    for node in ast.walk(tree):
        if not isinstance(node, ast.Call):
            continue
        func = ast.unparse(node.func)
        if func.split('.')[-1] not in ('search', 'benchmark', 'source_chunks'):
            continue
        args = {}
        for kw in node.keywords:
            if kw.arg not in ('unique_sources', 'limit', 'offset', 'k', 'estate', 'max_chars', 'overlap'):
                continue
            # Only expose public literal configuration; never query/source strings.
            if isinstance(kw.value, ast.Constant) and isinstance(kw.value.value, (int, bool)):
                args[kw.arg] = kw.value.value
            elif kw.arg == 'estate':
                args[kw.arg] = 'EXPLICIT_ESTATE_ARGUMENT'
            else:
                args[kw.arg] = 'EXPRESSION'
        calls.append(dict(line=node.lineno, function=func, arguments=args))
    summary.append(dict(driver=name, sha256=hashlib.sha256(data).hexdigest(), calls=calls))

# Synthetic tokenization only. No model weights executed and no private text loaded.
import sys
if a.dependency_root is not None:
    sys.path.insert(0, str(a.dependency_root))
from tokenizers import Tokenizer
tok = Tokenizer.from_file(str(a.tokenizer_json))
tok.no_truncation()
tok.no_padding()
synthetic = 'xyq ' * 280 + 'omega ' * 10
before = tok.encode(synthetic)
tok.enable_truncation(max_length=256)
after = tok.encode(synthetic)
attention = dict(synthetic_characters=len(synthetic), token_pieces_before=len(before.ids),
    token_pieces_after=len(after.ids), tail_marker_seen='omega' in after.tokens)
assert len(before.ids) > 256 and len(after.ids) == 256 and not attention['tail_marker_seen']
result = dict(schema='td613.source-free-execution-contract/v1', private_gold_or_rankings_loaded=False,
              execution_drivers=summary, synthetic_tokenization=attention)
print(json.dumps(result, indent=2))
