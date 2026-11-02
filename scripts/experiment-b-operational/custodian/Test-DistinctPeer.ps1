param([Parameter(Mandatory=$true)][ValidateSet('Listen','Controller','Engineering')][string]$Role,
  [string]$Configuration,[string]$PipeName,[string]$CustodianSid,
  [string]$ControllerSid,[string]$EngineeringSid)
# HUMAN PRE-KEY INSTALLATION TEST. Synthetic metadata only; no custody store.
# Start Listen in the custodian's separate logon session, then Controller in the
# controller session. Repeat Listen for the Engineering denial test.
$ErrorActionPreference='Stop';$listener=$null
try{
  Add-Type -Path (Join-Path $PSScriptRoot 'WindowsPipe.cs')
  if([TD613.Custody.WindowsPipe]::IsAdministrator()){throw 'STANDARD_ACCOUNT_REQUIRED'}
  if($Configuration){
    $c=Get-Content -LiteralPath $Configuration -Raw|ConvertFrom-Json
    $PipeName=$c.pipeName;$CustodianSid=$c.custodianSid;$ControllerSid=$c.controllerSid;$EngineeringSid=$c.engineeringSid
  }
  if(@(@($CustodianSid,$ControllerSid,$EngineeringSid)|Sort-Object -Unique).Count -ne 3){throw 'THREE_DISTINCT_IDENTITIES_REQUIRED'}
  $actual=[TD613.Custody.WindowsPipe]::CurrentSid()
  if($Role -eq 'Listen'){
    if($actual -ne $CustodianSid){throw 'CUSTODIAN_IDENTITY_REQUIRED'}
    $listener=[TD613.Custody.WindowsPipe+Server]::new($PipeName,$CustodianSid,$ControllerSid,$EngineeringSid,10000)
    Write-Host 'SYNTHETIC LISTENER READY. No key or authority loaded. Stop after the denial test.'
    $request=$listener.Receive()|ConvertFrom-Json
    if($request.synthetic -cne 'NO_AUTHORITY'){throw 'SYNTHETIC_FRAME_REQUIRED'}
    $listener.Reply('{"status":"SYNTHETIC_ONLY","authority":false}')
    '{"case":"DISTINCT_CUSTODIAN_LISTENER","status":"PASS","authority":false}'
  }elseif($Role -eq 'Controller'){
    if($actual -ne $ControllerSid){throw 'CONTROLLER_IDENTITY_REQUIRED'}
    $answer=[TD613.Custody.WindowsPipe]::Client($PipeName,$CustodianSid,$ControllerSid,10000,'{"synthetic":"NO_AUTHORITY"}')|ConvertFrom-Json
    if($answer.status -cne 'SYNTHETIC_ONLY' -or $answer.authority -ne $false){throw 'SYNTHETIC_PEER_REPLY_REQUIRED'}
    '{"case":"DISTINCT_AUTHENTICATED_CONTROLLER","status":"PASS","authority":false}'
  }else{
    if($actual -ne $EngineeringSid){throw 'ENGINEERING_IDENTITY_REQUIRED'}
    $probe=[IO.Pipes.NamedPipeClientStream]::new('.', $PipeName,[IO.Pipes.PipeDirection]::InOut,[IO.Pipes.PipeOptions]::Asynchronous,[Security.Principal.TokenImpersonationLevel]::Identification)
    try{
      try{$probe.Connect(3000);throw 'ENGINEERING_PIPE_ACCESS_NOT_DENIED'}
      catch [UnauthorizedAccessException]{'{"case":"ACTUAL_ENGINEERING_PIPE_ACL_DENIAL","status":"PASS","authority":false}'}
    }finally{$probe.Dispose()}
  }
}catch{Write-Output '{"status":"HOLD","code":"DISTINCT_PEER_TEST_FAILED_OR_INCONCLUSIVE"}';exit 1}
finally{if($listener){$listener.Dispose()}}
