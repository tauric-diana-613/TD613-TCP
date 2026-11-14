#!/usr/bin/env python3
"""Vixen Cybernetics · three-asset operator handoff (RGI-15).

Explicitly install human-selected 16:9 desktop PNG, 9:16 mobile PNG, and a
standalone, self-contained Arc Flash fox SVG. This is a local checkout edit;
it never releases, deploys, merges, adjudicates research, or calls a provider.

Preflight ALL three inputs before touching any repository artifact.
  python3 scripts/install-vixen-brand-assets.py --check
  python3 scripts/install-vixen-brand-assets.py --desktop FILE --mobile FILE --fox FILE --dry-run
  python3 scripts/install-vixen-brand-assets.py --desktop FILE --mobile FILE --fox FILE
  python3 scripts/install-vixen-brand-assets.py --check
  python3 scripts/install-vixen-brand-assets.py --desktop FILE --desktop-only --dry-run
  python3 scripts/install-vixen-brand-assets.py --desktop FILE --desktop-only
"""
import argparse
import base64
import copy
import hashlib
import json
import re
import struct
import sys
import xml.etree.ElementTree as ET
import zlib
from pathlib import Path

SCHEMA="td613.vixen.brand-assets/v1"
ASSET_REL="app/encyclopedia/assets/vixen"
PAGE_REL="app/encyclopedia/vix-cyb.html"
CONTRACT_REL=ASSET_REL+"/asset-contract.json"
SVG_NAME="fox-arcflash.svg"
FILE_NAMES={"desktop":"frontispiece-desktop.png","mobile":"frontispiece-mobile.png","fox":SVG_NAME}
SVG_NS="{http://www.w3.org/2000/svg}"
EXPECTED_EYES=(
  "10.8,22.1 19.2,25.7 17.8,28 12.1,25.3",
  "37.2,22.1 28.8,25.7 30.2,28 35.9,25.3",
)
PNGSIG=b"\x89PNG\r\n\x1a\n"

def sha(data):
    return hashlib.sha256(data).hexdigest()

def refuse(code, detail=""):
    raise ValueError(code+(": "+str(detail) if detail else ""))

def size_limit(data,label,limit):
    if not 0<len(data)<=limit: refuse("ASSET_SIZE_OUT_OF_BOUNDS",label)

def png_info(data,role):
    size_limit(data,role,80*1024*1024)
    if not data.startswith(PNGSIG): refuse("PNG_SIGNATURE_INVALID",role)
    if data[12:16]!=b"IHDR" or struct.unpack(">I",data[8:12])[0]!=13:
        refuse("PNG_IHDR_MISSING",role)
    if len(data)<45 or not data.endswith(b"IEND\xaeB\x60\x82"):
        refuse("PNG_TRUNCATED_OR_TRAILING_BYTES",role)
    crc=struct.unpack(">I",data[29:33])[0]
    if zlib.crc32(data[12:29])!=crc: refuse("PNG_IHDR_CRC_MISMATCH",role)
    width,height=struct.unpack(">II",data[16:24])
    bit_depth,color_type=data[24],data[25]
    if bit_depth not in (8,16) or color_type not in (2,6):
        refuse("PNG_EXPECTED_TRUECOLOR_RGB_OR_RGBA",role)
    if width>12000 or height>12000: refuse("PNG_DIMENSIONS_EXCEED_BUDGET",role)
    if role=="desktop":
        if width<1400 or height<750 or abs(width/height-16/9)>.12:
            refuse("DESKTOP_16_9_GEOMETRY_MISMATCH",(width,height))
    else:
        if width<750 or height<1400 or abs(width/height-9/16)>.06:
            refuse("MOBILE_9_16_GEOMETRY_MISMATCH",(width,height))
    return {"width":width,"height":height,"bytes":len(data),"sha256":sha(data)}

