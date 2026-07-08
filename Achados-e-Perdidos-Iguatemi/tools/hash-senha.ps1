param(
  [Parameter(Mandatory = $true)]
  [string]$Senha
)

$ErrorActionPreference = "Stop"

$outDir = Join-Path $PSScriptRoot ".hashout"
if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

javac -encoding UTF-8 -d $outDir -sourcepath (Join-Path $PSScriptRoot "..\\src") `
  (Join-Path $PSScriptRoot "HashSenhaCLI.java") `
  (Join-Path $PSScriptRoot "..\\src\\util\\SenhaUtil.java")

java -cp $outDir HashSenhaCLI $Senha

