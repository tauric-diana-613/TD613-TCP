#!/usr/bin/env python3
"""Create the exact-head Vixen HTTP preview from public app assets only."""
import argparse, hashlib, json, os, re, subprocess, sys
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED, ZipInfo

ROOT=Path(__file__).resolve().parents[1]
APP=ROOT/"app"
REF=APP/"encyclopedia"/"reference"
PREFIX="TD613_Vixen_Cybernetics_Preview"
def sha(data): return hashlib.sha256(data).hexdigest()
def head():
    value=subprocess.check_output(["git","rev-parse","HEAD"],cwd=ROOT,text=True).strip()
    if not re.fullmatch("[0-9a-f]{40}",value): raise ValueError("Unverified Git HEAD")
    return value

def main(out):
    candidate=(APP/"encyclopedia"/"vix-cyb.html").read_text(encoding="utf8")
    assert 'id="vixen-estate-manifest"' in candidate and 'id="view-reference"' in candidate, "Wrong Vixen candidate"
    assert candidate.count('id="vixen-corpus-bundle"')==1
    # A source identity match in another Opera never establishes an EMSTD613
    # manifestation. Reject an accidental reintroduction into this page.
    assert "Eclipse–Omega" not in candidate and "Eclipse-Omega" not in candidate and "G-001" not in candidate
    chamber=(APP/"encyclopedia"/"vixen-estate"/"research-chamber.mjs").read_text(encoding="utf8")
    assert "membrane.search(" not in chamber and "membrane.getRecord(" not in chamber
    assert 'id="vixenSynthesisSalon"' in candidate, "Vixen Salon absent"
    assert 'id="vixenElectricFoundry"' in candidate, "Vixen flagship Observatory missing"
    # RGI10: a single end-of-cascade couture design system must be shipped
    # with actual source-complete progressive gallery controls. It must not
    # replace or delete any original mathematical Folio.
    assert 'glinda-cybergoth-rgi10.css' in candidate, "Couture visual system not connected"
    assert 'vixen-stage-architecture-rgi10b.css' in candidate, "Staged performance architecture absent"
    assert 'glinda-spectacle-rgi11.css' in candidate, "Actual computational couture not enabled"
    assert 'vixen-electrical-breath-rgi13.css' in candidate, "Living Glinda mesh stylesheet absent"
    assert 'vixen-live-mesh-rgi13.mjs' in candidate, "Living 39-carrier mesh module not wired"
    assert 'vixen-opaline-couture-rgi14.css' in candidate, "No-plum Opaline architecture stylesheet absent"
    assert 'vixen-opaline-couture-rgi14.mjs' in candidate, "Source-conditioned Opaline couturier absent"
    assert (APP/"encyclopedia"/"vixen-estate"/"vixen-opaline-couture-rgi14.mjs").is_file(), "Opaline geometry is not present in distributable source"
    electrical=(APP/"encyclopedia"/"vixen-estate"/"vixen-live-mesh-rgi13.mjs")
    assert electrical.is_file(), "Living mesh module missing from declared Vixen estate"
    assert "OPERAHOUSE ≠ OPERA ≠ PERFORMER" in electrical.read_text(encoding="utf8"), "Optical mesh forgot research roles"
    assert "MESH_CONTRACT" in electrical.read_text(encoding="utf8"), "Visual machine contract missing"
    assert (APP/"encyclopedia"/"vixen-estate"/"vixen-salon-light.mjs").is_file(), "Computational 39-carrier Salon optical engine missing"
    assert "vixen-salon-light.mjs" in (APP/"encyclopedia"/"vixen-estate"/"synthesis-salon.mjs").read_text(encoding="utf8"), "Salon did not mount the optical computation"
    assert "🩰" not in (APP/"encyclopedia"/"vixen-estate"/"synthesis-salon.mjs").read_text(encoding="utf8"), "Literal emoji was substituted for costume"
    assert "🚬" not in (APP/"encyclopedia"/"vixen-estate"/"synthesis-salon.mjs").read_text(encoding="utf8"), "Literal emoji was substituted for costume"
    assert 'ef-proscenium' in (APP/"encyclopedia"/"vixen-estate"/"observatory-electric-foundry.mjs").read_text(encoding="utf8"), "Art remains dashboard tiles"
    assert 'ef-dial-cabinet' in (APP/"encyclopedia"/"vixen-estate"/"observatory-electric-foundry.mjs").read_text(encoding="utf8"), "Operator instrumentation curtain missing"
    architecture=(APP/"encyclopedia"/"vixen-estate"/"vixen-stage-architecture-rgi10b.css")
    assert architecture.is_file(), "Source-preserving theatrical architecture stylesheet omitted"
    assert 'id="formulaGalleryReveal"' in candidate and 'data-expanded="false"' in candidate, "Progressive original formula archive missing"
    visual=(APP/"encyclopedia"/"vixen-estate"/"glinda-cybergoth-rgi10.css")
    assert visual.is_file(), "RGI10 full-stack couture stylesheet omitted"
    assert "--arc-flash:#FFF2A9" in visual.read_text(encoding="utf8"), "Current Arc Flash must preserve pale blonde-electric discharge"
    assert "body[data-active-research-stage=\"OPERAHOUSE\"] #vixenRoomRail{display:none!important}" in visual.read_text(encoding="utf8"), "Foreign Opera rail may not enter Operahouse"

    assert 'observatory-electric-foundry.mjs' in candidate, "Live renderer not connected"
    for name in [
        "observatory-foundry.frag",
        "observatory-foundry-renderer.mjs",
        "observatory-foundry-kernel.mjs",
        "observatory-vixen-corpus.mjs",
        "observatory-electric-foundry.mjs",
        "observatory-electric-foundry.css"
    ]:
        assert (APP/"encyclopedia"/"vixen-estate"/name).is_file(), (
            "Visual source/renderer unavailable: " + name
        )
    shader=(APP/"encyclopedia"/"vixen-estate"/"observatory-foundry.frag").read_text(encoding="utf8")
    assert shader.startswith("#version 300 es") and "for(int i=0;i<39;i++)" in shader
    assert "data-foundry-mounted" in (APP/"encyclopedia"/"vixen-estate"/"observatory-electric-foundry.mjs").read_text(encoding="utf8") or "foundryMounted" in (APP/"encyclopedia"/"vixen-estate"/"observatory-electric-foundry.mjs").read_text(encoding="utf8")
    assert 'data-view="collection"' in candidate, "Research cart missing"
    for name in ["synthesis-salon.mjs","synthesis-salon.css","synthesis-salon-engine.mjs"]:
        assert (APP/"encyclopedia"/"vixen-estate"/name).is_file(), "Unpackaged Vixen Salon module: "+name
    podium=(REF/"podium"/"manifest.json")
    podium_routes = json.loads(podium.read_text(encoding="utf8"))["routes"] if podium.is_file() else []
    legacy_routes = {
        "podium.describe", "vixen.work.inspect", "vixen.gates.inspect",
        "universal.open", "universal.search", "universal.get", "universal.related",
        "synthesis.propose", "vixen.salon.compose", "experiment_b.preregister",
        "engine.capabilities", "engine.invoke"
    }
    fusion_routes = {
        "vixen.fusion.capabilities", "vixen.fusion.search",
        "vixen.fusion.compare", "vixen.fusion.explain"
    }
    route_ids = [item["id"] for item in podium_routes]
    compose_routes = {"podium.score", "podium.redpen", "podium.compose"}
    session_routes = {
        "vixen.ai.start", "vixen.ai.choose", "vixen.ai.report", "vixen.ai.status",
        "vixen.ai.notes", "vixen.ai.handoff", "vixen.ai.archive", "vixen.ai.finish"
    }
    expected_routes = legacy_routes | fusion_routes | compose_routes | session_routes
    assert (
        len(route_ids) == 27
        and len(route_ids) == len(expected_routes)
        and len(set(route_ids)) == len(route_ids)
        and set(route_ids) == expected_routes
    ), "Machine Podium must preserve 19 original routes and exactly eight role-locked AI session routes"
    ai_contract = json.loads(podium.read_text(encoding="utf8"))["ai_roles"]
    assert (
        ai_contract["single_active_role"] is True
        and ai_contract["role_change_requires_new_session"] is True
        and ai_contract["program_notes"].startswith("OFF_UNTIL_INDEPENDENT_HUMAN_PERMISSION_VERIFIED")
        and ai_contract["authority"]["corpus_mutations"] is False
    ), "Maestro and Composer must remain read-only, exclusive, and independently permission-gated"
    assert 'id="operahouseEncounter"' in candidate, "Independent Operahouse witness room missing"
    assert (REF/"vixen-operator-encounter.mjs").is_file()
    assert (REF/"vixen-operator-encounter.css").is_file()
    gateway=(REF/"vixen-read-gateway.mjs").read_text(encoding="utf8")
    assert "new TextDecoder('utf-8',{fatal:true})" in gateway
    assert "response.arrayBuffer()" in gateway

    index=json.loads((REF/"directory.json").read_text(encoding="utf8"))
    graph=json.loads((REF/"graph.json").read_text(encoding="utf8"))
    manifest=json.loads((REF/"manifest.json").read_text(encoding="utf8"))
    assert manifest["edition_version"]=="1.4" and manifest["record_count"]==1141
    assert len(index)==1141 and len(graph["edges"])==2131 and len({e["id"] for e in index})==1141
    for e in index:
        p=APP/"encyclopedia"/e["record_path"]
        assert e["record_path"]=="reference/records/"+e["id"]+".json" and p.is_file(),e["id"]
        data=p.read_bytes()
        canonical=data[:-1] if data.endswith(b"\n") else data
        assert sha(canonical)==e["record_sha256"],"Reference digest: "+e["id"]
    # Validate both pre-replacement embedded WebPs and post-replacement
    # operator-selected PNGs using the same machine-checkable contract.
    intake=ROOT/"scripts"/"install-vixen-brand-assets.py"
    assert intake.is_file(), "RGI15 frontispiece intake hook missing"
    intake_state=json.loads(subprocess.check_output(
        [sys.executable,str(intake),"--check"],cwd=ROOT,text=True))["stage"]
    base=[
        APP/"site-epoch-preflight.js",
        APP/"encyclopedia"/"index.html",
        APP/"encyclopedia"/"llms.txt",
        APP/"encyclopedia"/"vix-cyb.html"
    ]
    for folder in (APP/"encyclopedia"/"reference",APP/"encyclopedia"/"vixen-estate",APP/"encyclopedia"/"assets"/"vixen",APP/"encyclopedia"/"vix-cyb"):
        base += [f for f in folder.rglob("*") if f.is_file() and not f.name.startswith(".")]
    files={p.relative_to(APP).as_posix():p.read_bytes() for p in base}
    # The machine-only Podium CLI uses dynamically resolved modules; preserve
    # that runtime alongside the exact public assets without adding human UI.
    files["scripts/vixen-podium.mjs"]=(ROOT/"scripts"/"vixen-podium.mjs").read_bytes()
    files["scripts/vixen-podium-native-adapters.mjs"]=(ROOT/"scripts"/"vixen-podium-native-adapters.mjs").read_bytes()
    # One short root entrypoint per shipped preview; archival sources stay in
    # their original paths. An extracted public preview is not a full checkout.
    # Developer worktree quickstart remains in Git. Do not publish engineering
    # branch/authorization instructions in the visitor's portable archive.
    readme="""# Vixen Cybernetics · source-bound research preview

This self-contained preview serves the Vixen Opera and an independently
identified read-only reference archive. Start with the original Works, not
with a technical host console. Source identity, original authorship, model
demonstrations, and research proposals remain separate.

## First open

1. Unzip the preview archive into a local directory.
2. From that directory run python3 -m http.server 6130 (or a comparable
   local static HTTP server).
3. Visit http://127.0.0.1:6130/encyclopedia/vix-cyb.html.
4. Navigate with the Vixen room menu. Allow the page's local modules to
   load before interacting with the instruments.

Do not double-click the HTML file using a file:// URL; browser module
and same-origin source requests require HTTP.

## Source ownership

OPERAHOUSE ≠ OPERA ≠ PERFORMER.

- The shared hosting and independent reference retrieval constitute
  infrastructure, not a source of Vixen authorship.
- Vixen is its own source-conditioned Opera.
- Each of the 32 original Works and 53 linked manifestations retains its
  declared source and authorial uncertainty. Eight human identity gates
  remain for independent review. Twenty-one methods are documentary.

The reference archive remains independent. A verified reference digest or
lexical overlap cannot create a ratified relationship between studies.

## 01 · Works

Choose an original Work, then inspect its recorded manifestations, declared
metadata and readable manuscript text. Preserve original titles and source
identifiers. Missing original PDF bytes produce source-availability holds,
never invented text.

## 02 · Observatory

The six headliners are **{runtime_headliners}**.
These are Vixen source-conditioned instrument illustrations. Their visual
models and mathematical outputs are not independent empirical evidence.
Test instrument response, pause/still, readable labels and source access.

## 03 · Salon

Select two different original Works. Vary inquiry order without merging
their author identities. Explore source excerpts, diagnostic models and
falsifiable questions. The same local source-conditioned optical stage
animates the corset. On narrow mobile screens, its separate fixed-page
wallpaper is parked to preserve scroll coherence.

Draft comparisons and future controlled-study designs remain proposals.
Use Rest without forfeiting the chosen Works or question. The Research Cart
and local question export involve no privileged machine action.

## 04 · Folios

Compare two recorded manifestations of the SAME original Work. The
comparison is bounded by recorded metadata and any available original
source bodies. Do not infer a relationship with an unrelated reference
record or a new performer identity.

## 05 · Methods

Read the original source-declared methods as documentary material.
Distinguish preserved text from an independently executable and witnessed
method. Historic files are unchanged by the display.

## Podium · AI research companion

The human Podium suggests readable research questions and preserves local
review context, rather than displaying host-specific developer commands.
AI assistants should first read encyclopedia/vix-cyb/llms.txt.
The distinct machine-only contract at
encyclopedia/reference/podium/manifest.json defines 27 typed read,
proposal, review and collaboration routes. These are inert unless a
legitimately authorized runtime executes an explicit task. Merely
enumerating native adapters does not connect them or authorize writes.

A reader may consult the independently maintained encyclopedia/llms.txt
and reference manifest for the separate reference index. Its records
remain outside Vixen's original Work population and cannot self-ratify
cross-study warrants.

## Original artwork and portable integrity

Three separate assets remain operator selected: desktop frontispiece,
mobile frontispiece and the Arc-Flash-yellow vector fox. Do not
regenerate, recolor, crop or substitute the approved originals during
a performance or corpus experiment.

{frontispiece_state}

PREVIEW-MANIFEST.json contains the exact source revision and hashes.
The developer preview ZIP contains more reference files than the browser's
independent Save Session ZIP. Never attribute the developer package's
reference coverage to an ordinary browser-exported session.

## Evidence and future acquisition limits

The seven missing PDF documents plus one separate blind-archive document
are a planned 7 + 1 acquisition test, NOT observed hydration or admitted
source material at this version. Establish a frozen pre-acquisition
baseline and preserve separate custody for the seven and the one before
any source-utility comparison.

Human aesthetic/pedagogical acceptance, authorship and identity decisions,
publication approval, external source trust and scientific closure remain
independent. This preview grants no production, protected trial or
automatic source-admission authority.

No mirrors at the kiki.
OPERAHOUSE ≠ OPERA ≠ PERFORMER.
"""
    frontispiece_state=(
        "The selected desktop and mobile PNGs are served from separate files\n"
        "under encyclopedia/assets/vixen/. See asset-contract.json for hashes."
        if intake_state=="EXTERNAL_PNG_INSTALLED_REVIEW_PENDING" else
        "The desktop and mobile frontispieces use the historical inline WebP\n"
        "fallbacks until the operator supplies the selected 16:9 and 9:16 PNGs."
    )
    headliners=json.loads(subprocess.check_output(["node","--input-type=module","-e",
        "import {VIXEN_OPERA_HEADLINERS as h} from './app/encyclopedia/vixen-estate/vixen-stage-subject-contract.mjs'; process.stdout.write(JSON.stringify(h))"],cwd=ROOT,text=True))
    assert len(headliners)==6 and len(set(headliners))==6
    readme=readme.replace("{runtime_headliners}",", ".join(headliners))
    readme=readme.replace("{frontispiece_state}",frontispiece_state,1)
    source=head()
    file_manifest=[{"path":n,"sha256":sha(blob),"bytes":len(blob)} for n,blob in sorted(files.items())]
    files["README.md"]=readme.encode("utf8")
    files["PREVIEW-MANIFEST.json"]=(json.dumps({
        "schema":"td613.vixen.preview/v1","repository":"tauric-diana-613/TD613-TCP",
        "pr":1730,"source_commit":source,"route":"/encyclopedia/vix-cyb.html",
        "reference_count":len(index),"reference_edges":len(graph["edges"]),
        "status":"DRAFT_NOT_RELEASED","experiment_b_flight":"HELD",
        "human_closure":"RESERVED","files":file_manifest
    },ensure_ascii=False,indent=2)+"\n").encode("utf8")
    out.parent.mkdir(parents=True,exist_ok=True)
    with ZipFile(out,"w",ZIP_DEFLATED,compresslevel=8) as z:
        for name,blob in sorted(files.items()):
            info=ZipInfo(PREFIX+"/"+name,(2026,11,8,12,0,0))
            info.compress_type=ZIP_DEFLATED;info.external_attr=0o644<<16
            z.writestr(info,blob,compress_type=ZIP_DEFLATED,compresslevel=8)
    print(json.dumps({"archive":str(out),"source_commit":source,"files":len(files),
       "size_bytes":out.stat().st_size,"sha256":sha(out.read_bytes()),
       "reference_records":len(index),"reference_edges":len(graph["edges"])}))
if __name__=="__main__":
    ap=argparse.ArgumentParser()
    ap.add_argument("--out",default="artifacts/vixen-preview/Vixen_Encyclopedia_PR1730.zip")
    main(Path(ap.parse_args().out))
