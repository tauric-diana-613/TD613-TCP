param([Parameter(Mandatory=$true)][string]$Configuration,
  [Parameter(Mandatory=$true)][string]$EvidenceFile)
# HUMAN ADMIN ONLY. Records a real operator decision; it cannot authenticate an
# independent review from a URL or manufacture technical witness evidence.
$ErrorActionPreference='Stop'
try{
  $p=[Security.Principal.WindowsPrincipal]::new([Security.Principal.WindowsIdentity]::GetCurrent())
  if(-not $p.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator) -or [Console]::IsInputRedirected){throw 'INTERACTIVE_HUMAN_ADMIN_REQUIRED'}
  $c=Get-Content -LiteralPath $Configuration -Raw|ConvertFrom-Json
  $e=Get-Content -LiteralPath $EvidenceFile -Raw|ConvertFrom-Json
  foreach($field in @('distinctAccountsTested','keyCanaryDeniedFromAllEngineeringRoutes','controllerAndChildKeyCanaryDenied',
    'protectedControllerCodeVerified','systemAuditRetentionAndNoClearVerified','authenticatedDistinctPeerTestPassed')){
    if($e.$field -ne $true){throw 'ACTUAL_INSTALLATION_EVIDENCE_INCOMPLETE'}
  }
  if(-not $e.independentReviewReference){throw 'REAL_INDEPENDENT_REVIEW_REQUIRED'}
  $digest=(Get-FileHash -LiteralPath $EvidenceFile -Algorithm SHA256).Hash.ToLower()
  $phrase='ACCEPT EXACT CUSTODIAN INSTALLATION '+$digest
  Write-Host 'Cross-check the actual evidence and independent review. This is no provider, archive, evaluator or Flight grant.'
  if((Read-Host $phrase) -cne $phrase){throw 'HUMAN_INSTALLATION_ACCEPTANCE_NOT_SUPPLIED'}
  $configurationHash=& $c.node -e 'const fs=require("node:fs"),c=require("node:crypto");function j(v){if(v===null||typeof v!=="object")return JSON.stringify(v);if(Array.isArray(v))return "["+v.map(j).join(",")+"]";return "{"+Object.keys(v).sort().map(k=>JSON.stringify(k)+":"+j(v[k])).join(",")+"}"};console.log(c.createHash("sha256").update(j(JSON.parse(fs.readFileSync(process.argv[1],"utf8")))).digest("hex"))' $Configuration
  if($LASTEXITCODE -ne 0){throw 'EXACT_CONFIGURATION_DIGEST_REQUIRED'}
  $record=@{status='HUMAN_ACCEPTED_AFTER_INDEPENDENT_REVIEW';configurationDigest=$configurationHash;sourceCommit=$c.sourceCommit;
    evidenceDigest=$digest;independentReviewReference=$e.independentReviewReference;executionAuthorized=$false}
  $bytes=[Text.Encoding]::UTF8.GetBytes(($record|ConvertTo-Json -Compress))
  $stream=[IO.File]::Open($c.installationAcceptance,'CreateNew','Write','None')
  try{$stream.Write($bytes,0,$bytes.Length);$stream.Flush($true)}finally{$stream.Dispose()}
  @{status='HUMAN_INSTALLATION_DECISION_RECORDED';evidenceDigest=$digest;productionKeyCreated=$false;flightAuthorized=$false}|ConvertTo-Json -Compress
}catch{Write-Output '{"status":"HOLD","code":"HUMAN_INSTALLATION_ACCEPTANCE_REQUIRED"}';exit 1}
