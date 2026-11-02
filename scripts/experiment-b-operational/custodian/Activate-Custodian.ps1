param([Parameter(Mandatory=$true)][string]$Configuration,
  [ValidateSet('Initialize','Approve','Revoke','Bind')][string]$Action,
  [string]$InputFile)
$ErrorActionPreference='Stop'
try{
  if(-not [Environment]::UserInteractive -or [Console]::IsInputRedirected){throw 'HUMAN_CONSOLE_REQUIRED'}
  $c=Get-Content -LiteralPath $Configuration -Raw|ConvertFrom-Json
  $sid=[Security.Principal.WindowsIdentity]::GetCurrent().User.Value
  $p=[Security.Principal.WindowsPrincipal]::new([Security.Principal.WindowsIdentity]::GetCurrent())
  $adminGroup=@([Security.Principal.WindowsIdentity]::GetCurrent().Groups|ForEach-Object{$_.Value}) -contains 'S-1-5-32-544'
  if($sid -ne $c.custodianSid -or $adminGroup -or $p.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)){throw 'STANDARD_CUSTODIAN_ACCOUNT_REQUIRED'}
  # Inspect ACL metadata before generating any key. No value in a JSON file
  # supplies the OS boundary; the legitimate installer sets these permissions.
  foreach($dir in @((Split-Path $c.keyFile),(Split-Path $c.database),(Split-Path $c.anchorLog))){
    $acl=Get-Acl -LiteralPath $dir
    if(-not $acl.AreAccessRulesProtected){throw 'PROTECTED_CUSTODIAN_ACL_REQUIRED'}
    foreach($rule in $acl.Access){
      $trustee=$rule.IdentityReference.Translate([Security.Principal.SecurityIdentifier]).Value
      if($rule.AccessControlType -eq 'Allow' -and $trustee -notin @($c.custodianSid,'S-1-5-18','S-1-5-32-544')){throw 'KEY_STORAGE_ACCESS_TOO_BROAD'}
    }
  }
  if($Action -eq 'Initialize'){
    $acceptanceAcl=Get-Acl -LiteralPath $c.installationAcceptance
    foreach($rule in $acceptanceAcl.Access){
      $trustee=$rule.IdentityReference.Translate([Security.Principal.SecurityIdentifier]).Value
      $writeMask=[Security.AccessControl.FileSystemRights]::Write -bor [Security.AccessControl.FileSystemRights]::Delete -bor [Security.AccessControl.FileSystemRights]::DeleteSubdirectoriesAndFiles -bor [Security.AccessControl.FileSystemRights]::ChangePermissions -bor [Security.AccessControl.FileSystemRights]::TakeOwnership
      if($rule.AccessControlType -eq 'Allow' -and ($rule.FileSystemRights -band $writeMask) -and $trustee -notin @('S-1-5-18','S-1-5-32-544')){throw 'ADMIN_CONTROLLED_ACCEPTANCE_REQUIRED'}
    }
    # Compute the exact same canonical digest using reviewed code; this is
    # public configuration identity, never a signature or secret.
    $hash=& $c.node $c.configurationDigestHelper $Configuration
    if($LASTEXITCODE -ne 0){throw 'CONFIGURATION_DIGEST_REQUIRED'}
    $phrase='INITIALIZE FRESH EXPERIMENT B CUSTODY '+$hash
    Write-Host 'Creates NEW purpose-specific authority. It grants no Flight, archive, evaluator or disclosure permission.'
    if((Read-Host $phrase) -cne $phrase){throw 'HUMAN_GESTURE_NOT_SUPPLIED'}
    & $c.node $c.humanActions Initialize $Configuration '-' $hash
  }else{
    if(-not $InputFile){throw 'EXACT_HUMAN_INPUT_REQUIRED'}
    $hash=(Get-FileHash -LiteralPath $InputFile -Algorithm SHA256).Hash.ToLower()
    $phrase=$Action.ToUpper()+' FINITE CUSTODY INPUT '+$hash
    Write-Host 'Review the complete private input file before entering its exact action phrase.'
    if((Read-Host $phrase) -cne $phrase){throw 'HUMAN_GESTURE_NOT_SUPPLIED'}
    & $c.node $c.humanActions $Action $Configuration $InputFile $hash
  }
  if($LASTEXITCODE -ne 0){throw 'HUMAN_ACTION_HELD'}
}catch{Write-Output '{"status":"HOLD","code":"HUMAN_ONLY_CUSTODY_ACTIVATION_REQUIRED"}';exit 1}
