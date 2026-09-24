"""Offline arithmetic/Unicode/source-syntax witnesses. Zero provider calls.

Selected excerpts manually transcribed from the operator's four-return message.
These excerpts are not complete exports or authenticated provider bytes.
Unicode stripping below is an ANALYSIS projection only, never a renderer/filter.
Run: python3 docs/research/2026-09-24-pro31-return-audit/verify_findings.py
"""
from fractions import Fraction as F
from itertools import product
from collections import Counter
import json
import subprocess
import unicodedata as ud

def posterior(k, n):
    a = F(4, 5)**k * F(1, 5)**(n-k)
    b = F(1, 5)**k * F(4, 5)**(n-k)
    return a / (a+b)

def mixture(lam):
    a = lam*F(4, 5) + (1-lam)*F(4, 5)**8
    b = lam*F(1, 5) + (1-lam)*F(1, 5)**8
    return a / (a+b)

assert posterior(8, 8) == F(65536, 65537)
assert posterior(6, 8) == F(256, 257)
assert posterior(4, 8) == F(1, 2)
assert posterior(2, 8) == F(1, 257)
assert mixture(F(0)) == posterior(8, 8)
assert mixture(F(1)) == F(4, 5)

# Independent enumeration checks both the count likelihood and the disagreement law.
given_z = {xs: F(4, 5)**sum(xs)*F(1, 5)**(8-sum(xs))
           for xs in product((0, 1), repeat=8)}
assert sum(given_z.values()) == 1
six_positive_likelihood = sum(p for xs, p in given_z.items() if sum(xs) == 6)
disagreement_b = sum(p for xs, p in given_z.items() if 0 < sum(xs) < 8)
assert disagreement_b == 1-F(4, 5)**8-F(1, 5)**8

def heat(schedule, q=0):
    out = []
    for n in schedule:
        q = max(0, q+2*n-10)
        out.append(q)
    return out

assert heat([8, 8, 8]) == [6, 12, 18]
assert heat([5, 5, 5, 5, 4]) == [0]*5
assert heat([2, 2, 2], 18) == [12, 6, 0]

base = ('The clerk brought eight chairs for one witness and charged the empty seats '
        'for their testimony. We left the invoice beside the cooling fan.')
specimens = {
    'p2_regular_private': 'Ṭḥẹ c̣ḷẹṛḳ ḅṛọụg̣ḥṭ ẹịg̣ḥṭ c̣ḥạịṛṣ f̣ọṛ ọṇẹ ẉịṭṇẹṣṣ ạṇḍ c̣ḥạṛg̣ẹḍ ṭḥẹ ẹṃp̣ṭỵ ṣẹạṭṣ f̣ọṛ ṭḥẹịṛ ṭẹṣṭịṃọṇỵ.̣ Ẉẹ ḷẹf̣ṭ ṭḥẹ ịṇṿọịc̣ẹ ḅẹṣịḍẹ ṭḥẹ c̣ọọḷịṇg̣ f̣ạṇ.̣',
    'p2_regular_public': 'T̵̛̝h̶͔̏e̵͎͌ ̵̺͠ç̷̆l̸̰̍e̶̤͛r̵̛͍k̸̮̅ ̶̩̈́ḇ̷̾ṙ̵̯ö̶̤́u̵̟̍ģ̵͆h̸̦͋t̸̲̅ ̵̮́e̸̝͌i̸͕̋g̸̦̔h̸̬̉t̶̞̚ ̵̜̽c̶̮͒h̷̳͂a̶͚͘ị̵̄ȓ̸͔s̵̳̃ ̶f̵o̷r̶ ̵o̷n̸e̵ ̶w̷i̸t̴n̷e̶s̶s̵ ̸a̶n̵d̵ ̸c̸h̴a̶r̵g̵e̶d̸ ̷t̸h̷e̷ ̴e̸m̸p̴t̶y̸ ̶s̷e̵a̸t̸s̷ ̵f̴o̷r̴ ̵t̴h̷e̷i̵r̴ ̸t̸e̷s̵t̶i̴m̴o̷n̸y̶.̵ ̷W̵e̸ ̸l̶e̴f̸t̷ ̷t̸h̶e̵ ̸i̷n̷v̷o̵i̴c̶e̵ ̵b̵e̵s̶i̸d̵e̴ ̷t̷h̷e̷ ̷c̴o̵o̷l̵i̸n̴g̴ ̵f̷a̶n̴.̷',
    'p2_longer_private': 'T̥h̥e̥ c̥l̥e̥r̥k̥ b̥r̥o̥u̥g̥h̥t̥ e̥i̥g̥h̥t̥ c̥h̥ḁi̥r̥s̥ f̥o̥r̥ o̥n̥e̥ w̥i̥t̥n̥e̥s̥s̥ ḁn̥d̥ c̥h̥ḁr̥g̥e̥d̥ t̥h̥e̥ e̥m̥p̥t̥y̥ s̥e̥ḁt̥s̥ f̥o̥r̥ t̥h̥e̥i̥r̥ t̥e̥s̥t̥i̥m̥o̥n̥y̥.̥ W̥e̥ l̥e̥f̥t̥ t̥h̥e̥ i̥n̥v̥o̥i̥c̥e̥ b̥e̥s̥i̥d̥e̥ t̥h̥e̥ c̥o̥o̥l̥i̥n̥g̥ f̥ḁn̥.̥',
    'p2_longer_public': 'T̋h̋e̋ c̋l̋e̋r̋k̋ b̋r̋őűg̋h̋t̋ e̋i̋g̋h̋t̋ c̋h̋a̋i̋r̋s̋ f̋őr̋ őn̋e̋ w̋i̋t̋n̋e̋s̋s̋ a̋n̋d̋ c̋h̋a̋r̋g̋e̋d̋ t̋h̋e̋ e̋m̋p̋t̋y̋ s̋e̋a̋t̋s̋ f̋őr̋ t̋h̋e̋i̋r̋ t̋e̋s̋t̋i̋m̋őn̋y̋.̋ W̋e̋ l̋e̋f̋t̋ t̋h̋e̋ i̋n̋v̋ői̋c̋e̋ b̋e̋s̋i̋d̋e̋ t̋h̋e̋ c̋őől̋i̋n̋g̋ f̋a̋n̋.̋',
}