def svg_info(data):
    size_limit(data,"fox",2*1024*1024)
    if b"<!DOCTYPE" in data.upper() or b"<!ENTITY" in data.upper():
        refuse("SVG_DTD_OR_ENTITY_FORBIDDEN")
    try:root=ET.fromstring(data)
    except ET.ParseError as error:refuse("SVG_XML_PARSE_REFUSAL",str(error))
    if root.tag!=SVG_NS+"svg" or root.attrib.get("viewBox")!="0 0 48 48":
        refuse("SVG_FOX_VIEWBOX_OR_NAMESPACE_MISMATCH")
    banned={"script","foreignObject","image","use","animate","animateMotion","animateTransform","set"}
    seen=set()
    for el in root.iter():
        name=el.tag.rsplit("}",1)[-1]
        if name in banned:refuse("SVG_UNSAFE_OR_EMBEDDED_RESOURCE",name)
        identity=el.attrib.get("id")
        if identity:
            if identity in seen:refuse("SVG_DUPLICATE_ID",identity)
            seen.add(identity)
        for key,value in el.attrib.items():
            local=key.rsplit("}",1)[-1].lower()
            if local.startswith("on") or local=="href" or "http://" in value or "https://" in value or "data:" in value:
                refuse("SVG_EXTERNAL_RESOURCE_OR_SCRIPT_ATTR",local)
    eye=root.find(".//*[@id='vf-arcflash-eyes']")
    if eye is None or eye.attrib.get("data-arcflash-yellow")!="#F9F36D":
        refuse("SVG_ARC_FLASH_YELLOW_EYE_ID_MISSING")
    points={x.attrib.get("points") for x in eye.iter() if x.tag==SVG_NS+"polygon"}
    if not set(EXPECTED_EYES).issubset(points):
        refuse("SVG_FOX_EYE_GEOMETRY_MISMATCH")
    if data.count(b'#F9F36D')<3:refuse("SVG_YELLOW_EYES_NOT_LUMINOUS")
    return {"bytes":len(data),"sha256":sha(data),"viewBox":"0 0 48 48"}

def source_match(html,role):
    if role=="mobile":
        pattern=r'(<source\b(?=[^>]*\bdata-vixen-asset-role="mobile")[^>]*?\bsrcset=")([^"]*)(")'
    else:
        pattern=r'(<img\b(?=[^>]*\bdata-vixen-asset-role="desktop")[^>]*?\bsrc=")([^"]*)(")'
    matches=list(re.finditer(pattern,html,flags=re.DOTALL))
    if len(matches)!=1:refuse("FRONTISPIECE_SOURCE_SLOT_AMBIGUOUS",role)
    return matches[0],pattern

def verify_original_inline(html,contract):
    for role in ("desktop","mobile"):
        match,_=source_match(html,role)
        url=match.group(2)
        if not url.startswith("data:image/webp;base64,"):
            refuse("EXPECTED_HISTORICAL_WEBP",role)
        try:raw=base64.b64decode(url.split(",",1)[1],validate=True)
        except Exception:refuse("HISTORICAL_WEBP_UNDECODABLE",role)
        if sha(raw)!=contract["frontispiece"][role]["legacy_webp_sha256"]:
            refuse("HISTORICAL_WEBP_SHA256_MISMATCH",role)

def verify_svg_file(root,contract):
    path=root/ASSET_REL/SVG_NAME
    if not path.is_file():refuse("SVG_ASSET_MISSING",path)
    data=path.read_bytes()
    info=svg_info(data)
    if info["sha256"]!=contract["fox"]["sha256"]:
        refuse("SVG_MANIFEST_DIGEST_MISMATCH",path)
    return info

def check_current(root):
    page=(root/PAGE_REL).read_text(encoding="utf8")
    manifest=json.loads((root/CONTRACT_REL).read_text(encoding="utf8"))
    if manifest.get("schema")!=SCHEMA:refuse("ASSET_CONTRACT_SCHEMA_MISMATCH")
    if page.count('data-vixen-asset-role="fox"')!=2:refuse("TWO_FOX_REFERENCES_REQUIRED")
    if page.count('src="./assets/vixen/fox-arcflash.svg"')!=2:refuse("FOX_NOT_A_SINGLE_EXTERNAL_VECTOR")
    if '<svg class="vixen-fox-emblem"' in page:refuse("LEGACY_INLINE_FOX_STILL_PRESENT")
    if 'brand-assets.css' not in page:refuse("FINAL_ASSET_CASCADE_MISSING")
    fox=verify_svg_file(root,manifest)
    front=manifest["frontispiece"]
    state=front["stage"]
    if state=="EMBEDDED_HISTORICAL_FALLBACK":
        if 'data-vixen-frontispiece-source="embedded-historical"' not in page:
            refuse("HISTORICAL_SOURCE_DECLARATION_MISMATCH")
        verify_original_inline(page,manifest)
    elif state=="EXTERNAL_PNG_INSTALLED_REVIEW_PENDING":
        if 'data-vixen-frontispiece-source="external-selected"' not in page:
            refuse("SELECTED_SOURCE_DECLARATION_MISMATCH")
        if "data:image/webp;base64," in page:refuse("OBSOLETE_EMBEDDED_FRONTISPIECE_REMAINS")
        for role in ("desktop","mobile"):
            expected="./assets/vixen/"+FILE_NAMES[role]
            slot,_=source_match(page,role)
            if slot.group(2)!=expected:refuse("IMAGE_ROUTE_NOT_CANONICAL",role)
            if role=="mobile":
                mobile_tag=r'<source\b(?=[^>]*data-vixen-asset-role="mobile")[^>]*\btype="image/png"[^>]*>'
                if len(re.findall(mobile_tag,page))!=1:
                    refuse("MOBILE_SOURCE_MIME_MISMATCH")
            data=(root/ASSET_REL/FILE_NAMES[role]).read_bytes()
            info=png_info(data,role)
            recorded=front[role]
            for key in ("sha256","width","height"):
                if info[key]!=recorded[key]:refuse("ACTIVE_IMAGE_MANIFEST_MISMATCH",role+":"+key)
    else: refuse("UNKNOWN_ASSET_STAGE",state)
    return {"status":"SUPPORTED_IN_SCOPE","stage":state,
      "fox":fox,"source_file":PAGE_REL,"human_aesthetic_closure":"RESERVED"}

