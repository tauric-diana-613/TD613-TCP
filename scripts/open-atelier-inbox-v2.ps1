<#
  𝌋 TD613 · Open the operator's LOCAL file-drop folder.
  Navigation only. Does not synchronize, upload, index, copy or grant authority.
  Usage: pwsh -File scripts/open-atelier-inbox-v2.ps1 -Estate EMSTD613
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)]
  [ValidateSet('SRC','WENDBINE','EMSTD613')]
  [string]$Estate,
  [switch]$PathOnly
)
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$inbox = Join-Path $repo ('packages/dome_world_exact/fixtures/a15-r0/{0}/07-OPERATOR-INBOX' -f $Estate)
$folder = Get-Item -LiteralPath $inbox -ErrorAction Stop
if (-not $folder.PSIsContainer) { throw "ATELIER_INBOX_DIRECTORY_MISSING" }
if (-not (Test-Path -LiteralPath (Join-Path $inbox '.gitignore') -PathType Leaf)) {
  throw "ATELIER_INBOX_GITIGNORE_REQUIRED"
}
Write-Output $folder.FullName
if (-not $PathOnly) {
  if ($IsWindows -or $PSVersionTable.PSEdition -eq 'Desktop') {
    Start-Process -FilePath 'explorer.exe' -ArgumentList @($folder.FullName)
  } else {
    Write-Warning 'Folder path printed; open it in the native file browser on this system.'
  }
}
