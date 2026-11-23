#Requires -Version 5.1
<#
.SYNOPSIS
TD613 Marrowline R2 · Safe Windows PowerShell 5.1 Credential Ingestion & QuickEdit Guard
Commission: TD613-MARROWLINE-R2-POST-ACQ-RECOVERY-20261123
Predecessor: a48d2556ed946e01d4925dee93c463c73712d590 (PR #1783, pilot r2_r2u_036ef18ebc2e)

Repairs Windows PowerShell 5.1 Read-Host -AsSecureString paste truncation (single 0x16 Ctrl+V
control char or dropped paste) and prevents conhost QuickEdit clicks from freezing stderr writes.
Never echoes, logs, or accepts secrets via command-line parameters.
#>

Set-StrictMode -Version Latest

if (-not ('TD613.ConsoleModeHelper' -as [type])) {
  Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;

namespace TD613 {
  public static class ConsoleModeHelper {
    public const int STD_INPUT_HANDLE = -10;
    public const uint ENABLE_QUICK_EDIT_MODE = 0x0040;
    public const uint ENABLE_EXTENDED_FLAGS = 0x0080;

    [DllImport("kernel32.dll", SetLastError = true)]
    public static extern IntPtr GetStdHandle(int nStdHandle);

    [DllImport("kernel32.dll", SetLastError = true)]
    public static extern bool GetConsoleMode(IntPtr hConsoleHandle, out uint lpMode);

    [DllImport("kernel32.dll", SetLastError = true)]
    public static extern bool SetConsoleMode(IntPtr hConsoleHandle, uint dwMode);
  }
}
'@
}

function Test-R2CredentialCandidate {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $false)]
    [AllowEmptyString()]
    [AllowNull()]
    [string]$Value = '',

    [Parameter(Mandatory = $false)]
    [ValidateSet('GeminiApiKey', 'Passphrase')]
    [string]$Kind = 'GeminiApiKey',

    [Parameter(Mandatory = $false)]
    [int]$MinLength = -1
  )

  $resolvedMinLen = if ($MinLength -ge 0) {
    $MinLength
  } elseif ($Kind -eq 'GeminiApiKey') {
    16
  } else {
    1
  }

  $raw = if ($null -eq $Value) { '' } else { [string]$Value }
  $trimmed = $raw.Trim("`r", "`n")

  if ($trimmed.Length -eq 0) {
    return [PSCustomObject]@{
      Valid           = $false
      Kind            = $Kind
      Length          = 0
      FailureCode     = 'EMPTY_CREDENTIAL'
      SafeDiagnostic  = "NOW: $Kind input is empty. WHY: Zero characters remained after trimming outer line breaks. EXACT: Provide a non-empty $Kind (min length $resolvedMinLen)."
      NormalizedValue = $null
    }
  }

  $chars = $trimmed.ToCharArray()
  if ($chars.Length -eq 1 -and [int]$chars[0] -eq 22) {
    return [PSCustomObject]@{
      Valid           = $false
      Kind            = $Kind
      Length          = 1
      FailureCode     = 'RAW_CTRL_V_PASTE_INTERCEPTED'
      SafeDiagnostic  = "NOW: $Kind input received only 1 control byte (0x16 / ^V). WHY: Windows PowerShell 5.1 Read-Host captures Ctrl+V as a raw SYN character instead of pasted clipboard text. EXACT: Use this prompt's Ctrl+V/Shift+Insert handler, -ApiKeyFromClipboard, -ApiKeyFile, or Env:\GEMINI_API_KEY."
      NormalizedValue = $null
    }
  }

  $controlCount = 0
  $whitespaceCount = 0
  foreach ($c in $chars) {
    $code = [int]$c
    if (($code -ge 0 -and $code -le 31) -or $code -eq 127) {
      $controlCount += 1
    } elseif ($Kind -eq 'GeminiApiKey' -and [char]::IsWhiteSpace($c)) {
      $whitespaceCount += 1
    }
  }

  if ($controlCount -gt 0) {
    return [PSCustomObject]@{
      Valid           = $false
      Kind            = $Kind
      Length          = $trimmed.Length
      FailureCode     = 'CONTROL_CHAR_DETECTED'
      SafeDiagnostic  = "NOW: $Kind input contains $controlCount ASCII control character(s) (length=$($trimmed.Length)). WHY: Terminal paste or line ending injected non-printable control bytes. EXACT: Supply clean UTF-8 text without control characters."
      NormalizedValue = $null
    }
  }

  if ($Kind -eq 'GeminiApiKey' -and $whitespaceCount -gt 0) {
    return [PSCustomObject]@{
      Valid           = $false
      Kind            = $Kind
      Length          = $trimmed.Length
      FailureCode     = 'WHITESPACE_IN_API_KEY'
      SafeDiagnostic  = "NOW: $Kind input contains $whitespaceCount whitespace character(s) (length=$($trimmed.Length)). WHY: Trailing spaces or embedded breaks corrupt header authentication. EXACT: Copy only the raw key token with no spaces or newlines."
      NormalizedValue = $null
    }
  }

  if ($trimmed.Length -lt $resolvedMinLen) {
    return [PSCustomObject]@{
      Valid           = $false
      Kind            = $Kind
      Length          = $trimmed.Length
      FailureCode     = 'CREDENTIAL_TOO_SHORT'
      SafeDiagnostic  = "NOW: $Kind input is only $($trimmed.Length) character(s). WHY: Minimum expected length is $resolvedMinLen (prevents truncated 1-char paste from dispatching or burning a single-use nonce). EXACT: Provide full $Kind."
      NormalizedValue = $null
    }
  }

  return [PSCustomObject]@{
    Valid           = $true
    Kind            = $Kind
    Length          = $trimmed.Length
    FailureCode     = $null
    SafeDiagnostic  = "NOW: $Kind verified in memory (length=$($trimmed.Length), controlChars=0; never echoed or logged)."
    NormalizedValue = $trimmed
  }
}

