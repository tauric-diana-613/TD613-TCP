#!/usr/bin/env python3
"""Create the exact-head Vixen HTTP preview from public app assets only."""
import argparse, hashlib, json, os, re, subprocess
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
    assert "--arc-flash:#dbc9ff" in visual.read_text(encoding="utf8"), "Mustard accent remained authoritative"
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
    assert (
        podium.is_file()
        and len(json.loads(podium.read_text(encoding="utf8"))["routes"]) == 12
    ), "Machine Podium / Salon bridge contract missing"
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
    base=[
        APP/"site-epoch-preflight.js",
        APP/"encyclopedia"/"index.html",
        APP/"encyclopedia"/"vix-cyb.html"
    ]
    for folder in (APP/"encyclopedia"/"reference",APP/"encyclopedia"/"vixen-estate"):
        base += [f for f in folder.rglob("*") if f.is_file() and not f.name.startswith(".")]
    files={p.relative_to(APP).as_posix():p.read_bytes() for p in base}
    # The machine-only Podium CLI uses dynamically resolved modules; preserve
    # that runtime alongside the exact public assets without adding human UI.
    files["scripts/vixen-podium.mjs"]=(ROOT/"scripts"/"vixen-podium.mjs").read_bytes()
    files["scripts/vixen-podium-native-adapters.mjs"]=(ROOT/"scripts"/"vixen-podium-native-adapters.mjs").read_bytes()
    readme="""# Vixen Cybernetics Encyclopedia / PR #1730 browser preview

This exact-Git-HEAD preview contains the Vixen operator-facing page,
its historical 32 Works / eight identity gates / 21 protocols, and the
SEPARATE 1,141-record Universal reference estate.

## Start in a web browser

1. Unzip the archive. Open a terminal in this extracted directory
   (the one containing the encyclopedia subfolder).
2. Run either:
       Windows:        py -m http.server 6130
       macOS / Linux:  python3 -m http.server 6130
3. Open http://127.0.0.1:6130/encyclopedia/vix-cyb.html

Do not open the HTML by double-clicking (file scheme blocks the modules
and reference requests). A local HTTP server is sufficient: GitHub main
and public TD613.com deployment are not required.

## Test the Vixen Electric Foundry — six completed flagship instrument surfaces

1. Navigate to **01 · Observatory**. The previous four-tab stage recedes
   automatically; the chrome computation theater, not the old four-model
   interface, becomes the primary interactive instrument.
2. The six headliners are **TCC-01, TCC-04, TCC-05, RC-03, RC-07,
   and RC-10**. Select each, inspect its exact recorded Vixen folio
   title and original formula, and verify the live mathematical readout.
3. Move Gain, Witness, Impulse Voltage and Refractive Twist; GPU/CPU
   output, diagnostics and probe state respond causally.
4. Hover to interrogate local field gradients; click to PIN a probe.
   The computation is synthetic and source-typed, not empirical proof.
5. Use Pause/Resume and Single Frame, then visit another view.
   The frame loop is host-controlled and stops offstage.
6. Inspect the **39 visual delivery carriers**: 6 near / 13 mid / 20 far.
   These belong to Loom's optical engine; they are never described as
   Em's independently sourced authored works.
7. View other Vixen folios in the historical catalogue: the complete
   22-formula register and six giveback routes remain discoverable.
   Registration is not a claim that twenty-eight equal-quality
   simulations have been built.
8. The GLSL renderer is in `observatory-foundry.frag`; the control
   and custody kernel is `observatory-vixen-corpus.mjs`. Both are
   included in this portable HTTP preview.

## Test the source-first Vixen Synthesis Salon (one coherent creative Opera)

1. Choose **06 · Salon** from the top menu, or **Synthesis Salon & Research Cart** from the mobile navigation.
2. Inspect *two original Vixen Works* and deliberately select one archival
   manifestation for each. Confirm IDs, distinct authorship, original filenames,
   declared SHA-256 digests and any unadjudicated human gate.
3. Choose one of the six source-recorded giveback tracks and a separate
   documentary method from the 21-instrument source list.
4. Switch encounter route I→II vs II→I. The route history changes while
   source identities remain invariant.
5. Move **Synthetic arrival lag** between 0 and 120 ticks. The five-clock
   visual score must change causally, while its labels still refuse to claim
   equivalence among transformer, token, surrogate, wall, and 48 kHz clocks.
6. Add both Works to the **existing Research Cart**, which survives from the
   previous Vixen implementation. Saved items must be visible in the source
   tray; no sale, backend submission, or foreign performer is permitted.
7. Compose a source-attributed question or supply your own; inspect the
   falsifiable predicate, counterworld, evidence deficits and the
   unexecuted four-arm Experiment B competent-union comparison. Refract
   encounter order. Use Rest and Resume and inspect the preserved question.
8. Export the **local** question receipt or copy an inert Podium JSON batch.
   These operations invoke no native tools, run no protected Flight,
   admit no record and grant no scientific closure.

## Test the Vixen Opera (source-bound Folios)

1. Open **07 · Vixen Folios**; select one of the 32 historical Vixen Works.
2. Inspect its recorded manifestations. Choose two manifestations of the
   **same Work**, then select **Begin this Work's comparison**.
3. Select **Observe the recorded differences**. This observation reports
   only declared catalogue metadata; original source bodies remain withheld.
4. Choose **Name an unresolved question**, optionally annotate it locally,
   **Rest without penalty**, and resume without an identity adjudication.
5. Visit the Observatory and eight unclosed human gates. Review the phone
   layout: the initial Folio should appear without scrolling past a giant
   proscenium. Source records outside the Vixen estate are not performers here.

## Test the independent Operahouse reading room (intentional encounter)

1. While on Vixen Folios, explicitly choose **Enter Operahouse reading
   room — Vixen leaves the stage**. Vixen becomes hidden as the separate
   reading room opens; the two source estates remain independently typed.
2. Select a Vixen Work and an actually recorded manifestation on the left.
3. Explicitly click **Open independent read-only estate**. This loads the
   Universal directory and graph census only, without authorizing a link.
4. Enter a separately chosen Universal query (e.g. G-101); search the
   reference estate, then select a result to fetch and verify its exact
   canonical JSON bytes using fatal UTF-8 and browser SHA-256.
5. Inspect the bounded canonical payload and the separate Universal graph
   edge count. Then click **Observe separately** to obtain an unratified,
   session-local third-order receipt. It MUST report relationship
   UNESTABLISHED and zero human-ratified cross-opera warrants.
6. Rest and resume. Then choose **Return to Vixen Opera**. The separate
   Operahouse room is hidden before Vixen becomes visible again. A Universal
   record must never appear as a Vixen Performer or historical Vixen source.
7. Alter a record payload or serve malformed UTF-8 in an isolated test
   fixture: integrity must fail CLOSED. The CI tests include both negatives.

The **separate** Universal reference estate remains packaged for independent
Encyclopedia research. The witness room makes a bounded, operator-initiated
confrontation available without assigning a counterpart or transferring
authorship by lexical proximity. The native SQLite receiver remains separate.

## Machine-only Podium · agent-led but human-authorized

The machine-facing contract lives at `encyclopedia/reference/podium/manifest.json`.
The operator-facing Vixen UI remains untouched by this extra task plane.
Podium task routes are typed JSON, not hidden visual buttons or auto-agents.

From this extracted preview root, the public-asset-only CLI supports:
    node scripts/vixen-podium.mjs --manifest
    node scripts/vixen-podium.mjs --input YOUR_TASK_BATCH.json

A task is a JSON object:
    {"schema":"td613.vixen.podium.task/v1","intent":"podium.describe","params":{}}

A batch is a JSON array of such objects; their sequence matters.
For actual read operations use universal.open, universal.search,
universal.get, universal.related, then synthesis.propose.
New Opera-native tasks `vixen.salon.compose` and
`experiment_b.preregister` use exactly the same source-bound kernel
as the human Synthesis Salon, but return held unexecuted proposals.
Neither converts a declared Work hash into original-body verification. The system
refuses unseen records, unratified crosswalks and unconnected native
research engines. Rulefield, Atlas, Aperture, Dollhouse, and the native
Universal Atelier receiver have **explicit adapter slots**, not
imaginary built-in providers. They can execute only when a separately
authorized host supplies real native tool implementations.

A full repository checkout can enable the qualified native-read adapters
through a separate, operator-directed invocation:
  TD613_PODIUM_OPERATOR_DIRECT=1 node scripts/vixen-podium.mjs --native-read-tools --input YOUR_TASK_BATCH.json
That shell-level attestation is a host declaration, not independent identity
proof. The portable preview contains the adapter *source* but not the
Dollhouse/Aperture/Atlas engine runtime; missing engines remain HELD.
Task JSON cannot authorize native execution.

The machine receipts are session-local research material, not signed
human custody, empirical surplus, or automatic approval.

## Scope and limits

Source edition 1.4 is read-only. The separately developed native
Universal Atelier SQLite backend is NOT wired into production here.
No private Em source bodies; no backend source mutation or automatic
scientific promotion; no protected Experiment B launch; no release.
The browser witness verifies source bytes and distinct custody loci, not
a substantive cross-estate relationship or a scientific surplus.
Unmatched terms and unavailable references must produce honest HELD
or bounded-negative outcomes.
See PREVIEW-MANIFEST.json for exact commit and file hashes.
"""
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
