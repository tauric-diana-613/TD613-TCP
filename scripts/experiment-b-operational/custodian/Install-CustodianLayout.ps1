param([Parameter(Mandatory=$true)][string]$Destination,
  [Parameter(Mandatory=$true)][string]$CustodianSid,
  [Parameter(Mandatory=$true)][string]$ControllerSid,
  [Parameter(Mandatory=$true)][string]$EngineeringSid,
  [Parameter(Mandatory=$true)][string]$ReviewedCommit,
  [Parameter(Mandatory=$true)][string]$PwshExecutable,
  [Parameter(Mandatory=$true)][string]$NodeExecutable,
  [ValidateRange(64,1048576)][int]$AuditLogMaximumKB=65536)
# HUMAN ADMINISTRATOR ONLY, after independent review. Never run by engineering.
$ErrorActionPreference='Stop'
try{
  $admin=[Security.Principal.WindowsPrincipal]::new([Security.Principal.WindowsIdentity]::GetCurrent())
  if(-not $admin.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)){throw 'HUMAN_ADMIN_INSTALLATION_REQUIRED'}
  $roles=@($CustodianSid,$ControllerSid,$EngineeringSid)
  if(@($roles|Sort-Object -Unique).Count -ne 3){throw 'THREE_DISTINCT_IDENTITIES_REQUIRED'}
  foreach($s in $roles){[void][Security.Principal.SecurityIdentifier]::new($s)}
  $adminMembers=@(Get-LocalGroupMember -SID 'S-1-5-32-544'|ForEach-Object{$_.SID.Value})
  if(@($roles|Where-Object{$_ -in $adminMembers}).Count){throw 'ALL_THREE_ROLES_MUST_BE_STANDARD_ACCOUNTS'}
  if(Test-Path -LiteralPath $Destination){throw 'FRESH_DESTINATION_REQUIRED'}
  $common=[Environment]::GetFolderPath('CommonApplicationData')
  if([IO.Path]::GetDirectoryName([IO.Path]::GetFullPath($Destination)).TrimEnd('\') -ne $common.TrimEnd('\')){throw 'DIRECT_MACHINE_DATA_CHILD_REQUIRED'}
  $repo=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../..'))
  $head=& git -C $repo rev-parse HEAD
  if($head -ne $ReviewedCommit -or $ReviewedCommit -notmatch '^[a-f0-9]{40}$' -or @(& git -C $repo status --porcelain).Count){throw 'EXACT_CLEAN_REVIEWED_CHECKOUT_REQUIRED'}
  if(-not (Test-Path -LiteralPath $PwshExecutable -PathType Leaf) -or -not (Test-Path -LiteralPath $NodeExecutable -PathType Leaf)){throw 'REVIEWED_SHARED_RUNTIME_REQUIRED'}
  if(($AuditLogMaximumKB%64) -ne 0 -or [Diagnostics.EventLog]::Exists('TD613Custody')){throw 'FRESH_BOUNDED_SYSTEM_AUDIT_LOG_REQUIRED'}
  function Protect-Directory([string]$Target,[bool]$ControllerRead,[bool]$CustodianWrite){
    $acl=[Security.AccessControl.DirectorySecurity]::new();$acl.SetAccessRuleProtection($true,$false)
    $acl.SetOwner([Security.Principal.SecurityIdentifier]::new('S-1-5-32-544'))
    foreach($s in @('S-1-5-18','S-1-5-32-544')){
      $acl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new([Security.Principal.SecurityIdentifier]::new($s),'FullControl','ContainerInherit,ObjectInherit','None','Allow'))
    }
    $rights=if($CustodianWrite){'FullControl'}else{'ReadAndExecute'}
    $acl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new([Security.Principal.SecurityIdentifier]::new($CustodianSid),$rights,'ContainerInherit,ObjectInherit','None','Allow'))
    if($ControllerRead){$acl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new([Security.Principal.SecurityIdentifier]::new($ControllerSid),'ReadAndExecute','ContainerInherit,ObjectInherit','None','Allow'))}
    Set-Acl -LiteralPath $Target -AclObject $acl
  }
  New-Item -ItemType Directory -Path $Destination|Out-Null;Protect-Directory $Destination $true $false
  $code=Join-Path $Destination 'code';$private=Join-Path $Destination 'private';$control=Join-Path $Destination 'controller';$state=Join-Path $Destination 'runtime-state'
  foreach($dir in @($code,$private,$control,$state)){New-Item -ItemType Directory -Path $dir|Out-Null}
  Protect-Directory $code $true $false;Protect-Directory $private $false $true;Protect-Directory $control $true $true
  $stateAcl=[Security.AccessControl.DirectorySecurity]::new();$stateAcl.SetAccessRuleProtection($true,$false)
  $stateAcl.SetOwner([Security.Principal.SecurityIdentifier]::new('S-1-5-32-544'))
  foreach($s in @('S-1-5-18','S-1-5-32-544',$ControllerSid)){
    $stateAcl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new([Security.Principal.SecurityIdentifier]::new($s),'FullControl','ContainerInherit,ObjectInherit','None','Allow'))
  }
  Set-Acl -LiteralPath $state -AclObject $stateAcl
  $closure=& $NodeExecutable (Join-Path $PSScriptRoot 'bundle-source.mjs') $repo
  if($LASTEXITCODE -ne 0){throw 'COMPLETE_REVIEWED_SOURCE_CLOSURE_REQUIRED'}
  $files=@($closure|ConvertFrom-Json)
  foreach($relative in $files){
    $source=Join-Path $repo $relative;$target=Join-Path $code $relative
    if((Get-Item -LiteralPath $source).Attributes -band [IO.FileAttributes]::ReparsePoint){throw 'SOURCE_REPARSE_POINT_REFUSED'}
    New-Item -ItemType Directory -Path (Split-Path $target) -Force|Out-Null;Copy-Item -LiteralPath $source -Destination $target
  }
  $nodeCopy=Join-Path $code 'node.exe';Copy-Item -LiteralPath $NodeExecutable -Destination $nodeCopy
  $cs=Join-Path $code 'scripts/experiment-b-operational/custodian/WindowsPipe.cs'
  $clientExe=Join-Path $code 'CustodyPipeClient.exe'
  $compiler=Join-Path $env:WINDIR 'Microsoft.NET/Framework64/v4.0.30319/csc.exe'
  $compilerOutput=@(& $compiler '/nologo' '/target:exe' '/define:CUSTODY_SYSTEM_AUDIT' ('/out:'+$clientExe) $cs 2>&1)
  if($LASTEXITCODE -ne 0){throw 'REVIEWED_PIPE_CLIENT_COMPILE_REQUIRED'}
  [Diagnostics.EventLog]::CreateEventSource('TD613Custody','TD613Custody')
  $systemAudit=[Diagnostics.EventLog]::new('TD613Custody')
  $systemAudit.ModifyOverflowPolicy([Diagnostics.OverflowAction]::DoNotOverwrite,0)
  $systemAudit.MaximumKilobytes=$AuditLogMaximumKB;$systemAudit.Dispose()
  # Event-log-specific rights: 1 read, 2 write, 4 clear. Custodian cannot clear;
  # controller can read; engineering/children receive no rights. SYSTEM/admin
  # remain legitimate machine recovery authorities, never model identities.
  $sddl='O:BAG:SYD:(A;;0xf0007;;;SY)(A;;0x7;;;BA)(A;;0x3;;;'+$CustodianSid+')(A;;0x1;;;'+$ControllerSid+')'
  New-ItemProperty -LiteralPath 'HKLM:\SYSTEM\CurrentControlSet\Services\EventLog\TD613Custody' -Name CustomSD -Value $sddl -PropertyType String -Force|Out-Null
  $prefix=Join-Path $code 'scripts/experiment-b-operational/custodian'
  $audienceHash=[Convert]::ToHexString([Security.Cryptography.SHA256]::HashData([Text.Encoding]::UTF8.GetBytes($ControllerSid))).ToLower()
  $config=@{custodianSid=$CustodianSid;controllerSid=$ControllerSid;engineeringSid=$EngineeringSid;audience=('td613-controller:'+$audienceHash);timeoutMs=10000;
    sourceCommit=$ReviewedCommit;installationAcceptance=(Join-Path $Destination 'installation-acceptance.json');
    issuer=('td613.experiment-b.custodian.v1.'+[Guid]::NewGuid().ToString('N'));pipeName=('TD613-Custody-'+[Guid]::NewGuid().ToString('N'));
    database=(Join-Path $private 'custody.sqlite');anchorLog=(Join-Path $private 'minimum-audit.jsonl');
    keyFile=(Join-Path $private 'issuer-root.bin');checkpointKeyFile=(Join-Path $control 'checkpoint-auth.bin');
    issuerRecord=(Join-Path $private 'issuer-record.json');pwsh=$PwshExecutable;pwshSHA256=(Get-FileHash -LiteralPath $PwshExecutable -Algorithm SHA256).Hash.ToLower();node=$nodeCopy;codeRoot=$code;controllerDirectory=$control;runtimeStateDirectory=$state;
    pipeSource=$cs;pipeClient=$clientExe;worker=(Join-Path $prefix 'worker.mjs');humanActions=(Join-Path $prefix 'human-actions.mjs');
    configurationDigestHelper=(Join-Path $prefix 'configuration-digest.mjs');bundleManifest=(Join-Path $Destination 'bundle-manifest.json')}
  $config|ConvertTo-Json -Depth 5|Set-Content -LiteralPath (Join-Path $Destination 'service.json') -Encoding utf8NoBOM
  # Canary contains no secret and exists BEFORE real-key activation.
  'SYNTHETIC_KEY_STORAGE_CANARY_NO_SECRET'|Set-Content -LiteralPath (Join-Path $private 'isolation-canary.txt') -Encoding utf8NoBOM
  $entries=@(Get-ChildItem -LiteralPath $code -File -Recurse|ForEach-Object{@{path=[IO.Path]::GetRelativePath($code,$_.FullName).Replace('\','/');sha256=(Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLower()}})
  @{sourceCommit=$ReviewedCommit;files=$entries}|ConvertTo-Json -Depth 6|Set-Content -LiteralPath $config.bundleManifest -Encoding utf8NoBOM
  # No key generation, account/password creation, task registration or service start.
  @{status='LAYOUT_PREPARED_NOT_ACTIVATED';sourceCommit=$ReviewedCommit;dependencyFiles=$entries.Count;
    actualCrossIdentityIsolation='PENDING_REAL_INSTALLATION';systemAnchorAccessAndRetention='PENDING_REAL_INSTALLATION';
    auditLogMaximumKB=$AuditLogMaximumKB;keysCreated=$false;grantsIssued=$false}|ConvertTo-Json -Compress
}catch{Write-Output '{"status":"HOLD","code":"HUMAN_CUSTODIAN_LAYOUT_INSTALLATION_REQUIRED"}';exit 1}
