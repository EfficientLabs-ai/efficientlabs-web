# ==============================================================================
# Efficient Labs - StratosAgent installer (Windows PowerShell).
#
# Usage:  irm https://efficientlabs.ai/install.ps1 | iex
#
# FAIL-CLOSED and does NOTHING privileged:
#   - NO admin elevation.        - NO silent third-party stages.
#   - NO auto-started services.  - Installs a PINNED version.
# Missing prerequisites are reported with instructions; we never install them for you.
# ==============================================================================
$ErrorActionPreference = 'Stop'

$Pkg     = '@efficientlabs/stratos'
$Version = if ($env:STRATOS_VERSION) { $env:STRATOS_VERSION } else { '1.2.0' }   # pinned

function Say($m) { Write-Host $m }
function Fail($m) { Write-Error "ERROR: $m"; exit 1 }

Say "Efficient Labs - StratosAgent installer"
Say "  Target: ${Pkg}@${Version}  (user-space, no admin, nothing auto-started)"
Say ""

# 1. Prerequisites - instruct, never auto-install --------------------------------------------------
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Say "  Install Node 20.19+ from https://nodejs.org, then re-run."
  Fail "Node.js >= 20.19.0 is required and was not found."
}
# Require Node >= 20.19.0 (matches the package engines + locked dependency floor).
$nodeOk = 'no'
try { $nodeOk = (node -p 'const [a,b]=process.versions.node.split(".").map(Number); (a>20||(a===20&&b>=19))?"ok":"no"') 2>$null } catch {}
if ($nodeOk -ne 'ok') { Fail "Node.js >= 20.19.0 required (found $(node -v))." }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Fail "npm is required (it ships with Node.js). Install Node 20.19+ and re-run."
}

# 2. Install the pinned version (user-space global, no admin) --------------------------------------
Say "Installing ${Pkg}@${Version}..."
npm install -g "${Pkg}@${Version}"
if ($LASTEXITCODE -ne 0) { Fail "npm install failed (exit $LASTEXITCODE)." }

# 3. Verify the CLI is on PATH and runs ------------------------------------------------------------
Say ""
if (Get-Command stratos -ErrorAction SilentlyContinue) {
  Say "Installed: stratos $(stratos --version)"
} else {
  $binDir = (npm config get prefix)
  Say "Installed, but 'stratos' is not on your PATH yet."
  Say "  Add your npm global bin to PATH (then reopen PowerShell):"
  Say "    `$env:PATH = `"$binDir;`$env:PATH`""
}

# 4. Next steps - nothing privileged, nothing started automatically --------------------------------
Say ""
Say "First run - set up your node and prove the loop:"
Say "  stratos init"
Say "  stratos task create local/demo/flow/t1"
Say "  stratos complete local/demo/flow/t1 `"In one sentence, what is sovereign AI?`""
Say "  stratos eval local/demo/flow/t1"
Say ""
Say "Note: 'complete' needs a local OpenAI-compatible endpoint (e.g. Ollama: 'ollama serve' +"
Say "  'ollama pull gemma2:2b'), pointed at via --gateway or `$env:STRATOS_GATEWAY_URL"
Say "  (e.g. http://127.0.0.1:11434/v1/chat/completions). No model is bundled; your data stays local."
Say ""
Say "Deterministic, no-network commands (no endpoint needed): workspace, task, capture, trace, eval, route, receipt."
