#!/usr/bin/env python3
"""TD613 source-free math and optional operator-provided historical archive verifier.
All outputs are bounded model checks; no LLM, network, ZIP extraction, or image generation.
Reads only exact specified archive; never scans private repositories.
Dependencies: numpy, Pillow (optional historical archive), Python stdlib.
"""
import argparse, base64, hashlib, io, json, math, re, zipfile
import numpy as np

PHI = (1 + math.sqrt(5)) / 2
u = np.ones(3) / math.sqrt(3)

def project(verts):
    v = np.array(verts, dtype=float)
    return v - np.outer(v @ u, u)

def bucket_radii(verts):
    radii = np.linalg.norm(project(verts), axis=1)
    rounded = np.round(radii, 8)
    return [{'radius': float(z), 'count': int(np.count_nonzero(rounded == z))} for z in np.unique(rounded)]

def ico_verts():
    arr = []
    for i in range(3):
        for s in (-1, 1):
            for t in (-1, 1):
                v = [0.0] * 3
                v[(i + 1) % 3] = s
                v[(i + 2) % 3] = t * PHI
                arr.append(v)
    return arr

def svd_case(arr):
    a = np.array(arr, dtype=float)
    s = np.linalg.svd(a, compute_uv=False)
    return {'shape': list(a.shape), 'singular_values': [float(x) for x in s], 'rank': int(np.linalg.matrix_rank(a)), 'condition_number': float(s[0] / s[-1]) if s[-1] > 1e-9 else None}

def hist_archive(path):
    from PIL import Image
    response={'path_basename':path.rsplit('/',1)[-1]}
    with open(path, 'rb') as f:
        response['sha256'] = hashlib.file_digest(f, 'sha256').hexdigest()
    with zipfile.ZipFile(path) as z:
        index = {x.filename.replace('\\','/'): x.filename for x in z.infolist()}
        lines = z.read(index['EVIDENCE_CLOSURE_CHECKSUMS.sha256']).decode('utf-8').splitlines()
        failed=[]
        for item in lines:
            expected, name = item.split('  ', 1)
            name = name.replace('\\','/')
            if name not in index or hashlib.sha256(z.read(index[name])).hexdigest() != expected.lower():
                failed.append(name)
        response['internal_ledger_count']=len(lines)
        response['internal_ledger_failures']=failed
        html=z.read(index['candidate-r2-contrast-repaired/instance/index.html'])
        response['r2_html_sha256']=hashlib.sha256(html).hexdigest()
        images=[]
        for m in re.finditer(rb'data:image/webp;base64,([A-Za-z0-9+/=]+)',html):
            raw=base64.b64decode(m.group(1));digest=hashlib.sha256(raw).hexdigest()
            if digest not in ('e4a20f9d094f116f22391daaaaca6cec5007807247c0e665ec87f0273f54aac3','01d71b797fa1e58d87dfc1a447c51343a2288add0c913bb16f781a596737a8bd'): continue
            img=Image.open(io.BytesIO(raw)).convert('RGB')
            a=np.asarray(img, dtype=np.float32)/255
            y=(a*np.array([.2126,.7152,.0722],dtype=np.float32)).sum(axis=2)
            images.append({'sha256':digest,'size':list(img.size),'bytes':len(raw),'mirror_mae_rec709':float(np.mean(np.abs(y-y[:,::-1]))),'algorithm':'whole-frame normalized Rec.709 luma mean absolute left-right reflection discrepancy'})
        response['verified_webp_assets']=images
    return response

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--historical-archive',default=None,help='optional operator-provided historical Em rendered-review evidence ZIP')
    args=ap.parse_args()
    ico=bucket_radii(ico_verts())
    T=np.array([[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]],dtype=float)
    tetra=bucket_radii(np.r_[T,-T])
    report={
        'schema':'td613.refractive-couture.independent-finite-check/v1',
        'adjudication_scope':'mathematical model calculations plus optional historical byte/hash replay; no B flight credit',
        'ideal_icosahedron_axis_111':{'radii':ico,'expected_radii':[2/math.sqrt(3),2*PHI/math.sqrt(3)],'ratio':PHI},
        'ideal_tetrahedral_compound_axis_111':{'radii':tetra,'expected_center_count':2},
        'symmetric_scalar_observation':svd_case([[1,1],[.15,.15]]),
        'actual_two_by_two_proposed_sensor':svd_case([[1,.5],[.2,.8]]),
        'augmented_three_by_two_sensor':svd_case([[1,1],[.15,.15],[1,0]]),
        'xor_information':{'x1_y_bits':0,'x2_y_bits':0,'joint_y_bits':1,'co_information_bits':-1,'architectural_union_surplus_implied':False},
        'reported_sample_design_effect_check':{'n':33,'rho_assumed':.65,'n_effective_if_exchangeable':33/(1+32*.65),'not_ancestral_proof':True},
        'fadt_aperture_generic_identity_counterexample':{'disjoint_support_gap':2,'one_dimensional_gram_kernel_dimension':0,'identity_valid':False},
    }
    if args.historical_archive:report['historical_archive']=hist_archive(args.historical_archive)
    print(json.dumps(report,indent=2,ensure_ascii=False))

if __name__=='__main__':main()