def replace_slot(html,role,target):
    match,pat=source_match(html,role)
    return html[:match.start(2)]+target+html[match.end(2):]

def update_reference_manifest(html,desktop,mobile):
    pattern=r'(<script id="vixen-reference-manifest" type="application/json">)(.*?)(</script>)'
    found=list(re.finditer(pattern,html,flags=re.DOTALL))
    if len(found)!=1:refuse("REFERENCE_MANIFEST_NOT_UNIQUE")
    m=found[0]
    old=json.loads(m.group(2))
    entry=old.setdefault("frontispiece",{})
    # Retain all predecessor WebP digests as historical provenance fields.
    entry.update({
      "active_source_mode":"EXTERNAL_OPERATOR_SELECTED_PNG",
      "active_custody_status":"HUMAN_AESTHETIC_REVIEW_PENDING",
      "desktop_png_sha256":desktop["sha256"],
      "mobile_png_sha256":mobile["sha256"],
      "desktop_png_dimensions":[desktop["width"],desktop["height"]],
      "mobile_png_dimensions":[mobile["width"],mobile["height"]],
      "asset_contract":"assets/vixen/asset-contract.json"
    })
    encoded=json.dumps(old,ensure_ascii=False,separators=(",",":")).replace("</","<\\/")
    return html[:m.start(2)]+encoded+html[m.end(2):]

def prepare(root,desktop_path,mobile_path,fox_path):
    page_path=root/PAGE_REL
    html=page_path.read_text(encoding="utf8")
    contract=json.loads((root/CONTRACT_REL).read_text(encoding="utf8"))
    check_current(root)
    desktop_data=desktop_path.read_bytes()
    mobile_data=mobile_path.read_bytes()
    fox_data=fox_path.read_bytes()
    desktop=png_info(desktop_data,"desktop")
    mobile=png_info(mobile_data,"mobile")
    fox=svg_info(fox_data)
    if desktop["sha256"]==mobile["sha256"]:
        refuse("TWO_ORIENTATIONS_REQUIRE_DISTINCT_ASSETS")
    html=replace_slot(html,"mobile","./assets/vixen/"+FILE_NAMES["mobile"])
    html=replace_slot(html,"desktop","./assets/vixen/"+FILE_NAMES["desktop"])
    html=update_reference_manifest(html,desktop,mobile)
    if 'data-vixen-frontispiece-source="embedded-historical"' in html:
        html=html.replace('data-vixen-frontispiece-source="embedded-historical"',
                          'data-vixen-frontispiece-source="external-selected"',1)
    elif 'data-vixen-frontispiece-source="external-selected"' not in html:
        refuse("SOURCE_MODE_SWITCH_UNAVAILABLE")
    updated=copy.deepcopy(contract)
    f=updated["frontispiece"]
    f["stage"]="EXTERNAL_PNG_INSTALLED_REVIEW_PENDING"
    f["active_image_mode"]="EXTERNAL_OPERATOR_SELECTED_PNG"
    for role,info in (("desktop",desktop),("mobile",mobile)):
        f[role].update(info)
        f[role]["status"]="OPERATOR_SELECTED_PENDING_VISUAL_ADJUDICATION"
    updated["fox"]["sha256"]=fox["sha256"]
    updated["fox"]["stage"]="STANDALONE_SVG_OPERATOR_SELECTED"
    updated["fox"]["operator_may_replace_with_final_svg"]=True
    return {
      page_path:html.encode("utf8"),
      root/CONTRACT_REL:(json.dumps(updated,ensure_ascii=False,indent=2)+"\n").encode("utf8"),
      root/ASSET_REL/FILE_NAMES["desktop"]:desktop_data,
      root/ASSET_REL/FILE_NAMES["mobile"]:mobile_data,
      root/ASSET_REL/FILE_NAMES["fox"]:fox_data,
    },{"desktop":desktop,"mobile":mobile,"fox":fox}