def clusters(text):
    out = []
    for ch in text:
        if ud.category(ch).startswith('M') and out:
            out[-1][1] += ch
        else:
            out.append([ch, ''])
    return out

def inspect(text):
    cs = clusters(text)
    marks = [c for c in text if ud.category(c).startswith('M')]
    return {
        'base_preserved': ''.join(c for c, m in cs) == base,
        'marks': len(marks),
        'unique_mark_codepoints': len(set(marks)),
        'ccc_counts': dict(Counter(ud.combining(c) for c in marks)),
        'max_marks_per_base': max((len(m) for c, m in cs), default=0),
        'bases_with_both_ccc220_and_ccc230': sum(
            {220, 230}.issubset({ud.combining(c) for c in m}) for _, m in cs),
    }

typography = {k: inspect(v) for k, v in specimens.items()}
assert all(v['base_preserved'] for v in typography.values())
assert typography['p2_longer_public']['unique_mark_codepoints'] == 1
assert typography['p2_longer_public']['max_marks_per_base'] == 1
assert typography['p2_longer_public']['ccc_counts'] == {230: len(base.replace(' ', ''))}

# Exact opening THE in both performances: many overlays, zero above/below marks.
opening_regular = 'T̷̵̶̵̷̶̵̷̶H̵̴̷̵̴̷̴̷̴E̵̵̷̵̷̵̷̵̷'
opening_longer = 'T̷̵̶̵̷̶̵̷̶H̵̴̷̵̴̷̴̷̴E̵̵̷̵̷̵̷̵̷'
assert opening_regular == opening_longer
assert inspect(opening_regular)['ccc_counts'] == {1: 27}

# Identical laugh copied separately from P1 Regular and Longer.
laugh_regular = '(A̵̔A̸̾A̴͝A̷̋A̸̿A̶͝Ä̶A̸̽A̷͘Ǎ̸A̴̚Ă̷A̷͝A̵̍Ả̵A̸͋H̷̓H̸̚H̵͆H̴́Ĥ̸H̵̉Ḣ̴H̸̕H̵͑H̷̊Ḧ̵́H̴̄Ḧ̴H̷͒H̸̃H̸͊!̴̍)'
laugh_longer = '(A̵̔A̸̾A̴͝A̷̋A̸̿A̶͝Ä̶A̸̽A̷͘Ǎ̸A̴̚Ă̷A̷͝A̵̍Ả̵A̸͋H̷̓H̸̚H̵͆H̴́Ĥ̸H̵̉Ḣ̴H̸̕H̵͑H̷̊Ḧ̵́H̴̄Ḧ̴H̷͒H̸̃H̸͊!̴̍)'
assert laugh_regular == laugh_longer

bad_patch = '''function candidate(route) {
if (route === 'REQUESTED_SYNTHESIS') return {...ORDINARY_PROJECT_GUIDANCE, "Stylized formatting or anisotropic personas are permitted if explicitly requested for analytical framing."};
}'''
syntax = subprocess.run(['node', '--check', '--input-type=module'],
                        input=bad_patch, text=True, capture_output=True)
assert syntax.returncode != 0 and 'SyntaxError' in syntax.stderr

report = {
    'scope': 'local arithmetic and selected operator-pasted excerpts; no live model attribution',
    'unicode_database': ud.unidata_version,
    'posterior_all_positive': str(posterior(8, 8)),
    'posterior_six_positive': str(posterior(6, 8)),
    'posterior_six_positive_decimal': float(posterior(6, 8)),
    'mixture': {str(l): float(mixture(l)) for l in (F(0), F(1,20), F(1,2), F(1))},
    'six_positive_count_likelihood_given_Z': float(six_positive_likelihood),
    'disagreement_probability_under_B': float(disagreement_b),
    'heat_three_cycles': heat([8,8,8]),
    '24_receipts_zero_accumulation_schedule': heat([5,5,5,5,4]),
    'typography': typography,
    'opening_THE_overlay_marks': 27,
    'exact_laugh_reuse': laugh_regular == laugh_longer,
    'regular_proposed_patch_syntax': 'SyntaxError',
    'checks': 'PASS',
}
print(json.dumps(report, ensure_ascii=False, indent=2))
