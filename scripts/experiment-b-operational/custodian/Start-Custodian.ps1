param([Parameter(Mandatory=$true)][string]$Configuration)
$ErrorActionPreference='Stop'
$server=$null;$worker=$null
try {
  $c=Get-Content -LiteralPath $Configuration -Raw|ConvertFrom-Json
  $sid=[Security.Principal.WindowsIdentity]::GetCurrent().User.Value
  $principal=[Security.Principal.WindowsPrincipal]::new([Security.Principal.WindowsIdentity]::GetCurrent())
  $adminGroup=@([Security.Principal.WindowsIdentity]::GetCurrent().Groups|ForEach-Object{$_.Value}) -contains 'S-1-5-32-544'
  if($sid -ne $c.custodianSid -or $adminGroup -or $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator) -or
    $c.custodianSid -eq $c.controllerSid -or $c.custodianSid -eq $c.engineeringSid -or $c.controllerSid -eq $c.engineeringSid){throw 'THREE_SEPARATE_STANDARD_IDENTITIES_REQUIRED'}
  foreach($target in @($c.keyFile,(Split-Path $c.keyFile),(Split-Path $c.database),(Split-Path $c.anchorLog))){
    if((Get-Item -LiteralPath $target).Attributes -band [IO.FileAttributes]::ReparsePoint){throw 'CUSTODIAN_STORE_REPARSE_REFUSED'}
    $acl=Get-Acl -LiteralPath $target
    foreach($rule in $acl.Access){
      $trustee=$rule.IdentityReference.Translate([Security.Principal.SecurityIdentifier]).Value
      if($rule.AccessControlType -eq 'Allow' -and $trustee -notin @($c.custodianSid,'S-1-5-18','S-1-5-32-544')){throw 'CUSTODIAN_SECRET_ACL_DRIFT'}
    }
  }
  $bundle=Get-Content -LiteralPath $c.bundleManifest -Raw|ConvertFrom-Json
  foreach($entry in $bundle.files){
    if((Get-FileHash -LiteralPath (Join-Path $c.codeRoot $entry.path) -Algorithm SHA256).Hash.ToLower() -ne $entry.sha256){throw 'CUSTODIAN_DEPENDENCY_DRIFT'}
  }
  if((Get-FileHash -LiteralPath $c.pwsh -Algorithm SHA256).Hash.ToLower() -ne $c.pwshSHA256){throw 'POWERSHELL_RUNTIME_DRIFT'}
  Add-Type -Path $c.pipeSource
  $start=[Diagnostics.ProcessStartInfo]::new();$start.FileName=$c.node;$start.CreateNoWindow=$true;$start.UseShellExecute=$false
  $start.RedirectStandardInput=$true;$start.RedirectStandardOutput=$true;$start.RedirectStandardError=$true
  $start.Environment.Clear();$start.Environment['SystemRoot']=$env:SystemRoot
  $start.ArgumentList.Add($c.worker);$start.ArgumentList.Add($Configuration)
  $worker=[Diagnostics.Process]::Start($start)
  $server=[TD613.Custody.WindowsPipe+Server]::new($c.pipeName,$c.custodianSid,$c.controllerSid,$c.engineeringSid,$c.timeoutMs)
  while(-not $worker.HasExited){
    try{
      $request=$server.Receive()
      if([Text.Encoding]::UTF8.GetByteCount($request) -gt 65536){throw 'CUSTODY_REQUEST_BOUND'}
      # Parse exactly one outer JSON request and produce one line. This prevents
      # newline-framed worker response confusion; model/source bytes never enter.
      $object=$request|ConvertFrom-Json -ErrorAction Stop
      if($object -isnot [pscustomobject]){throw 'SINGLE_CUSTODY_REQUEST_REQUIRED'}
      $canonicalRequest=$object|ConvertTo-Json -Depth 32 -Compress
      $worker.StandardInput.WriteLine($canonicalRequest);$worker.StandardInput.Flush()
      $answerTask=$worker.StandardOutput.ReadLineAsync()
      if(-not $answerTask.Wait($c.timeoutMs)){throw 'CUSTODIAN_TRANSACTION_ACK_UNCERTAIN'}
      $answer=$answerTask.Result
      if(-not $answer -or [Text.Encoding]::UTF8.GetByteCount($answer) -gt 65536){throw 'CUSTODIAN_RESPONSE_HOLD'}
      $server.Reply($answer)
    }catch{
      Write-Output '{"status":"HOLD","code":"CUSTODIAN_IPC_OR_TRANSACTION_UNCERTAIN"}'
      break
    }
  }
}catch{Write-Output '{"status":"HOLD","code":"CUSTODIAN_STARTUP_OR_IDENTITY_HOLD"}';exit 1}
finally {if($server){$server.Dispose()};if($worker -and -not $worker.HasExited){$worker.StandardInput.Close();if(-not $worker.WaitForExit(2000)){$worker.Kill()}}}