def prepare_desktop_only(root,desktop_path):
    """Replace installed desktop PNG without writing mobile or fox."""
    page_path=root/PAGE_REL
    page=page_path.read_text(encoding="utf8")
    contract=json.loads((root/CONTRACT_REL).read_text(encoding="utf8"))
    if check_current(root)["stage"]!="EXTERNAL_PNG_INSTALLED_REVIEW_PENDING":
        refuse("DESKTOP_ONLY_REQUIRES_INSTALLED_PNG_PAIR")
    desktop_data=desktop_path.read_bytes()
    desktop=png_info(desktop_data,"desktop")
    mobile=png_info((root/ASSET_REL/FILE_NAMES["mobile"]).read_bytes(),"mobile")
    if desktop["sha256"]==mobile["sha256"]:
        refuse("TWO_ORIENTATIONS_REQUIRE_DISTINCT_ASSETS")
    page=replace_slot(page,"desktop","./assets/vixen/"+FILE_NAMES["desktop"])
    page=update_reference_manifest(page,desktop,mobile)
    updated=copy.deepcopy(contract)
    updated["frontispiece"]["desktop"].update(desktop)
    updated["frontispiece"]["desktop"]["status"]="OPERATOR_SELECTED_PENDING_VISUAL_ADJUDICATION"
    return {
      page_path:page.encode("utf8"),
      root/CONTRACT_REL:(json.dumps(updated,ensure_ascii=False,indent=2)+"\n").encode("utf8"),
      root/ASSET_REL/FILE_NAMES["desktop"]:desktop_data,
    },{"desktop":desktop}

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root",type=Path,default=Path(__file__).resolve().parents[1])
    parser.add_argument("--desktop",type=Path)
    parser.add_argument("--mobile",type=Path)
    parser.add_argument("--fox",type=Path)
    parser.add_argument("--desktop-only",action="store_true",help="Replace desktop PNG only; preserve mobile and fox")
    parser.add_argument("--dry-run",action="store_true")
    parser.add_argument("--check",action="store_true")
    args=parser.parse_args()
    root=args.root.resolve()
    if args.check:
        print(json.dumps(check_current(root),indent=2))
        return
    if args.desktop_only:
        if not args.desktop or args.mobile or args.fox:
            refuse("DESKTOP_ONLY_ACCEPTS_DESKTOP_PATH_ONLY")
        updates,info=prepare_desktop_only(root,args.desktop)
    else:
        if not all((args.desktop,args.mobile,args.fox)):
            refuse("THREE_OPERATOR_SELECTED_SOURCE_FILES_REQUIRED")
        updates,info=prepare(root,args.desktop,args.mobile,args.fox)
    report={
      "schema":"td613.vixen.brand-install-receipt/v1",
      "mode":"DRY_RUN" if args.dry_run else "LOCAL_CHECKOUT_REPLACEMENT",
      "intake_scope":"DESKTOP_ONLY" if args.desktop_only else "THREE_ASSET_REPLACEMENT",
      "state":"PREVALIDATED_THREE_FILES",
      "target_paths":[str(p.relative_to(root)) for p in updates],
      "source_sha256":{k:v["sha256"] for k,v in info.items()},
      "dimensions":{k:[v["width"],v["height"]] for k,v in info.items() if "width" in v},
      "provenance":"OPERATOR_SELECTED_ART_ONLY",
      "github_write":False,"deploy":False,"merge":False,
      "human_aesthetic_closure":"RESERVED"
    }
    if not args.dry_run:
        # All source bytes, all routes and all manifest fields were prepared
        # before any file write. Git remains the reversible historical source.
        for path,data in updates.items():
            path.parent.mkdir(parents=True,exist_ok=True)
            temp=path.with_name(path.name+".intake-tmp")
            temp.write_bytes(data)
            temp.replace(path)
        check_current(root)
    print(json.dumps(report,indent=2))

if __name__=="__main__":
    try:main()
    except (ValueError,OSError,KeyError,TypeError) as error:
        print(json.dumps({"status":"HELD","reason":str(error),
                          "repository_merge":False,"release":False}),
              file=sys.stderr)
        sys.exit(2)
