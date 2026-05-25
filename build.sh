#!/bin/bash
# Build single-file startpage.html from index.html + style.css + script.js
# Sortable.min.js is replaced with a CDN link.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

SORTABLE_CDN="https://cdn.jsdelivr.net/npm/sortablejs@1.15.6/Sortable.min.js"
OUTPUT="startpage.html"

CSS=$(<style.css)
JS=$(<script.js)

{
  cat <<'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Start Page</title>

  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/qweather-icons@1.7.0/font/qweather-icons.css">

EOF

  echo "  <script src=\"$SORTABLE_CDN\" defer></script>"
  echo ""
  echo "  <style>"
  echo "$CSS"
  echo "  </style>"
  echo "</head>"

  # Extract body (from <body> to </body> inclusive)
  sed -n '/<body>/,/<\/body>/p' index.html | sed '/<\/body>/d'

  # Inline JS before closing body
  echo "  <script>"
  echo "$JS"
  echo "  </script>"
  echo "</body>"
  echo "</html>"
} > "$OUTPUT"

echo "Built $OUTPUT ($(wc -l < "$OUTPUT") lines)"
