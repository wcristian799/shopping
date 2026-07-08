$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing
Add-Type @'
using System;
using System.Text;
using System.Runtime.InteropServices;

public class UiDoc {
  public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);
  [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);
  [DllImport("user32.dll")] public static extern int GetWindowTextLength(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool BringWindowToTop(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int X, int Y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, UIntPtr dwExtraInfo);
  [DllImport("user32.dll")] public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);
  [DllImport("user32.dll", SetLastError = true)] public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);

  [StructLayout(LayoutKind.Sequential)]
  public struct RECT {
    public int Left;
    public int Top;
    public int Right;
    public int Bottom;
  }

  public static readonly IntPtr HWND_TOPMOST = new IntPtr(-1);
  public static readonly IntPtr HWND_NOTOPMOST = new IntPtr(-2);
}
'@

$script:PrintDir = 'C:\Users\Wellington Cristian\Desktop\shopping\documentacao_sistema\prints'
New-Item -ItemType Directory -Force -Path $script:PrintDir | Out-Null

function Get-AppPid {
    $proc = Get-Process java | Where-Object { $_.MainWindowTitle -eq 'Sistema de Achados e Perdidos' } | Select-Object -First 1
    if (-not $proc) {
        throw 'Nao encontrei a janela principal do sistema.'
    }
    return $proc.Id
}

function Get-Window([string]$titleLike) {
    $targetPid = Get-AppPid
    $matches = New-Object System.Collections.Generic.List[object]
    $callback = [UiDoc+EnumWindowsProc]{
        param([IntPtr]$hWnd, [IntPtr]$lParam)
        if ([UiDoc]::IsWindowVisible($hWnd)) {
            [uint32]$ownerPid = 0
            [UiDoc]::GetWindowThreadProcessId($hWnd, [ref]$ownerPid) | Out-Null
            if ($ownerPid -eq $targetPid) {
                $len = [UiDoc]::GetWindowTextLength($hWnd)
                $sb = New-Object System.Text.StringBuilder($len + 1)
                [UiDoc]::GetWindowText($hWnd, $sb, $sb.Capacity) | Out-Null
                $title = $sb.ToString()
                if ($title -like "*$titleLike*") {
                    $rect = New-Object UiDoc+RECT
                    [UiDoc]::GetWindowRect($hWnd, [ref]$rect) | Out-Null
                    $area = ($rect.Right - $rect.Left) * ($rect.Bottom - $rect.Top)
                    $matches.Add([pscustomobject]@{
                        Handle = $hWnd
                        Title = $title
                        Area = $area
                    }) | Out-Null
                }
            }
        }
        return $true
    }
    [UiDoc]::EnumWindows($callback, [IntPtr]::Zero) | Out-Null
    if ($matches.Count -eq 0) {
        throw "Nao encontrei janela com titulo contendo '$titleLike'."
    }
    return ($matches | Sort-Object Area -Descending | Select-Object -First 1).Handle
}

function Focus-Window([IntPtr]$hwnd) {
    [UiDoc]::ShowWindow($hwnd, 9) | Out-Null
    [UiDoc]::SetWindowPos($hwnd, [UiDoc]::HWND_TOPMOST, 0, 0, 0, 0, 0x0001 -bor 0x0002 -bor 0x0040) | Out-Null
    Start-Sleep -Milliseconds 150
    [UiDoc]::BringWindowToTop($hwnd) | Out-Null
    [UiDoc]::SetForegroundWindow($hwnd) | Out-Null
    Start-Sleep -Milliseconds 400
}

function Release-Window([IntPtr]$hwnd) {
    [UiDoc]::SetWindowPos($hwnd, [UiDoc]::HWND_NOTOPMOST, 0, 0, 0, 0, 0x0001 -bor 0x0002 -bor 0x0040) | Out-Null
}

function Get-Rect([IntPtr]$hwnd) {
    $rect = New-Object UiDoc+RECT
    [UiDoc]::GetWindowRect($hwnd, [ref]$rect) | Out-Null
    return $rect
}

function Click-Window([IntPtr]$hwnd, [int]$x, [int]$y, [switch]$Double) {
    Focus-Window $hwnd
    $rect = Get-Rect $hwnd
    $absX = $rect.Left + $x
    $absY = $rect.Top + $y
    [UiDoc]::SetCursorPos($absX, $absY) | Out-Null
    Start-Sleep -Milliseconds 100
    foreach ($i in 1..($(if ($Double) { 2 } else { 1 }))) {
        [UiDoc]::mouse_event(0x0002, 0, 0, 0, [UIntPtr]::Zero)
        Start-Sleep -Milliseconds 60
        [UiDoc]::mouse_event(0x0004, 0, 0, 0, [UIntPtr]::Zero)
        Start-Sleep -Milliseconds 120
    }
    Start-Sleep -Milliseconds 700
    Release-Window $hwnd
}

