param([Parameter(Mandatory=$true)][string]$InputFile)
# Human-only convenience entry. Account passwords never enter this worksheet.
$ErrorActionPreference='Stop'
try{
  if(-not [Environment]::UserInteractive -or [Console]::IsInputRedirected){throw 'HUMAN_SETUP_CONSOLE_REQUIRED'}
  $inputRecord=Get-Content -LiteralPath $InputFile -Raw|ConvertFrom-Json
  $fields=@('custodianAccount','controllerAccount','engineeringAccount','destination','reviewedCommit','pwshExecutable','nodeExecutable','auditLogMaximumKB')
  if(@($inputRecord.PSObject.Properties.Name|Where-Object{$_ -notin $fields}).Count){throw 'UNDECLARED_SETUP_FIELD'}
  foreach($field in @('custodianAccount','controllerAccount','engineeringAccount','destination','reviewedCommit')){if(-not $inputRecord.$field){throw 'HUMAN_SETUP_INPUT_INCOMPLETE'}}
  $custody=(Get-LocalUser -Name $inputRecord.custodianAccount).SID.Value
  $controller=(Get-LocalUser -Name $inputRecord.controllerAccount).SID.Value
  $engineering=(Get-LocalUser -Name $inputRecord.engineeringAccount).SID.Value
  $pwsh=if($inputRecord.pwshExecutable){$inputRecord.pwshExecutable}else{(Get-Process -Id $PID).Path}
  $node=if($inputRecord.nodeExecutable){$inputRecord.nodeExecutable}else{(Get-Command node).Source}
  $size=if($inputRecord.auditLogMaximumKB){$inputRecord.auditLogMaximumKB}else{65536}
  & (Join-Path $PSScriptRoot 'Install-CustodianLayout.ps1') -Destination $inputRecord.destination -CustodianSid $custody -ControllerSid $controller -EngineeringSid $engineering -ReviewedCommit $inputRecord.reviewedCommit -PwshExecutable $pwsh -NodeExecutable $node -AuditLogMaximumKB $size
}catch{Write-Output '{"status":"HOLD","code":"HUMAN_SETUP_INPUT_OR_PRIVILEGE_REQUIRED"}';exit 1}
