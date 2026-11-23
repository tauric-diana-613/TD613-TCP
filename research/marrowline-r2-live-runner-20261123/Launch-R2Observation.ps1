#Requires -Version 5.1
<#
.SYNOPSIS
TD613 Marrowline R2 Operator Launch Workflow (Windows PowerShell)
Commission: TD613-MARROWLINE-R2-LIVE-RUNNER-20261123

.DESCRIPTION
Provides a safe, friction-minimized Windows PowerShell launcher for independent R2-U or R2-W observations:
1. Default offline preflight (zero credentials, zero network calls) showing exact HEAD, digests, and plan.
2. Separate estate-isolated local directories under %LOCALAPPDATA%\TD613\marrowline-r2\<estate>\<sessionId>.
3. Explicit single-use Ed25519 human authorization (either external signed -GrantFile or human interactive signing prompt).
4. Readable progress output, mid-flight Ctrl+C / revocation-file STOP support, non-secret summary output,
   and automatic in-process API key / passphrase cleanup in finally.
#>

[CmdletBinding(SupportsShouldProcess = $true)]
param(
  [Parameter(Mandatory = $false)]
  [ValidateSet('R2-U', 'R2-W')]
  [string]$Estate = 'R2-U',

  [Parameter(Mandatory = $false)]
  [string]$Plan = 'INITIAL_PILOT',

  [Parameter(Mandatory = $false)]
  [string]$EpisodesJsonPath = '',

  [Parameter(Mandatory = $false)]
  [string]$EvidenceRoot = '',

  [Parameter(Mandatory = $false)]
  [string]$GrantFile = '',

  [Parameter(Mandatory = $false)]
  [string]$PublicKeyFile = '',

  [Parameter(Mandatory = $false)]
  [string]$PrivateKeyFile = '',

  [Parameter(Mandatory = $false)]
  [switch]$SignInteractively,

  [Parameter(Mandatory = $false)]
  [switch]$ExecuteLive,

  [Parameter(Mandatory = $false)]
  [switch]$SkipCountTokens
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = (Resolve-Path (Join-Path $ScriptDir '..\..')).Path
$RunnerScript = if ($Estate -eq 'R2-U') {
  Join-Path $ScriptDir 'run-r2-u-observation.mjs'
} else {
  Join-Path $ScriptDir 'run-r2-w-observation.mjs'
}
$SignerScript = Join-Path $ScriptDir 'sign-r2-grant-interactive.mjs'
$AckFlag = if ($Estate -eq 'R2-U') { '--ack-live-r2-u-observation' } else { '--ack-live-r2-w-observation' }
$EstateSlug = if ($Estate -eq 'R2-U') { 'r2-u' } else { 'r2-w' }

function Clear-SensitiveEnvAndVars {
  param([string[]]$VarNames = @())
  if (Test-Path Env:\GEMINI_API_KEY) {
    Remove-Item Env:\GEMINI_API_KEY -ErrorAction SilentlyContinue
  }
  foreach ($v in $VarNames) {
    Remove-Variable -Name $v -Scope Local -Force -ErrorAction SilentlyContinue
  }
  [System.GC]::Collect()
}

# Step 1: Always run offline preflight first (0 network, 0 credentials)
Write-Host "=== TD613 MARROWLINE $Estate PREFLIGHT ($Plan) ===" -ForegroundColor Cyan
$preflightArgs = @($RunnerScript, '--plan', $Plan)
$EpisodesFull = if ($EpisodesJsonPath) { [System.IO.Path]::GetFullPath($EpisodesJsonPath) } else { '' }
if ($EpisodesFull) {
  $preflightArgs += @('--episodes-json', $EpisodesFull)
}
Push-Location $RepoRoot
try {
  $preflightRaw = & node @preflightArgs
  $preflightExit = $LASTEXITCODE
} finally {
  Pop-Location
}
if ($preflightExit -ne 0) {
  throw "Preflight failed for $Estate with exit code $preflightExit."
}
$preflight = $preflightRaw | ConvertFrom-Json
Write-Host "Experiment     : $($preflight.experimentId)"
Write-Host "Pinned Model   : $($preflight.pinnedModel) (thinkingLevel=$($preflight.thinkingLevel), maxOutputTokens=$($preflight.publishedOutputCapacityTokens))"
Write-Host "Checked-Out SHA: $($preflight.checkedOutHeadSha)"
Write-Host "Trust Anchor   : $($preflight.trustedPublicKeyFingerprintSha256)"
Write-Host "Host Nonce Reg : $($preflight.hostNonceRegistryDir) (fixed non-relocatable host ledger)"
Write-Host "Planned Scope  : $($preflight.selectedPlan.planId) -> $($preflight.selectedPlan.intendedScope) ($($preflight.selectedPlan.episodeCount) episode(s))"
Write-Host "Plan Digest    : $($preflight.selectedPlan.planDigestSha256)"
Write-Host "Artificial Caps: $($preflight.resourceCeilingsImposedByTD613)"

if (-not $ExecuteLive) {
  Write-Host ""
  Write-Host "OFFLINE PREFLIGHT COMPLETE (0 Gemini calls, 0 keys touched)." -ForegroundColor Green
  Write-Host "To authorize a live run, re-run with -ExecuteLive and either -GrantFile/-PublicKeyFile or -SignInteractively."
  return
}

if (-not [Environment]::UserInteractive) {
  throw 'Refusing live launch in non-interactive host session; direct human terminal presence is required.'
}

$SessionStamp = [DateTime]::UtcNow.ToString('yyyyMMddTHHmmssZ') + '_' + ([guid]::NewGuid().ToString('N').Substring(0, 8))
$BaseLocalDir = if ($EvidenceRoot) {
  $EvidenceRoot
} elseif ($env:LOCALAPPDATA) {
  Join-Path $env:LOCALAPPDATA "TD613\marrowline-r2\$EstateSlug"
} else {
  throw 'Provide -EvidenceRoot when LOCALAPPDATA is unavailable.'
}
$SessionDir = [System.IO.Path]::GetFullPath((Join-Path $BaseLocalDir $SessionStamp))
$OutReceiptPath = Join-Path $SessionDir "$EstateSlug-custody-receipt.json"
$RevocationPath = Join-Path $SessionDir "$EstateSlug-revocation.json"

New-Item -ItemType Directory -Path $SessionDir -Force | Out-Null

if ($SignInteractively) {
  if (-not $PrivateKeyFile) {
    $PrivateKeyFile = Read-Host 'Path to your encrypted Ed25519 private key PEM'
  }
  if (-not (Test-Path -LiteralPath $PrivateKeyFile)) {
    throw "Private key PEM file not found: $PrivateKeyFile"
  }
  $GrantFile = Join-Path $SessionDir "$EstateSlug-single-use.grant.json"
  $PublicKeyFile = Join-Path $SessionDir "$EstateSlug-operator.pub.pem"

  $secPass = Read-Host -AsSecureString 'Enter Ed25519 private-key passphrase (hidden, not stored)'
  $bstr = [System.IntPtr]::Zero
  $plainPass = ''
  try {
    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secPass)
    $plainPass = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
    $signArgs = @(
      $SignerScript,
      '--sign-interactively',
      '--estate', $Estate,
      '--plan', $Plan,
      '--private-key-file', $PrivateKeyFile,
      '--out-grant-file', $GrantFile,
      '--out-public-key-file', $PublicKeyFile
    )
    if ($EpisodesFull) {
      $signArgs += @('--episodes-json', $EpisodesFull)
    }
    Push-Location $RepoRoot
    try {
      $signedOut = $plainPass | & node @signArgs
      $signExit = $LASTEXITCODE
    } finally {
      Pop-Location
    }
    if ($signExit -ne 0) {
      throw 'Interactive Ed25519 grant signing failed.'
    }
  } finally {
    if ($bstr -ne [System.IntPtr]::Zero) {
      [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }
    if ($secPass) { $secPass.Dispose() }
    $plainPass = $null
    [System.GC]::Collect()
  }
  Write-Host "Single-use $Estate Ed25519 grant signed for plan $($preflight.selectedPlan.planId) ($($preflight.selectedPlan.planDigestSha256)) at HEAD $($preflight.checkedOutHeadSha)." -ForegroundColor Yellow
}

if (-not $GrantFile -or -not $PublicKeyFile) {
  throw 'Both -GrantFile and -PublicKeyFile (or -SignInteractively) are required for -ExecuteLive.'
}

$GrantFull = [System.IO.Path]::GetFullPath($GrantFile)
$PubKeyFull = [System.IO.Path]::GetFullPath($PublicKeyFile)

Write-Host ""
Write-Host "Evidence Directory : $SessionDir"
Write-Host "Revocation File    : $RevocationPath (write { `"revokeAll`": true } to abort active stream)"
Write-Host "Receipt Output     : $OutReceiptPath"

$confirm = Read-Host "Type EXECUTE $Estate to dispatch live observation (anything else aborts safely)"
if ($confirm -cne "EXECUTE $Estate") {
  Write-Host 'Aborted by operator before API key input or dispatch.' -ForegroundColor Yellow
  return
}

$hadExistingApiKey = Test-Path Env:\GEMINI_API_KEY
$secApiKey = $null
$apiBstr = [System.IntPtr]::Zero
try {
  if (-not $hadExistingApiKey) {
    $secApiKey = Read-Host -AsSecureString 'Enter Gemini API key (memory-only for this run, auto-cleared on exit)'
    $apiBstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secApiKey)
    $env:GEMINI_API_KEY = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($apiBstr)
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($apiBstr)
    $apiBstr = [System.IntPtr]::Zero
  }

  $nodeArgs = @(
    $RunnerScript,
    '--execute',
    $AckFlag,
    '--grant-file', $GrantFull,
    '--public-key-file', $PubKeyFull,
    '--evidence-dir', $SessionDir,
    '--out', $OutReceiptPath,
    '--revocation-file', $RevocationPath,
    '--plan', $Plan
  )
  if ($EpisodesJsonPath) {
    $nodeArgs += @('--episodes-json', ([System.IO.Path]::GetFullPath($EpisodesJsonPath)))
  }
  if ($SkipCountTokens) {
    $nodeArgs += '--skip-count-tokens'
  }

  Push-Location $RepoRoot
  try {
    $null = & node @nodeArgs
    $runExit = $LASTEXITCODE
  } finally {
    Pop-Location
  }

  $summaryFile = "$OutReceiptPath.summary.txt"
  if (Test-Path -LiteralPath $summaryFile) {
    Write-Host ""
    Write-Host '=== NON-SECRET RECEIPT SUMMARY ===' -ForegroundColor Green
    Get-Content -LiteralPath $summaryFile | Write-Host
  }
  if ($runExit -ne 0) {
    throw "Runner exited with code $runExit. Check custody receipt at $OutReceiptPath"
  }
} finally {
  if ($apiBstr -ne [System.IntPtr]::Zero) {
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($apiBstr)
  }
  if ($secApiKey) { $secApiKey.Dispose() }
  if (-not $hadExistingApiKey) {
    Clear-SensitiveEnvAndVars -VarNames @('apiBstr', 'secApiKey', 'plainPass')
  } else {
    Write-Host 'Note: GEMINI_API_KEY existed before launch; clearing transient local script buffers only.' -ForegroundColor DarkGray
  }
}