function Read-R2SecretFromFile {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path,

    [Parameter(Mandatory = $false)]
    [ValidateSet('GeminiApiKey', 'Passphrase')]
    [string]$Kind = 'GeminiApiKey',

    [Parameter(Mandatory = $false)]
    [int]$MinLength = -1
  )

  if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
    throw "Credential file not found: $Path"
  }
  $rawText = [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
  if ($rawText.Length -gt 0 -and [int]$rawText[0] -eq 0xFEFF) {
    $rawText = $rawText.Substring(1)
  }
  $res = Test-R2CredentialCandidate -Value $rawText -Kind $Kind -MinLength $MinLength
  $rawText = $null
  if (-not $res.Valid) {
    throw "$($res.FailureCode): $($res.SafeDiagnostic)"
  }
  return $res
}

function Read-R2SecretFromClipboard {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $false)]
    [ValidateSet('GeminiApiKey', 'Passphrase')]
    [string]$Kind = 'GeminiApiKey',

    [Parameter(Mandatory = $false)]
    [int]$MinLength = -1,

    [Parameter(Mandatory = $false)]
    [switch]$ClearClipboard
  )

  $clipRaw = Get-Clipboard -Raw -ErrorAction Stop
  $res = Test-R2CredentialCandidate -Value $clipRaw -Kind $Kind -MinLength $MinLength
  $clipRaw = $null
  if ($ClearClipboard) {
    try { Set-Clipboard -Value '' -ErrorAction SilentlyContinue } catch { }
  }
  if (-not $res.Valid) {
    throw "$($res.FailureCode): $($res.SafeDiagnostic)"
  }
  return $res
}

