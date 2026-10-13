[CmdletBinding()]
param(
    [string]$VaultRoot = (Split-Path -Parent $PSScriptRoot),
    [int]$DelayMilliseconds = 550,
    [ValidateRange(1, 1000)]
    [int]$StartPage = 1
)

$ErrorActionPreference = 'Stop'
$manifestRoot = Join-Path $VaultRoot '01-MANIFESTS'
$rawRoot = Join-Path $manifestRoot 'zenodo-pages'
$originalRoot = Join-Path $VaultRoot '02-ORIGINALS'
$receiptRoot = Join-Path $VaultRoot '04-RECEIPTS'
New-Item -ItemType Directory -Force -Path $manifestRoot, $rawRoot, $originalRoot, $receiptRoot | Out-Null

# Broad discovery preserves the author-linked set without pretending it is already a settled canon.
$query = 'creators.name:"Rupture, Signal"'
$encodedQuery = [uri]::EscapeDataString($query)
$page = $StartPage

while ($true) {
    $uri = "https://zenodo.org/api/records?q=$encodedQuery&size=25&page=$page&sort=publication_date"
    $response = Invoke-RestMethod -Uri $uri -Headers @{ Accept = 'application/json' }
    $snapshotPath = Join-Path $rawRoot ('zenodo-page-{0:d3}.json' -f $page)
    $response | ConvertTo-Json -Depth 32 | Set-Content -LiteralPath $snapshotPath -Encoding utf8
    if (-not $response.hits.hits -or $response.hits.hits.Count -eq 0) { break }
    if ($null -eq $response.links.next) { break }
    $page += 1
    Start-Sleep -Milliseconds $DelayMilliseconds
}

# Read all retained page snapshots so interrupted runs can resume without losing
# earlier acquisition work. Deduplicate by immutable Zenodo record identifier.
$records = @(
    Get-ChildItem -LiteralPath $rawRoot -Filter 'zenodo-page-*.json' |
        Sort-Object Name |
        ForEach-Object { (Get-Content -Raw -LiteralPath $_.FullName | ConvertFrom-Json).hits.hits } |
        Group-Object id |
        ForEach-Object { $_.Group[0] }
)

$retrievedAt = (Get-Date).ToUniversalTime().ToString('o')
$catalog = foreach ($record in $records) {
    [ordered]@{
        vault_id = "zenodo-$($record.id)"
        scope = 'candidate-corpus'
        source_platform = 'Zenodo'
        source_record_id = [string]$record.id
        concept_record_id = [string]$record.conceptrecid
        doi = $record.doi
        concept_doi = $record.conceptdoi
        doi_url = $record.doi_url
        record_url = $record.links.self_html
        title = $record.metadata.title
        creators = @($record.metadata.creators | ForEach-Object { $_.name })
        orcids = @($record.metadata.creators | ForEach-Object { $_.orcid } | Where-Object { $_ })
        publication_date = $record.metadata.publication_date
        version = $record.metadata.version
        resource_type = $record.metadata.resource_type.type
        resource_subtype = $record.metadata.resource_type.subtype
        language = $record.metadata.language
        access_right = $record.metadata.access_right
        license = $record.metadata.license.id
        keywords = @($record.metadata.keywords)
        description = $record.metadata.description
        source_updated = $record.updated
        retrieved_at_utc = $retrievedAt
        files = @($record.files | ForEach-Object {
            [ordered]@{
                source_name = $_.key
                bytes = $_.size
                source_checksum = $_.checksum
                download_url = $_.links.self
            }
        })
        archive_status = 'metadata-captured'
        canonical_status = 'unreconciled'
    } | ConvertTo-Json -Depth 12 -Compress
}

$catalogPath = Join-Path $manifestRoot 'candidate-corpus.jsonl'
$catalog | Set-Content -LiteralPath $catalogPath -Encoding utf8

[ordered]@{
    query = $query
    records_discovered = $records.Count
    retrieved_at_utc = $retrievedAt
    catalog_path = '01-MANIFESTS/candidate-corpus.jsonl'
    next_step = 'Review official cross-platform indices, then download records whose stated license permits local preservation.'
} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $receiptRoot 'zenodo-discovery-receipt.json') -Encoding utf8

Write-Host "Captured $($records.Count) public Zenodo candidate records."
