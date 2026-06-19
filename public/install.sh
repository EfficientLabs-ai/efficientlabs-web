#!/bin/sh
# ==============================================================================
# Efficient Labs — StratosAgent installer.
#
# Usage:  curl -fsSL https://efficientlabs.ai/install.sh | sh
#
# This script is FAIL-CLOSED and does NOTHING privileged:
#   - NO sudo, ever.            - NO silent third-party `curl | sh` stages.
#   - NO auto-started services. - Installs a PINNED version.
# Missing prerequisites are reported with instructions; we never install them for you.
# ==============================================================================
set -eu

PKG="@efficientlabs/stratos"
VERSION="${STRATOS_VERSION:-1.2.0}"          # pinned; override deliberately via STRATOS_VERSION
EXPECTED_SHA256="${STRATOS_SHA256:-}"        # optional: verify the published tarball checksum

say() { printf '%s\n' "$*"; }
err() { printf 'ERROR: %s\n' "$*" >&2; }

say "Efficient Labs — StratosAgent installer"
say "  Target: ${PKG}@${VERSION}  (user-space, no sudo, nothing auto-started)"
say "  Host:   $(uname -s 2>/dev/null || echo unknown)/$(uname -m 2>/dev/null || echo unknown)"
say ""

# 1. Prerequisites — instruct, never auto-install ------------------------------------------------
if ! command -v node >/dev/null 2>&1; then
  err "Node.js >= 20.19.0 is required and was not found."
  say "  Install Node 20.19+ from https://nodejs.org (or your package manager), then re-run."
  exit 1
fi
# Require Node >= 20.19.0 (matches the package engines + locked dependency floor).
NODE_OK="$(node -p 'const [a,b]=process.versions.node.split(".").map(Number); (a>20||(a===20&&b>=19))?"ok":"no"' 2>/dev/null || echo no)"
if [ "${NODE_OK}" != "ok" ]; then
  err "Node.js >= 20.19.0 required (found $(node -v 2>/dev/null))."
  say "  Install Node 20.19+ from https://nodejs.org, then re-run."
  exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  err "npm is required (it ships with Node.js). Install Node 20.19+ and re-run."
  exit 1
fi

# 2. User-space global prefix — never sudo -------------------------------------------------------
PREFIX="$(npm config get prefix 2>/dev/null || echo '')"
if [ -n "${PREFIX}" ] && [ -e "${PREFIX}" ] && [ ! -w "${PREFIX}" ]; then
  err "npm global prefix '${PREFIX}' is not writable by your user."
  say "  Install WITHOUT sudo by pointing npm at a user-owned prefix:"
  say "    npm config set prefix \"\$HOME/.npm-global\""
  say "    export PATH=\"\$HOME/.npm-global/bin:\$PATH\"   # add this to your shell profile"
  say "  Then re-run this installer. We never use sudo."
  exit 1
fi

# 3. Optional integrity pin — verify the published tarball checksum before installing -------------
if [ -n "${EXPECTED_SHA256}" ]; then
  say "Verifying published tarball checksum…"
  TARBALL="$(npm pack "${PKG}@${VERSION}" --silent 2>/dev/null || echo '')"
  if [ -z "${TARBALL}" ] || [ ! -f "${TARBALL}" ]; then err "could not fetch ${PKG}@${VERSION} to verify."; exit 1; fi
  if command -v sha256sum >/dev/null 2>&1; then GOT="$(sha256sum "${TARBALL}" | awk '{print $1}')";
  else GOT="$(shasum -a 256 "${TARBALL}" | awk '{print $1}')"; fi
  rm -f "${TARBALL}"
  if [ "${GOT}" != "${EXPECTED_SHA256}" ]; then
    err "checksum mismatch — refusing to install."
    say "  expected: ${EXPECTED_SHA256}"
    say "  got:      ${GOT}"
    exit 1
  fi
  say "  checksum verified."
fi

# 4. Install the pinned version (user-space global) ----------------------------------------------
say "Installing ${PKG}@${VERSION}…"
npm install -g "${PKG}@${VERSION}"

# 5. Verify the CLI is on PATH and runs ----------------------------------------------------------
say ""
if command -v stratos >/dev/null 2>&1; then
  say "Installed: stratos $(stratos --version 2>/dev/null || echo '?')"
else
  say "Installed, but 'stratos' is not yet on your PATH."
  say "  Add your npm global bin to PATH, e.g.:"
  say "    export PATH=\"\$(npm config get prefix)/bin:\$PATH\"   # add this to your shell profile"
fi

# 6. Next steps — nothing privileged, nothing started automatically ------------------------------
say ""
say "Done. First run — set up your node and prove the loop:"
say "  stratos init                                persistent node identity + a workspace"
say "  stratos task create local/demo/flow/t1      scaffold a task"
say "  stratos complete local/demo/flow/t1 \"...\"    a REAL local completion + a signed receipt"
say "  stratos eval local/demo/flow/t1             re-verify the receipt (trace-integrity)"
say ""
say "Note: 'complete' needs a local OpenAI-compatible endpoint (e.g. Ollama: 'ollama serve' +"
say "  'ollama pull gemma2:2b'), pointed at via --gateway or STRATOS_GATEWAY_URL"
say "  (e.g. http://127.0.0.1:11434/v1/chat/completions). No model is bundled; your data stays local."
say ""
say "Deterministic, no-network commands (no endpoint needed): workspace · task · capture · trace · eval · route · receipt."