function Read-R2MaskedSecretInteractive {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)]
    [string]$Prompt,

    [Parameter(Mandatory = $false)]
    [ValidateSet('GeminiApiKey', 'Passphrase')]
    [string]$Kind = 'GeminiApiKey',

    [Parameter(Mandatory = $false)]
    [int]$MinLength = -1,

    [Parameter(Mandatory = $false)]
    [int]$MaxAttempts = 3
  )

  if ([Console]::IsInputRedirected) {
    $hint = if ($Kind -eq 'GeminiApiKey') { '-ApiKeyFile, -ApiKeyFromClipboard, or Env:\GEMINI_API_KEY' } else { '-GrantFile/-PublicKeyFile' }
    throw "Interactive console input is redirected; supply $hint instead."
  }

  for ($attempt = 1; $attempt -le $MaxAttempts; $attempt += 1) {
    Write-Host "$Prompt [Ctrl+V / Shift+Insert / Right-Click supported; Esc clears]: " -NoNewline
    $sb = New-Object System.Text.StringBuilder
    try {
      while ($true) {
        $keyInfo = [Console]::ReadKey($true)
        $charCode = [int][char]$keyInfo.KeyChar
        $mods = [int]$keyInfo.Modifiers
        $ctrlMask = [int][System.ConsoleModifiers]::Control
        $shiftMask = [int][System.ConsoleModifiers]::Shift
        $isCtrlV = ($keyInfo.Key -eq [System.ConsoleKey]::V -and (($mods -band $ctrlMask) -ne 0)) -or ($charCode -eq 22)
        $isShiftIns = ($keyInfo.Key -eq [System.ConsoleKey]::Insert -and (($mods -band $shiftMask) -ne 0))

        if ($keyInfo.Key -eq [System.ConsoleKey]::Enter -or $charCode -eq 13) {
          Write-Host ''
          break
        }
        if ($keyInfo.Key -eq [System.ConsoleKey]::Escape) {
          while ($sb.Length -gt 0) {
            $sb.Length -= 1
            Write-Host "`b `b" -NoNewline
          }
          continue
        }
        if ($keyInfo.Key -eq [System.ConsoleKey]::Backspace -or $charCode -eq 8) {
          if ($sb.Length -gt 0) {
            $sb.Length -= 1
            Write-Host "`b `b" -NoNewline
          }
          continue
        }
        if ($isCtrlV -or $isShiftIns) {
          $clipText = ''
          try {
            $clipText = Get-Clipboard -Raw -ErrorAction Stop
          } catch {
            $clipText = ''
          }
          if ($null -ne $clipText) {
            $cleanClip = ([string]$clipText).Trim("`r", "`n")
            $appended = 0
            foreach ($ch in $cleanClip.ToCharArray()) {
              $cc = [int]$ch
              if (($cc -ge 32) -and ($cc -ne 127)) {
                [void]$sb.Append($ch)
                $appended += 1
              }
            }
            if ($appended -gt 0) {
              Write-Host ('*' * $appended) -NoNewline
            }
            $cleanClip = $null
          }
          $clipText = $null
          continue
        }
        # Ignore non-printable control characters so stray Ctrl sequences never corrupt the key buffer
        if ($charCode -lt 32 -or $charCode -eq 127) {
          continue
        }
        [void]$sb.Append($keyInfo.KeyChar)
        Write-Host '*' -NoNewline
      }

      $candidate = $sb.ToString()
      $check = Test-R2CredentialCandidate -Value $candidate -Kind $Kind -MinLength $MinLength
      $candidate = $null
      if ($check.Valid) {
        Write-Host $check.SafeDiagnostic -ForegroundColor DarkGray
        return $check
      }
      Write-Host $check.SafeDiagnostic -ForegroundColor Yellow
    } finally {
      $sb.Clear() | Out-Null
    }
  }

  throw "R2_CREDENTIAL_INPUT_FAILED: Failed to capture valid $Kind after $MaxAttempts attempt(s)."
}

function Disable-R2ConsoleQuickEdit {
  [CmdletBinding()]
  param()

  try {
    if ([Console]::IsInputRedirected) {
      return [PSCustomObject]@{ Changed = $false; Handle = [IntPtr]::Zero; OriginalMode = [uint32]0 }
    }
    $handle = [TD613.ConsoleModeHelper]::GetStdHandle([TD613.ConsoleModeHelper]::STD_INPUT_HANDLE)
    if ($handle -eq [IntPtr]::Zero -or $handle -eq [IntPtr]::new(-1)) {
      return [PSCustomObject]@{ Changed = $false; Handle = [IntPtr]::Zero; OriginalMode = [uint32]0 }
    }
    [uint32]$mode = 0
    if (-not [TD613.ConsoleModeHelper]::GetConsoleMode($handle, [ref]$mode)) {
      return [PSCustomObject]@{ Changed = $false; Handle = [IntPtr]::Zero; OriginalMode = [uint32]0 }
    }
    $newMode = ($mode -band (-bnot [TD613.ConsoleModeHelper]::ENABLE_QUICK_EDIT_MODE)) -bor [TD613.ConsoleModeHelper]::ENABLE_EXTENDED_FLAGS
    if (-not [TD613.ConsoleModeHelper]::SetConsoleMode($handle, $newMode)) {
      return [PSCustomObject]@{ Changed = $false; Handle = [IntPtr]::Zero; OriginalMode = [uint32]0 }
    }
    return [PSCustomObject]@{ Changed = $true; Handle = $handle; OriginalMode = $mode }
  } catch {
    return [PSCustomObject]@{ Changed = $false; Handle = [IntPtr]::Zero; OriginalMode = [uint32]0 }
  }
}

function Restore-R2ConsoleMode {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $false)]
    $State
  )

  if ($null -ne $State -and $State.Changed -eq $true -and $State.Handle -ne [IntPtr]::Zero) {
    try {
      [void][TD613.ConsoleModeHelper]::SetConsoleMode($State.Handle, [uint32]$State.OriginalMode)
    } catch {
      # Best-effort console mode restoration
    }
  }
}

Export-ModuleMember -Function `
  Test-R2CredentialCandidate, `
  Read-R2SecretFromFile, `
  Read-R2SecretFromClipboard, `
  Read-R2MaskedSecretInteractive, `
  Disable-R2ConsoleQuickEdit, `
  Restore-R2ConsoleMode
