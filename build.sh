#!/bin/bash
# Compatibility entry point. The same build runs on Windows, macOS and Linux.
set -euo pipefail
cd "$(dirname "$0")"
node tools/build.mjs
