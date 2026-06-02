#!/bin/bash
# Build single-file startpage.html from index.html + style.css + script.js

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

OUTPUT="startpage.html"
SORTABLE_SRC="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"

CSS=$(<style.css)
JS=$(<script.js)
STARTPAGE_JS=${JS//"script.src = 'Sortable.min.js';"/"script.src = '$SORTABLE_SRC';"}
STARTPAGE_JS=${STARTPAGE_JS//"Failed to load Sortable.min.js"/"Failed to load Sortable from CDN"}

{
  cat <<'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Start Page</title>

EOF

  echo "  <script src=\"$SORTABLE_SRC\"></script>"
  echo ""
  echo "  <style>"
  echo "$CSS"
  echo "  </style>"
  echo "</head>"

  # Extract body (from <body> to </body> inclusive)
  sed -n '/<body>/,/<\/body>/p' index.html | sed '/<\/body>/d'

  # Inline JS before closing body
  echo "  <script>"
  echo "$STARTPAGE_JS"
  echo "  </script>"
  echo "</body>"
  echo "</html>"
} > "$OUTPUT"

echo "Built $OUTPUT ($(wc -l < "$OUTPUT") lines)"
