[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$vaultRoot = Split-Path -Parent $PSScriptRoot
$assayRelative = '04-RECEIPTS\assays\2026-08-24-phase15-authority-recompilation'
$assayDir = Join-Path $vaultRoot $assayRelative

function New-HashReceipt([string]$relativePath) {
    $fullPath = Join-Path $vaultRoot $relativePath
    if (-not (Test-Path -LiteralPath $fullPath -PathType Leaf)) {
        throw "Cannot seal missing file: $relativePath"
    }
    $item = Get-Item -LiteralPath $fullPath
    [ordered]@{
        path = $relativePath.Replace('\', '/')
        sha256 = (Get-FileHash -LiteralPath $fullPath -Algorithm SHA256).Hash.ToLowerInvariant()
        bytes = $item.Length
    }
}

$inputPaths = @(
    '01-MANIFESTS\candidate-corpus.jsonl',
    '01-MANIFESTS\platforms\academia.jsonl',
    '01-MANIFESTS\platforms\substack.jsonl',
    '01-MANIFESTS\platforms\medium.jsonl',
    '01-MANIFESTS\crosswalk\doi-links.jsonl',
    '01-MANIFESTS\integrity-ledger.jsonl',
    '01-MANIFESTS\zenodo-pages\zenodo-page-012.json',
    '01-MANIFESTS\zenodo-pages\zenodo-page-018.json',
    '02-ORIGINALS\18096652--01--Social Infrastructure Theory_ A Structural Framework for Understanding Social Outcomes .docx',
    '02-ORIGINALS\18097205--01--Slow Harm Theory_ The Architecture of Cumulative Injury.docx',
    '02-ORIGINALS\18097491--01--Copy of Infrastructural Exposure Theory_ How Systems Generate Harm Through Designed Contact .pdf',
    '02-ORIGINALS\18097568--01--Systemic Erosion Theory_ How Systems Deplete Capacity, Stability, and Resilience Over Time  2.pdf',
    '02-ORIGINALS\18098106--01--The STAR Framework_ Integrating Social Infrastructure Theory, Exposure, Slow Harm, and Systemic Erosion  .pdf',
    '04-RECEIPTS\assays\2026-08-23-phase15-local-architecture\summary.json',
    '04-RECEIPTS\assays\2026-08-23-phase15-local-architecture\retitle-assay.jsonl',
    '04-RECEIPTS\assays\2026-08-23-phase15-local-architecture\witnessed-edge-candidates.jsonl',
    '04-RECEIPTS\assays\2026-08-23-phase15-local-architecture\output-hashes.jsonl'
)

$inputReceipts = $inputPaths | ForEach-Object { New-HashReceipt $_ }
$inputReceipts | ForEach-Object { $_ | ConvertTo-Json -Compress } | Set-Content -LiteralPath (Join-Path $assayDir 'input-hashes.jsonl') -Encoding utf8

$explicitOutputs = @(
    'README.md',
    'CONNECTOR_ENTRY.md',
    '01-MANIFESTS\SCHEMA.md',
    '01-MANIFESTS\registry-index.json',
    '01-MANIFESTS\entity-index.jsonl',
    '01-MANIFESTS\schemas\authority-assertion.schema.json',
    '01-MANIFESTS\schemas\relation-assertion-v2.schema.json',
    '01-MANIFESTS\schemas\claim-status-event.schema.json',
    '01-MANIFESTS\schemas\canon-map-snapshot.schema.json',
    '01-MANIFESTS\schemas\epistemic-object-state.schema.json',
    '01-MANIFESTS\schemas\surface-withdrawal-result.schema.json',
    '01-MANIFESTS\schemas\transformation-assertion.schema.json',
    '01-MANIFESTS\schemas\architecture-hypothesis-evidence.schema.json',
    '01-MANIFESTS\schemas\self-model-comparison.schema.json',
    '01-MANIFESTS\schemas\lifecycle-operator.schema.json',
    '01-MANIFESTS\schemas\graph-snapshot.schema.json',
    '01-MANIFESTS\schemas\graph-assay-observation.schema.json',
    '01-MANIFESTS\schemas\entity-index.schema.json',
    '01-MANIFESTS\schemas\coverage-entry.schema.json',
    '01-MANIFESTS\schemas\architecture-hypothesis-definition.schema.json',
    '01-MANIFESTS\schemas\witnessed-evidence.schema.json',
    '01-MANIFESTS\schemas\representation-family.schema.json',
    '01-MANIFESTS\schemas\ordinal-series-observation.schema.json',
    '01-MANIFESTS\schemas\structural-anatomy.schema.json',
    '01-MANIFESTS\schemas\evidence-taxonomy-observation.schema.json',
    '01-MANIFESTS\schemas\legacy-membership-candidate.schema.json',
    '01-MANIFESTS\schemas\compiler-input-candidate.schema.json',
    '05-OPERATIONS\README.md',
    '05-OPERATIONS\authority\README.md',
    '05-OPERATIONS\authority\authority-assertions.jsonl',
    '05-OPERATIONS\authority\legacy-membership-candidates.jsonl',
    '05-OPERATIONS\claims\README.md',
    '05-OPERATIONS\claims\claim-status-events.jsonl',
    '05-OPERATIONS\claims\evidence-taxonomy-observations.jsonl',
    '05-OPERATIONS\maps\README.md',
    '05-OPERATIONS\maps\canon-map-snapshots.jsonl',
    '05-OPERATIONS\operators\README.md',
    '05-OPERATIONS\operators\lifecycle-operators.jsonl',
    '05-OPERATIONS\state\README.md',
    '05-OPERATIONS\state\epistemic-object-states.jsonl',
    '05-OPERATIONS\relations\RELATION_VOCABULARY.md',
    '05-OPERATIONS\relations\compiler-input-candidates.jsonl',
    '05-OPERATIONS\relations\recompilation-edges.jsonl',
    '05-OPERATIONS\relations\typed-edges.jsonl',
    '05-OPERATIONS\relations\representation-lift-candidates.jsonl',
    '05-OPERATIONS\relations\representation-families.jsonl',
    '05-OPERATIONS\relations\ordinal-series-observations.jsonl',
    '05-OPERATIONS\relations\structural-anatomy-candidates.jsonl',
    '05-OPERATIONS\hypotheses\2026-08-24-amari-recompilation-topology-seeds.jsonl',
    '06-INSTRUMENTS\README.md',
    '06-INSTRUMENTS\VERSIONED_EPISTEMIC_SYSTEM.md',
    '06-INSTRUMENTS\REPRESENTATION_AND_ROUTE_ASSAY.md',
    '06-INSTRUMENTS\SELF_PERCEPTION_AND_GOVERNANCE_ASSAY.md',
    '06-INSTRUMENTS\SURFACE_WITHDRAWAL_ASSAY.md',
    '99-ADMIN\ARCHIVAL_STRATEGY.md',
    '99-ADMIN\build-entity-index.py',
    '99-ADMIN\build-phase15-curated-outputs.py',
    '99-ADMIN\json_schema_subset.py',
    '99-ADMIN\phase15_additional_compiler_findings.json',
    '99-ADMIN\phase15_additional_family_findings.json',
    '99-ADMIN\phase15-authority-recompilation-assay.py',
    '99-ADMIN\validate-phase15-epistemic-contracts.py',
    '99-ADMIN\validate-vault.ps1',
    '99-ADMIN\seal-phase15-authority-recompilation.ps1'
)

$assayOutputs = Get-ChildItem -LiteralPath $assayDir -Recurse -File | Where-Object { $_.Name -ne 'output-hashes.jsonl' } | ForEach-Object {
    [IO.Path]::GetRelativePath($vaultRoot, $_.FullName)
}

$outputPaths = @($explicitOutputs + $assayOutputs | Sort-Object -Unique)
$outputReceipts = $outputPaths | ForEach-Object { New-HashReceipt $_ }
$outputReceipts | ForEach-Object { $_ | ConvertTo-Json -Compress } | Set-Content -LiteralPath (Join-Path $assayDir 'output-hashes.jsonl') -Encoding utf8

Write-Output "Sealed $($inputReceipts.Count) inputs and $($outputReceipts.Count) outputs for $assayRelative."
