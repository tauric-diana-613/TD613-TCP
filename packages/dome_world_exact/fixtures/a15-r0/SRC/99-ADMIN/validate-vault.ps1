[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$vaultRoot = Split-Path -Parent $PSScriptRoot
$errors = [System.Collections.Generic.List[string]]::new()
$jsonCount = 0
$jsonlLineCount = 0

Get-ChildItem -LiteralPath $vaultRoot -Recurse -File -Filter '*.json' | ForEach-Object {
    try {
        $null = Get-Content -Raw -LiteralPath $_.FullName | ConvertFrom-Json -Depth 100
        $jsonCount++
    }
    catch {
        $errors.Add("Invalid JSON: $($_.FullName): $($_.Exception.Message)")
    }
}

Get-ChildItem -LiteralPath $vaultRoot -Recurse -File -Filter '*.jsonl' | ForEach-Object {
    $jsonlFile = $_
    $lineNumber = 0
    Get-Content -LiteralPath $jsonlFile.FullName | ForEach-Object {
        $lineNumber++
        if ([string]::IsNullOrWhiteSpace($_)) { return }
        try {
            $null = $_ | ConvertFrom-Json -Depth 100
            $jsonlLineCount++
        }
        catch {
            $errors.Add("Invalid JSONL: $($jsonlFile.FullName):${lineNumber}: $($_.Exception.Message)")
        }
    }
}

$integrityPath = Join-Path $vaultRoot '01-MANIFESTS\integrity-ledger.jsonl'
if (Test-Path -LiteralPath $integrityPath) {
    Get-Content -LiteralPath $integrityPath | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | ForEach-Object {
        $entry = $_ | ConvertFrom-Json
        $sourcePath = Join-Path $vaultRoot $entry.local_path
        if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) {
            $errors.Add("Missing original for $($entry.vault_id): $sourcePath")
            return
        }
        $file = Get-Item -LiteralPath $sourcePath
        if ($file.Length -ne [long]$entry.bytes) {
            $errors.Add("Byte-length mismatch for $($entry.vault_id): expected $($entry.bytes), found $($file.Length)")
        }
        $actualHash = (Get-FileHash -LiteralPath $sourcePath -Algorithm SHA256).Hash.ToLowerInvariant()
        if ($actualHash -ne ([string]$entry.local_sha256).ToLowerInvariant()) {
            $errors.Add("SHA-256 mismatch for $($entry.vault_id)")
        }
    }
}

$platformSpecs = @(
    @{ Path = '01-MANIFESTS\candidate-corpus.jsonl'; Key = 'source_record_id'; Label = 'Zenodo' },
    @{ Path = '01-MANIFESTS\platforms\academia.jsonl'; Key = 'platform_item_id'; Label = 'Academia' },
    @{ Path = '01-MANIFESTS\platforms\substack.jsonl'; Key = 'platform_item_id'; Label = 'Substack' },
    @{ Path = '01-MANIFESTS\platforms\medium.jsonl'; Key = 'platform_item_id'; Label = 'Medium' }
)
foreach ($spec in $platformSpecs) {
    $path = Join-Path $vaultRoot $spec.Path
    if (-not (Test-Path -LiteralPath $path)) {
        $errors.Add("Missing platform manifest: $path")
        continue
    }
    $rows = @(Get-Content -LiteralPath $path | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | ForEach-Object { $_ | ConvertFrom-Json })
    $ids = @($rows | ForEach-Object { [string]($_.($spec.Key)) })
    $duplicates = @($ids | Group-Object | Where-Object { $_.Count -gt 1 -and $_.Name })
    if ($duplicates.Count -gt 0) {
        $errors.Add("Duplicate $($spec.Label) IDs: $((@($duplicates.Name) -join ', '))")
    }
}

if ($errors.Count -gt 0) {
    $errors | ForEach-Object { Write-Error $_ }
    exit 1
}

Write-Output "Vault validation passed: $jsonCount JSON files; $jsonlLineCount JSONL records; integrity hashes verified."
