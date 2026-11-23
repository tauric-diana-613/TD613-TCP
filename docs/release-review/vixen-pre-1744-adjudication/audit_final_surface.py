#!/usr/bin/env python3
"""Read-only independent audit of a Vixen Chromium ZIP (not a CI self-attestation).
Usage: python audit_final_surface.py path/to/vixen-full-surface.zip EXPECTED_GIT_SHA
Requires Pillow for pixel decode and change checks: python -m pip install pillow
Exit nonzero on any missing route, error, digest mismatch or suspicious static scroll.
"""
import sys, json, zipfile, hashlib, collections
from io import BytesIO
from pathlib import Path
from PIL import Image, ImageChops, ImageStat

PROFILES = {
 "desktop-1440x900": (1440,900,1),
 "desktop-1920x1080": (1920,1080,1),
 "iphone-390x844": (390,844,3),
 "iphone-428x926": (428,926,3),
}
NEEDED = set("""overview works observatory collection reference protocols gates holds
operator-settings folios-optical-layer-check observatory-proof-open search-hybrid
search-lexical search-phrase search-exact search-src_projective search-negative-query
fusion-laboratory podium-maestro podium-composer program-notes-off
program-notes-pending inspector-census inspector-bench inspector-provenance
inspector-podium collection-reduced-motion collection-live-motion
collection-scrolling-motion decoded-frontispiece independent-reading-room
works-original-reader""".split())

def audit(archive, expected_sha):
    issues=[]; suspicious=[]; pane=collections.defaultdict(list)
    with zipfile.ZipFile(archive) as z:
        members=set(z.namelist())
        receipt=json.loads(z.read("COVERAGE.json"))
        if receipt.get("source_revision")!=expected_sha:issues.append("WRONG_EXACT_SOURCE_SHA")
        if not receipt.get("complete"):issues.append("SELF_REPORTED_INCOMPLETE")
        if receipt.get("errors"):issues.append("SOURCE_ERRORS:"+str(len(receipt["errors"])))
        records=receipt.get("images",[])
        byfile={}; routes=collections.defaultdict(set); imgs=collections.defaultdict(set)
        for item in receipt.get("matrices",[]):
            routes[item.get("profile")].add(item.get("route"))
        for r in records:
            f=r["file"]; profile=r["profile"]; kind=r.get("kind")
            if f in byfile:issues.append("DUPLICATE_MANIFEST:"+f)
            byfile[f]=r; imgs[profile].add(r.get("surface"))
            if f not in members:issues.append("MISSING_JPEG:"+f);continue
            payload=z.read(f)
            if len(payload)!=r["byte_length"]:issues.append("LENGTH:"+f)
            if hashlib.sha256(payload).hexdigest()!=r["sha256"]:issues.append("SHA256:"+f)
            try:
                im=Image.open(BytesIO(payload)); dimensions=im.size
                if im.format!="JPEG":issues.append("NOT_JPEG:"+f)
            except Exception as exc:issues.append("DECODE:"+f+":"+str(exc));continue
            if list(dimensions)!=[r["pixel_dimensions"]["width"],r["pixel_dimensions"]["height"]]:
                issues.append("JPEG_DIMENSIONS:"+f)
            if profile not in PROFILES:issues.append("UNKNOWN_PROFILE:"+f);continue
            width,height,dpr=PROFILES[profile]
            if kind in {"document_scroll_tile","arrival_ready_frontispiece","arrival_loading_state"}:
                if dimensions!=(width*dpr,height*dpr):issues.append("VIEWPORT_DIMS:"+f)
            if kind=="nested_scroll_tile":
                clip=r.get("clip_css_pixels")
                if clip and dimensions!=(round(clip["width"]*dpr),round(clip["height"]*dpr)):
                    issues.append("CLIP_DIMS:"+f)
                pane[(profile,r.get("surface"),r.get("pane_id"))].append(r)
        for f in members:
            if f.lower().endswith((".jpg",".jpeg")) and f not in byfile:
                issues.append("UNINDEXED_JPEG:"+f)
        for profile in PROFILES:
            for route in sorted(NEEDED-routes[profile]):issues.append("MISSING_ROUTE:"+profile+"/"+route)
            for route in ("overview","reference","works","decoded-frontispiece"):
                if route not in imgs[profile]:issues.append("MISSING_IMAGE_SURFACE:"+profile+"/"+route)
        for key, group in pane.items():
            group.sort(key=lambda x:x.get("tile",-1))
            scrolls=[x.get("observed_scroll",-1) for x in group]
            if any(b<a for a,b in zip(scrolls,scrolls[1:])):issues.append("SCROLL_REGRESSION:"+str(key))
            if group and group[-1].get("pane_max_scroll",0)-scrolls[-1]>2:
                issues.append("PANE_BOTTOM_NOT_OBSERVED:"+str(key))
            for a,b in zip(group,group[1:]):
                if b.get("observed_scroll",0)-a.get("observed_scroll",0)<50:continue
                if a["sha256"]==b["sha256"]:issues.append("STALE_SHA:"+str(key))
                picA=Image.open(BytesIO(z.read(a["file"]))).convert("L").resize((88,64))
                picB=Image.open(BytesIO(z.read(b["file"]))).convert("L").resize((88,64))
                mad=ImageStat.Stat(ImageChops.difference(picA,picB)).mean[0]
                if mad<1.0:suspicious.append({"pane":str(key),"first":a["file"],"second":b["file"],"mean_pixel_change":round(mad,3)})
    with open(archive,"rb") as inp: zipsha=hashlib.file_digest(inp,"sha256").hexdigest()
    result={"source_sha":expected_sha,"zip_sha256":zipsha,"zip_size_bytes":Path(archive).stat().st_size,
      "images":len(records),"pane_groups":len(pane),"profiles":{p:{"images":sum(r.get("profile")==p for r in records),
      "route_count":len(routes[p])} for p in PROFILES},
      "source_error_count":len(receipt.get("errors",[])),"issues":issues,"static_panes":suspicious,
      "independent_pass":not issues and not suspicious}
    print(json.dumps(result,indent=2))
    return 0 if result["independent_pass"] else 1
if __name__=="__main__":
    if len(sys.argv)!=3:raise SystemExit(__doc__)
    raise SystemExit(audit(sys.argv[1],sys.argv[2]))
