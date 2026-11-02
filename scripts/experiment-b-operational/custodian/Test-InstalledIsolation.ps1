param([Parameter(Mandatory=$true)][string]$CanaryFile,
  [string[]]$ProtectedCodeFiles=@(),[switch]$CheckDocker,[string]$PinnedImage)
# Run AFTER human layout installation but BEFORE real key generation, separately
# as engineering and controller. This reads a synthetic canary, never a key.
$ErrorActionPreference='Stop'
$results=@()
try{
  $id=[Security.Principal.WindowsIdentity]::GetCurrent()
  $admin=@($id.Groups|ForEach-Object{$_.Value}) -contains 'S-1-5-32-544'
  if($admin){throw 'STANDARD_NONADMIN_TEST_ACCOUNT_REQUIRED'}
  $readable=$false
  try{$probe=[IO.File]::Open($CanaryFile,'Open','Read','ReadWrite');$probe.Dispose();$readable=$true}catch [UnauthorizedAccessException]{}catch{throw 'CANARY_PROBE_INCONCLUSIVE'}
  $results+=@{property='custodian_canary_read_denied';outcome=$(if($readable){'FAIL'}else{'PASS'})}
  foreach($file in $ProtectedCodeFiles){
    $writable=$false
    try{$probe=[IO.File]::Open($file,'Open','Write','ReadWrite');$probe.Dispose();$writable=$true}catch [UnauthorizedAccessException]{}catch{throw 'CODE_WRITE_PROBE_INCONCLUSIVE'}
    $results+=@{property='reviewed_code_write_denied';outcome=$(if($writable){'FAIL'}else{'PASS'})}
  }
  if($CheckDocker){
    if($PinnedImage -notmatch '^sha256:[a-f0-9]{64}$'){throw 'EXACT_REVIEWED_TEST_IMAGE_REQUIRED'}
    $script="const fs=require('fs');try{if(!fs.statSync('/probe').isFile())throw Error('INCONCLUSIVE');fs.readFileSync('/probe');console.log('CANARY_READABLE');process.exitCode=3}catch(e){if(['EACCES','EPERM'].includes(e.code)){console.log('CANARY_DENIED')}else{console.log('PROBE_INCONCLUSIVE');process.exitCode=4}}"
    # Test the engineering account's strongest ordinary Docker capability, not
    # merely the less-privileged production child's user. Only a canary is read.
    $dockerOutput=@(& docker run --rm --network none --read-only --cap-drop ALL --security-opt no-new-privileges=true --user 0:0 --mount ("type=bind,src="+$CanaryFile+",dst=/probe,readonly") --entrypoint node $PinnedImage -e $script 2>$null)
    $code=$LASTEXITCODE
    if(($dockerOutput -join '') -notmatch 'CANARY_(DENIED|READABLE)'){throw 'DOCKER_BOUNDARY_TEST_INCONCLUSIVE'}
    $results+=@{property='engineering_docker_cannot_read_custodian_canary';outcome=$(if($code -eq 0 -and ($dockerOutput -join '') -match 'CANARY_DENIED'){'PASS'}else{'FAIL'})}
  }
  $failed=@($results|Where-Object{$_.outcome -ne 'PASS'}).Count
  @{status=$(if($failed){'FAIL'}else{'BOUNDED_PROBES_PASS'});checks=$results;productionKeyAccessAttempted=$false;
    caveat='REQUIRES_ALL_ENGINEERING_EXECUTION_ROUTES_AND_DISTINCT_ACCOUNT_PEER_TEST'}|ConvertTo-Json -Depth 5 -Compress
  if($failed){exit 1}
}catch{@{status='PENDING_REAL_INSTALLATION';code='ISOLATION_PROBE_INCOMPLETE';checks=$results}|ConvertTo-Json -Depth 5 -Compress;exit 1}