function Close-Window([IntPtr]$hwnd) {
    Focus-Window $hwnd
    [UiDoc]::keybd_event(0x12, 0, 0, [UIntPtr]::Zero)
    Start-Sleep -Milliseconds 30
    [UiDoc]::keybd_event(0x73, 0, 0, [UIntPtr]::Zero)
    Start-Sleep -Milliseconds 30
    [UiDoc]::keybd_event(0x73, 0, 2, [UIntPtr]::Zero)
    Start-Sleep -Milliseconds 30
    [UiDoc]::keybd_event(0x12, 0, 2, [UIntPtr]::Zero)
    Start-Sleep -Milliseconds 600
}

function Capture-Window([IntPtr]$hwnd, [string]$fileName) {
    Focus-Window $hwnd
    $rect = Get-Rect $hwnd
    $width = $rect.Right - $rect.Left
    $height = $rect.Bottom - $rect.Top
    $path = Join-Path $script:PrintDir $fileName

    $bmp = New-Object System.Drawing.Bitmap $width, $height
    $graphics = [System.Drawing.Graphics]::FromImage($bmp)
    $graphics.CopyFromScreen($rect.Left, $rect.Top, 0, 0, [System.Drawing.Size]::new($width, $height))

    $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters 1
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 92L
    $bmp.Save($path, $jpegCodec, $encoderParams)

    $graphics.Dispose()
    $bmp.Dispose()
    Release-Window $hwnd
    return $path
}

function Wait-Window([string]$titleLike, [int]$timeoutSeconds = 8) {
    $deadline = (Get-Date).AddSeconds($timeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        try {
            return Get-Window $titleLike
        } catch {
            Start-Sleep -Milliseconds 250
        }
    }
    throw "Timeout aguardando a janela '$titleLike'."
}

function Capture-TopLevelScreens {
    $main = Wait-Window 'Sistema de Achados e Perdidos'
    Capture-Window $main '02-tela-principal-listagem.jpg' | Out-Null

    Click-Window $main 578 156
    $filters = Wait-Window 'Filtros'
    Capture-Window $filters '03-filtros-avancados.jpg' | Out-Null
    Close-Window $filters

    Click-Window $main 489 156
    $cadItem = Wait-Window 'Cadastro de Item'
    Capture-Window $cadItem '04-cadastro-item.jpg' | Out-Null
    Close-Window $cadItem

    Click-Window $main 180 228 -Double
    $details = Wait-Window 'Detalhes do Item'
    Capture-Window $details '05-detalhes-item.jpg' | Out-Null
    Close-Window $details

    Click-Window $main 701 70
    $deliveries = Wait-Window 'Entregas'
    Capture-Window $deliveries '06-entregas.jpg' | Out-Null
    Click-Window $deliveries 90 114
    $newDelivery = Wait-Window 'Nova Entrega'
    Capture-Window $newDelivery '07-nova-entrega.jpg' | Out-Null
    Close-Window $newDelivery
    Close-Window $deliveries

    $main = Wait-Window 'Sistema de Achados e Perdidos'
    Click-Window $main 806 70
    $routing = Wait-Window 'Encaminh'
    Capture-Window $routing '08-encaminhamentos.jpg' | Out-Null
    Click-Window $routing 118 114
    $newRouting = Wait-Window 'Encaminhar Itens'
    Capture-Window $newRouting '09-encaminhar-itens.jpg' | Out-Null
    Close-Window $newRouting
    Close-Window $routing

    $main = Wait-Window 'Sistema de Achados e Perdidos'
    Click-Window $main 912 70
    $requests = Wait-Window 'Requisi'
    Capture-Window $requests '10-requisicoes-clientes.jpg' | Out-Null
    Click-Window $requests 108 114
    $newRequest = Wait-Window 'Nova Requisi'
    Capture-Window $newRequest '11-nova-requisicao.jpg' | Out-Null
    Close-Window $newRequest
    Close-Window $requests

    $main = Wait-Window 'Sistema de Achados e Perdidos'
    Click-Window $main 1004 70
    $reports = Wait-Window 'Relat'
    Capture-Window $reports '12-relatorios.jpg' | Out-Null
    Close-Window $reports

    $main = Wait-Window 'Sistema de Achados e Perdidos'
    Click-Window $main 1090 70
    $newUser = Wait-Window 'Cadastrar Novo Usu'
    Capture-Window $newUser '13-cadastro-usuario.jpg' | Out-Null
    Close-Window $newUser
}

Capture-TopLevelScreens
Get-ChildItem -Path $script:PrintDir -Filter *.jpg | Sort-Object Name | Select-Object Name, FullName
