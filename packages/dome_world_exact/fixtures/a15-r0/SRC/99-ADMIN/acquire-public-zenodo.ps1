[CmdletBinding()]
param(
    [string]$VaultRoot = (Split-Path -Parent $PSScriptRoot),
    [ValidateRange(1, 500)]
    [int]$Limit = 20,
    [int]$DelayMilliseconds = 800,
    [switch]$Execute
)

$ErrorActionPreference = 'Stop'
$manifestPath = Join-Path $VaultRoot '01-MANIFESTS\candidate-corpus.jsonl'
$originalRoot = Join-Path $VaultRoot '02-ORIGINALS\sha256'
$stagingRoot = Join-Path $VaultRoot '00-INBOX\staging'
$receiptRoot = Join-Path $VaultRoot '04-RECEIPTS'
$ledgerPath = Join-Path $VaultRoot '01-MANIFESTS\integrity-ledger.jsonl'
New-Item -ItemType Directory -Force -Path $originalRoot, $stagingRoot, $receiptRoot | Out-Null

if (-not (Test-Path -LiteralPath $manifestPath)) {
    throw "Missing public metadata manifest: $manifestPath"
}

# Capture identity is platform record + source attachment name. Existing pilot
# ledger rows use the same two fields, so this also avoids duplicating them.
$acquired = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
if (Test-Path -LiteralPath $ledgerPath) {
    Get-Content -LiteralPath $ledgerPath |
        Where-Object { -not [string]::IsNullOrWhiteSpace($_) } |
        ForEach-Object {
            $entry = $_ | ConvertFrom-Json
            $null = $acquired.Add("$($entry.source_record_id)`n$($entry.source_name)")
        }
}

$items = Get-Content -LiteralPath $manifestPath | ForEach-Object { ConvertFrom-Json $_ }
$eligible = @(
    $items |
        Where-Object {
            $record = $_
            $remaining = @($record.files | Where-Object { -not $acquired.Contains("$($record.source_record_id)`n$($_.source_name)") })
            $record.access_right -eq 'open' -and $record.license -eq 'cc-by-4.0' -and $remaining.Count -gt 0
        } |
        Sort-Object publication_date, title |
        Select-Object -First $Limit
)

if (-not $Execute) {
    [ordered]@{
        mode = 'dry-run'
        network_requests = 0
        selected_records = $eligible.Count
        selected_record_ids = @($eligible | ForEach-Object { $_.source_record_id })
        instruction = 'Re-run with -Execute only after the Phase 2 human gate is opened.'
    } | ConvertTo-Json -Depth 6
    return
}

$downloaded = 0
$skipped = 0
$failures = [System.Collections.Generic.List[object]]::new()
$startedAt = (Get-Date).ToUniversalTime().ToString('o')

foreach ($item in $eligible) {
    $fileIndex = 0
    foreach ($file in $item.files) {
        $fileIndex += 1
        $manifestationKey = "$($item.source_record_id)`n$($file.source_name)"
        if ($acquired.Contains($manifestationKey)) {
            $skipped += 1
            continue
        }

        $stageName = ('zenodo-{0}-{1:d2}.partial' -f $item.source_record_id, $fileIndex)
        $partialPath = Join-Path $stagingRoot $stageName

        try {
            if (Test-Path -LiteralPath $partialPath) {
                throw "A prior partial is retained at $partialPath for inspection; it was not overwritten."
            }

            Invoke-WebRequest -Uri $file.download_url -OutFile $partialPath
            $partialMd5 = (Get-FileHash -LiteralPath $partialPath -Algorithm MD5).Hash.ToLowerInvariant()
            $expectedMd5 = ([string]$file.source_checksum -replace '^md5:', '').ToLowerInvariant()
            if ($partialMd5 -ne $expectedMd5) {
                throw "Integrity mismatch for $($file.source_name) (expected MD5 $expectedMd5; got $partialMd5). The partial is retained."
            }

            $sha256 = (Get-FileHash -LiteralPath $partialPath -Algorithm SHA256).Hash.ToLowerInvariant()
            $hashDirectory = Join-Path $originalRoot $sha256.Substring(0, 2)
            New-Item -ItemType Directory -Force -Path $hashDirectory | Out-Null
            $extension = [IO.Path]::GetExtension([string]$file.source_name).ToLowerInvariant()
            if ([string]::IsNullOrWhiteSpace($extension)) { $extension = '.bin' }
            $outPath = Join-Path $hashDirectory "$sha256$extension"

            if (Test-Path -LiteralPath $outPath) {
                $existingHash = (Get-FileHash -LiteralPath $outPath -Algorithm SHA256).Hash.ToLowerInvariant()
                if ($existingHash -ne $sha256) {
                    throw "Content-address collision at $outPath."
                }
                Remove-Item -LiteralPath $partialPath
            }
            else {
                Move-Item -LiteralPath $partialPath -Destination $outPath
            }

            $relativePath = [IO.Path]::GetRelativePath($VaultRoot, $outPath).Replace('\', '/')
            [ordered]@{
                capture_id = "sha256:$sha256"
                manifestation_id = "zenodo:$($item.source_record_id):file:$fileIndex"
                vault_id = $item.vault_id
                source_record_id = $item.source_record_id
                source_platform = 'Zenodo'
                canonical_url = $item.record_url
                download_url = $file.download_url
                title = $item.title
                author_attribution = @($item.creators)
                published_at = $item.publication_date
                retrieved_at = (Get-Date).ToUniversalTime().ToString('o')
                doi = $item.doi
                license = $item.license
                source_name = $file.source_name
                local_path = $relativePath
                bytes = (Get-Item -LiteralPath $outPath).Length
                media_type = $extension.TrimStart('.')
                source_md5 = $expectedMd5
                local_sha256 = $sha256
                acquisition_method = 'Zenodo public attachment URL via Invoke-WebRequest'
                archive_lineage = @($item.vault_id, "zenodo:$($item.source_record_id)")
                integrity_status = 'verified'
            } | ConvertTo-Json -Depth 8 -Compress | Add-Content -LiteralPath $ledgerPath -Encoding utf8

            $null = $acquired.Add($manifestationKey)
            $downloaded += 1
            Start-Sleep -Milliseconds $DelayMilliseconds
        }
        catch {
            $failures.Add([ordered]@{
                record_id = $item.source_record_id
                title = $item.title
                source_name = $file.source_name
                error = $_.Exception.Message
            })
        }
    }
}

$receiptName = 'phase-2-acquisition-{0}.json' -f (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssfffZ')
[ordered]@{
    phase = 'phase-2-public-original-acquisition'
    started_at_utc = $startedAt
    completed_at_utc = (Get-Date).ToUniversalTime().ToString('o')
    selection_rule = "Open CC-BY 4.0 Zenodo records not already represented in the integrity ledger; oldest first; limit $Limit."
    records_selected = $eligible.Count
    files_verified = $downloaded
    files_skipped_as_already_acquired = $skipped
    failures = @($failures)
} | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $receiptRoot $receiptName) -Encoding utf8

Write-Host "Verified $downloaded new original file(s) from $($eligible.Count) selected record(s); receipt: $receiptName"
