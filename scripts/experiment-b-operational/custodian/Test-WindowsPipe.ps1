param([switch]$Server,[string]$PipeName,[string]$CallerSid,[string]$Case='Echo')
$ErrorActionPreference='Stop'
$source=Join-Path $PSScriptRoot 'WindowsPipe.cs'
if($Server){
  $listener=$null
  try{
    Add-Type -Path $source
    $actor=[TD613.Custody.WindowsPipe]::CurrentSid()
    $listener=[TD613.Custody.WindowsPipe+Server]::new($PipeName,$actor,$CallerSid,'S-1-5-7',1000)
    [Console]::Out.WriteLine('READY');[Console]::Out.Flush()
    $request=$listener.Receive()
    if(($request|ConvertFrom-Json).synthetic -ne 'NO_AUTHORITY'){throw 'WRONG_SYNTHETIC_FRAME'}
    $listener.Reply('{"status":"OK","result":{"synthetic":true}}')
  }catch{[Console]::Error.WriteLine(('SERVER_PHASE='+[TD613.Custody.WindowsPipe]::Phase+';TYPE='+$_.Exception.GetType().Name+';INNER='+$_.Exception.InnerException.GetType().Name));exit 1}finally{if($listener){$listener.Dispose()}}
  exit 0
}
$tempRoot=[IO.Path]::GetTempPath().TrimEnd('\')
$dir=Join-Path $tempRoot ('td613-pipe-synthetic-'+[Guid]::NewGuid().ToString('N'))
$child=$null
$phase='Compile'
try{
  Add-Type -Path $source
  if([TD613.Custody.WindowsPipe]::IsAdministrator()){
    @{status='PENDING_REAL_INSTALLATION';reason='NONADMIN_TOKEN_REQUIRED_FOR_POSITIVE_TRANSPORT';compile='PASS'}|ConvertTo-Json -Compress
    exit 0
  }
  New-Item -ItemType Directory -Path $dir|Out-Null
  $exe=Join-Path $dir 'SyntheticPipeClient.exe'
  $compiler=Join-Path $env:WINDIR 'Microsoft.NET/Framework64/v4.0.30319/csc.exe'
  $build=@(& $compiler '/nologo' '/target:exe' '/define:CUSTODY_SYSTEM_AUDIT' ('/out:'+$exe) $source 2>&1)
  if($LASTEXITCODE -ne 0){throw 'SYNTHETIC_CLIENT_COMPILE_FAILED'}
  $actor=[TD613.Custody.WindowsPipe]::CurrentSid();$results=@()
  foreach($kind in @('Echo','WrongServerOwner','WrongCaller')){
    $phase=$kind+'-Listener'
    $name='TD613-Custody-'+[Guid]::NewGuid().ToString('N')
    $start=[Diagnostics.ProcessStartInfo]::new();$start.FileName=(Get-Process -Id $PID).Path
    $start.UseShellExecute=$false;$start.CreateNoWindow=$true;$start.RedirectStandardOutput=$true;$start.RedirectStandardError=$true
    foreach($arg in @('-NoLogo','-NoProfile','-File',$PSCommandPath,'-Server','-PipeName',$name,'-CallerSid',$(if($kind -eq 'WrongCaller'){'S-1-5-18'}else{$actor}))){$start.ArgumentList.Add($arg)}
    $child=[Diagnostics.Process]::Start($start)
    $ready=$child.StandardOutput.ReadLineAsync();if(-not $ready.Wait(15000) -or $ready.Result -ne 'READY'){throw 'SYNTHETIC_LISTENER_NOT_READY'}
    $phase=$kind+'-Client'
    $expectedNameDigest=[Convert]::ToHexString([Security.Cryptography.SHA256]::HashData([Text.Encoding]::UTF8.GetBytes($name)))
    $owner=if($kind -eq 'WrongServerOwner'){'S-1-5-18'}else{$actor}
    $response=@('{"synthetic":"NO_AUTHORITY"}' | & $exe $name $owner $actor '1000' 2>$null)
    $exit=$LASTEXITCODE
    if($kind -eq 'Echo'){if($exit -ne 0 -or ($response -join '') -notmatch '"status":"OK"'){throw 'AUTHENTICATED_ECHO_FAILED'}}
    elseif($exit -eq 0){throw 'WRONG_PEER_NOT_REFUSED'}
    $results+=@{case=$kind;outcome='PASS'}
    if(-not $child.WaitForExit(1500)){$child.Kill();$child.WaitForExit()};$child.Dispose();$child=$null
  }
  @{status='PASS';evidenceClass='ACTUAL_SINGLE_IDENTITY_WINDOWS_TRANSPORT_ONLY';checks=$results;
    distinctAccountKeyIsolation='PENDING_REAL_INSTALLATION';keysCreated=$false;modelRequests=0;protectedArchiveOperations=0}|ConvertTo-Json -Depth 4 -Compress
  exit 0
}catch{
  $serverError=if($child -and $child.HasExited){$child.StandardError.ReadToEnd()}else{'SERVER_STILL_RUNNING'}
  @{status='FAIL';code='WINDOWS_SYNTHETIC_TRANSPORT_FAILED';phase=$phase;completed=$results;clientResponse=$response;serverDiagnostic=$serverError;expectedNameDigest=$expectedNameDigest}|ConvertTo-Json -Depth 4 -Compress;exit 1
}
finally{
  if($child){if(-not $child.HasExited){$child.Kill();$child.WaitForExit()};$child.Dispose()}
  if([IO.Path]::GetDirectoryName([IO.Path]::GetFullPath($dir)) -ne $tempRoot -or [IO.Path]::GetFileName($dir) -notlike 'td613-pipe-synthetic-*'){throw 'SYNTHETIC_CLEANUP_BOUNDARY'}
  if(Test-Path -LiteralPath $dir){Remove-Item -LiteralPath $dir -Recurse}
}
