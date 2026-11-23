# TD613 GA03 · Operator-local encrypted artifact preservation
# This file is a handoff for an operator to run on their own Windows host.
# It has ZERO network, decryption, private-key, source-admission or sync logic.
# It NEVER uploads, extracts, opens plaintext or transmits the artifact.
#
# SHA below is GitHub's reported artifact ZIP digest (not inner ciphertext SHA).
# Verify its independent GitHub provenance before treating it as authoritative.
# No automatic execution, model access, service creation or Flight grant.

[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string]$DownloadedEncryptedZip,
  [Parameter(Mandatory=$true)][string]$OperatorVaultDirectory,
  [Parameter(Mandatory=$true)][string]$IndependentReceiptDirectory,
  [Parameter(Mandatory=$true)][switch]$IUnderstandThisCopiesOnlyEncryptedZipLocally
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
if (-not $IUnderstandThisCopiesOnlyEncryptedZipLocally) {
  throw 'GA03_OPERATOR_MANUAL_CUSTODY_DECISION_REQUIRED'
}

$ExpectedSha256 = 'f8e3a09e0344b40aa6b56fbd5ef24c793dc02b056e24506568ba63456f7b92c1'
$ArtifactId = 13166173531
$RunId = 41496125645
$ExpiryUtc = '2027-01-31T17:58:21Z'
$DestinationName = 'wendbine-operator-encrypted-41496125645.zip'

function Require-LocalFileSystemPath([string]$p, [string]$name, [bool]$requireFile) {
  $item = Get-Item -LiteralPath $p -Force -ErrorAction Stop
  if ($item.FullName.StartsWith('\\')) { throw "GA03_UNC_NETWORK_PATH_REFUSED: $name" }
  if ($requireFile -and $item.PSIsContainer) { throw "GA03_NOT_A_FILE: $name" }
  if ((-not $requireFile) -and (-not $item.PSIsContainer)) { throw "GA03_NOT_A_DIRECTORY: $name" }
  $current = $item
  while ($null -ne $current) {
    if (($current.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
      throw "GA03_REPARSE_PATH_REFUSED: $name"
    }
    $current = $current.Parent
  }
  return $item.FullName
}

$zip = Require-LocalFileSystemPath $DownloadedEncryptedZip 'encrypted ZIP' $true
$vault = Require-LocalFileSystemPath $OperatorVaultDirectory 'vault' $false
$receipts = Require-LocalFileSystemPath $IndependentReceiptDirectory 'receipt directory' $false
if ($vault -eq $receipts) { throw 'GA03_RECEIPT_DIRECTORY_MUST_BE_DISTINCT' }
if ($vault.StartsWith($receipts+'\',[StringComparison]::OrdinalIgnoreCase) -or
    $receipts.StartsWith($vault+'\',[StringComparison]::OrdinalIgnoreCase)) {
  throw 'GA03_VAULT_AND_RECEIPT_TREE_MUST_BE_SEPARATE'
}
if ($zip.StartsWith($vault+'\',[StringComparison]::OrdinalIgnoreCase)) {
  throw 'GA03_INPUT_NOT_PERMITTED_INSIDE_TARGET_VAULT'
}

# Operator must independently review local NTFS ACLs, account scope and absence
# of cloud synchronization. These host policies are NOT attested by this script.
$hashBefore = (Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash.ToLowerInvariant()
if ($hashBefore -ne $ExpectedSha256) {
  throw "GA03_ZIP_DIGEST_MISMATCH_HELD: received $hashBefore, expected $ExpectedSha256"
}

$destination = Join-Path $vault $DestinationName
$receiptName = 'Wendbine_Encrypted_Custody_Receipt_20261103.json'
$receiptPath = Join-Path $receipts $receiptName
if ((Test-Path -LiteralPath $destination) -or (Test-Path -LiteralPath $receiptPath)) {
  throw 'GA03_NO_OVERWRITE_OF_PRIOR_CUSTODY_EVIDENCE'
}

# A manual local copy is *not* an independently attested preservation service.
# No automatic overwrite or removal of the downloaded original.
Copy-Item -LiteralPath $zip -Destination $destination -ErrorAction Stop
$hashAfter = (Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash.ToLowerInvariant()
if ($hashAfter -ne $ExpectedSha256) {
  throw "GA03_LOCAL_COPY_DIGEST_MISMATCH_HELD: $hashAfter"
}
$receipt = [ordered]@{
  schema = 'td613.ga03.encrypted-artifact-local-preservation/v1'
  source = 'OPERATOR_SUPPLIED_DOWNLOADED_GITHUB_ARTIFACT_ZIP'
  github_run_id = $RunId
  github_artifact_id = $ArtifactId
  github_reported_expiry_utc = $ExpiryUtc
  expected_artifact_zip_sha256 = $ExpectedSha256
  local_copied_zip_sha256 = $hashAfter
  local_copy_created_utc = ([DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ss.fffffffZ'))
  encrypted_zip_only = $true
  ciphertext_envelope_validated = $false
  private_key_examined = $false
  decrypted_originals_read = 0
  external_trust_root = 'UNPROVISIONED'
  source_rights = 'UNREVIEWED'
  actual_restoration = 'NOT_PERFORMED'
  human_closure = 'RESERVED'
}
$json = $receipt | ConvertTo-Json -Depth 5
$writer = $null
try {
  $stream = [IO.File]::Open($receiptPath,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::None)
  $writer = New-Object IO.StreamWriter($stream,(New-Object Text.UTF8Encoding($false)))
  $writer.Write($json + [Environment]::NewLine)
  $writer.Flush()
  $stream.Flush($true)
} finally {
  if ($null -ne $writer) { $writer.Dispose() }
  elseif ($null -ne $stream) { $stream.Dispose() }
}
Write-Output 'GA03_ENCRYPTED_ZIP_LOCAL_COPY_SHA256_MATCHED_WITH_LIMITATIONS'
Write-Output "ZIP_SHA256=$hashAfter"
Write-Output "RECEIPT_FILE=$receiptPath"
Write-Output 'DO NOT UPLOAD ZIP, PRIVATE KEY OR DECRYPTED BODIES TO CHATGPT/GITHUB.'
