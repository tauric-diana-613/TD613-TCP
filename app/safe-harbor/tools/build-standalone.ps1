$ErrorActionPreference = 'Stop'

$safeHarborRoot = Split-Path -Parent $PSScriptRoot
$outputPath = Join-Path $safeHarborRoot 'TD613_Safe_Harbor_Standalone.html'

function Read-Utf8 {
  param([string]$Path)
  return [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
}

function Write-Utf8 {
  param(
    [string]$Path,
    [string]$Content
  )
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

function Inline-ScriptTag {
  param([string]$Path)
  $content = Read-Utf8 $Path
  return "<script>`n$content`n</script>"
}

$indexPath = Join-Path $safeHarborRoot 'index.html'
$stylesPath = Join-Path $safeHarborRoot 'app\styles.css'
$dataPath = Join-Path $safeHarborRoot 'app\data.js'
$canonicalizePath = Join-Path $safeHarborRoot 'safe_harbor\canonicalize.js'
$hashPath = Join-Path $safeHarborRoot 'safe_harbor\hash.js'
$signaturePath = Join-Path $safeHarborRoot 'safe_harbor\signature.js'
$lifecyclePath = Join-Path $safeHarborRoot 'safe_harbor\lifecycle.js'
$mainPath = Join-Path $safeHarborRoot 'app\main.js'

$index = Read-Utf8 $indexPath
$styles = Read-Utf8 $stylesPath

$extraStyles = @"

.standalone-annex {
  padding: 18px 16px 28px;
  border-top: 1px solid var(--line);
  background:
    linear-gradient(180deg, rgba(9, 11, 18, 0.82), rgba(6, 8, 15, 0.92)),
    radial-gradient(circle at top right, rgba(139, 233, 253, 0.04), transparent 28%);
}

.standalone-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.standalone-grid .operator-pane {
  grid-column: 1 / -1;
}

.standalone-intro {
  max-width: 76ch;
  margin-bottom: 16px;
}

.standalone-field {
  display: grid;
  gap: 10px;
}

.standalone-field input {
  width: 100%;
}

@media (max-width: 920px) {
  .standalone-annex {
    padding: 16px;
  }

  .standalone-grid {
    grid-template-columns: 1fr;
  }

  .standalone-grid .operator-pane {
    grid-column: auto;
  }
}
"@

$inlineStyle = @"
<style>
$styles
$extraStyles
</style>
"@

$annexHtml = @"
  <section class="standalone-annex">
    <div class="section-label">Standalone Annex</div>
    <p class="standalone-intro note">This single-file artifact inlines the Safe Harbor chamber and embeds compact verify and capsule surfaces so the packet seam, public footer grammar, and operator packet view can travel together without separate local HTML dependencies.</p>
    <div class="standalone-grid">
      <article class="surface-card">
        <div class="surface-head">
          <span class="surface-kicker">Embedded verify</span>
          <span class="surface-state" id="standaloneVerifyState">not verified</span>
        </div>
        <h2>Verify Surface</h2>
        <div class="metric-block roomy">
          <div class="metric-row"><span class="label">Public mode</span><span class="value" id="standalonePublicMode">LEGACY-COMPAT</span></div>
          <div class="metric-row"><span class="label">Binding fragment</span><span class="value" id="standaloneBindingFragment">#9B07D8B</span></div>
          <div class="metric-row"><span class="label">SAC</span><span class="value" id="standaloneSac">SAC[X6ZNK5NO51]</span></div>
          <div class="metric-row"><span class="label">Receipt state</span><span class="value" id="standaloneReceiptState">awaiting ingress</span></div>
          <div class="metric-row"><span class="label">Packet state</span><span class="value" id="standaloneLifecycleState">staged</span></div>
        </div>
        <div class="footer-template" id="standaloneTemplateFooter">TD613-Binding:#9B07D8B/SAC[X6ZNK5NO51] · payload {n} · YYYY-MM-DD · ⟐</div>
        <div class="footer-template secondary" id="standaloneHistoricalFooter">TD613-Binding:#9B07D8B/SAC[X6ZNK5NO51] · payload 5 · 2025-10-17 · ⟐</div>
        <div class="note" id="standaloneLiveRule">Suggest next payload from signed bundle if available; manual override only in operator mode.</div>
      </article>

      <article class="surface-card">
        <div class="surface-head">
          <span class="surface-kicker">Embedded capsule</span>
          <span class="surface-state" id="standaloneFooterCheckState">awaiting footer</span>
        </div>
        <h2>Footer Capsule</h2>
        <p class="surface-copy">Paste a TD613 public footer to check compat grammar inside the standalone artifact. Historical payload 5 / 2025-10-17 stays explicitly historical.</p>
        <label class="standalone-field">
          <span class="label">Footer input</span>
          <input id="standaloneFooterInput" type="text" placeholder="TD613-Binding:#9B07D8B/SAC[X6ZNK5NO51] · payload {n} · YYYY-MM-DD · ⟐">
        </label>
        <div class="button-grid">
          <button class="control" id="standaloneFooterCheck" type="button">Check Footer</button>
          <button class="control secondary" id="standaloneFooterFill" type="button">Use Live Template</button>
        </div>
        <pre id="standaloneFooterCheckOutput" class="code-panel">awaiting footer</pre>
      </article>

      <article class="surface-card operator-pane">
        <div class="surface-head">
          <span class="surface-kicker">Operator annex</span>
          <span class="surface-state" id="standaloneSigType">none</span>
        </div>
        <h2>Packet + Signature View</h2>
        <div class="metric-block roomy">
          <div class="metric-row"><span class="label">Packet hash</span><span class="value" id="standalonePacketHash">pending</span></div>
          <div class="metric-row"><span class="label">Sig type</span><span class="value" id="standaloneSigTypeReadout">none</span></div>
          <div class="metric-row"><span class="label">kid</span><span class="value" id="standaloneSigKid">pending</span></div>
          <div class="metric-row"><span class="label">Cadence distinction</span><span class="value" id="standaloneCadenceNote">stylometric credential</span></div>
          <div class="metric-row"><span class="label">Crypto distinction</span><span class="value" id="standaloneCryptoNote">detached seal</span></div>
        </div>
        <div class="subsection-label">Canonical JSON Preview</div>
        <pre id="standaloneCanonicalPreview" class="code-panel">canonical JSON pending</pre>
        <div class="subsection-label">Detached Signature Preview</div>
        <pre id="standaloneSignaturePreview" class="code-panel">signature wrapper pending</pre>
      </article>
    </div>
  </section>
"@

$annexScript = @'
(function () {
  'use strict';

  var D = window.TD613_SAFE_HARBOR_DATA;
  var Core = window.TD613SafeHarborCore || {};
  if (!D) return;

  function $(id) { return document.getElementById(id); }

  function readSession() {
    try {
      var raw = sessionStorage.getItem('td613.safe-harbor.session.v1');
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      return {};
    }
  }

  function setText(id, value) {
    var el = $(id);
    if (el) el.textContent = value == null ? '' : String(value);
  }

  function canonicalPreview(packet) {
    if (!packet) return 'canonical JSON pending';
    if (window.TD613SafeHarbor && typeof window.TD613SafeHarbor.canonicalizePacket === 'function') {
      return window.TD613SafeHarbor.canonicalizePacket() || 'canonical JSON pending';
    }
    if (typeof Core.canonical_packet_body === 'function') {
      return Core.canonical_packet_body(packet);
    }
    return JSON.stringify(packet, null, 2);
  }

  function lifecycleState(packet, sig) {
    if (typeof Core.lifecycle_state === 'function') {
      return Core.lifecycle_state(packet, sig);
    }
    if (!packet || !packet.receipt) return 'staged';
    if (sig && sig.status === 'verified') return 'verified';
    if (sig && sig.sig) return 'exported';
    return packet.receipt.state || 'staged';
  }

  function verifyState(sig) {
    if (typeof Core.verification_state === 'function') {
      return Core.verification_state(sig);
    }
    return sig && sig.status === 'verified' ? 'verified' : 'not verified';
  }

  function validateFooter(value) {
    if (!value) {
      return { state: 'awaiting footer', message: 'No footer supplied.' };
    }

    if (value === D.canon.historical_example.public_footer) {
      return {
        state: 'historical',
        message: 'Historical example recognized. This line stays pinned to payload ' + D.canon.historical_example.payload_index + ' / ' + D.canon.historical_example.attestation_date + '.'
      };
    }

    var compatPattern = /^TD613-Binding:#9B07D8B\/SAC\[X6ZNK5NO51\] · payload (?:\{n\}|\d+) · (?:YYYY-MM-DD|\d{4}-\d{2}-\d{2}) · ⟐$/u;
    var legacyPattern = /^TD613-Binding:#9B07D8B · payload (?:\{n\}|\d+) · (?:YYYY-MM-DD|\d{4}-\d{2}-\d{2}) · ⟐$/u;
    var sacOnlyPattern = /^TD613-Binding:SAC\[X6ZNK5NO51\] · payload (?:\{n\}|\d+) · (?:YYYY-MM-DD|\d{4}-\d{2}-\d{2}) · ⟐$/u;

    if (compatPattern.test(value) || legacyPattern.test(value) || sacOnlyPattern.test(value)) {
      return { state: 'accepted', message: 'Accepted footer grammar. Public default remains LEGACY-COMPAT.' };
    }

    return { state: 'rejected', message: 'Footer does not match TD613 accepted grammar.' };
  }

  function refreshStandaloneAnnex() {
    var session = readSession();
    var packet = session.packet || null;
    var sig = session.signatureEnvelope || null;

    setText('standalonePublicMode', D.trustProfile.current_public_mode);
    setText('standaloneBindingFragment', D.canon.binding_fragment);
    setText('standaloneSac', D.canon.sac);
    setText('standaloneTemplateFooter', packet && packet.canon ? packet.canon.public_footer : D.trustProfile.public_footer_template);
    setText('standaloneHistoricalFooter', D.canon.historical_example.public_footer);
    setText('standaloneLiveRule', D.trustProfile.live_template_rule);
    setText('standaloneReceiptState', packet && packet.receipt ? (packet.receipt.state_summary || packet.receipt.state) : 'awaiting ingress');
    setText('standaloneLifecycleState', lifecycleState(packet, sig));
    setText('standaloneVerifyState', verifyState(sig));
    setText('standalonePacketHash', packet && packet.packet_hash_sha256 ? packet.packet_hash_sha256 : 'pending');
    setText('standaloneSigType', sig && sig.sig_type ? sig.sig_type : 'none');
    setText('standaloneSigTypeReadout', sig && sig.sig_type ? sig.sig_type : 'none');
    setText('standaloneSigKid', sig && sig.kid ? sig.kid : 'pending');
    setText('standaloneCadenceNote', D.signatureModel.cadence_signature);
    setText('standaloneCryptoNote', D.signatureModel.cryptographic_signature);
    setText('standaloneCanonicalPreview', canonicalPreview(packet));
    setText('standaloneSignaturePreview', sig ? JSON.stringify(sig, null, 2) : 'signature wrapper pending');
  }

  function runFooterCheck() {
    var input = $('standaloneFooterInput');
    if (!input) return;
    var result = validateFooter((input.value || '').trim());
    setText('standaloneFooterCheckState', result.state);
    setText('standaloneFooterCheckOutput', result.message);
  }

  var footerInput = $('standaloneFooterInput');
  var footerCheck = $('standaloneFooterCheck');
  var footerFill = $('standaloneFooterFill');

  if (footerCheck) footerCheck.addEventListener('click', runFooterCheck);
  if (footerFill) {
    footerFill.addEventListener('click', function () {
      if (footerInput) footerInput.value = D.trustProfile.public_footer_template;
      runFooterCheck();
    });
  }
  if (footerInput) {
    footerInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        runFooterCheck();
      }
    });
  }

  if (D.hookBus && D.hookBus.events && D.hookBus.events.packet) {
    window.addEventListener(D.hookBus.events.packet, function () {
      window.setTimeout(refreshStandaloneAnnex, 0);
    });
  }

  ['covenantExport', 'resealVault', 'clearIngress', 'bypassIngress', 'demoTcpHook', 'demoEoHook', 'demoSignatureHook', 'resetHooks'].forEach(function (id) {
    var el = $(id);
    if (!el) return;
    el.addEventListener('click', function () {
      window.setTimeout(refreshStandaloneAnnex, 0);
    });
  });

  refreshStandaloneAnnex();
})();
'@

$index = $index.Replace('<link rel="stylesheet" href="app/styles.css">', $inlineStyle)
$index = $index.Replace('</main>', '</main>' + "`r`n" + $annexHtml)
$index = $index.Replace('  <script src="app/data.js"></script>', $(Inline-ScriptTag -Path $dataPath))
$index = $index.Replace('  <script src="safe_harbor/canonicalize.js"></script>', $(Inline-ScriptTag -Path $canonicalizePath))
$index = $index.Replace('  <script src="safe_harbor/hash.js"></script>', $(Inline-ScriptTag -Path $hashPath))
$index = $index.Replace('  <script src="safe_harbor/signature.js"></script>', $(Inline-ScriptTag -Path $signaturePath))
$index = $index.Replace('  <script src="safe_harbor/lifecycle.js"></script>', $(Inline-ScriptTag -Path $lifecyclePath))
$index = $index.Replace('  <script src="app/main.js"></script>', $(Inline-ScriptTag -Path $mainPath) + "`r`n<script>`n$annexScript`n</script>")

Write-Utf8 -Path $outputPath -Content $index
Write-Output ('Standalone built: ' + $outputPath)
