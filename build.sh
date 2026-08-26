#!/bin/bash
# Build single-file startpage.html from index.html + style.css + script.js

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

OUTPUT="startpage.html"
SORTABLE_SRC="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"

CSS=$(<style.css)
STARTPAGE_CSS=${CSS//"assets/fonts/JetBrainsMono-400.woff2"/"https://cdn.jsdelivr.net/npm/jetbrains-mono@1.0.6/fonts/webfonts/JetBrainsMono-Regular.woff2"}
STARTPAGE_CSS=${STARTPAGE_CSS//"assets/fonts/JetBrainsMono-500.woff2"/"https://cdn.jsdelivr.net/npm/jetbrains-mono@1.0.6/fonts/webfonts/JetBrainsMono-Medium.woff2"}
STARTPAGE_CSS=${STARTPAGE_CSS//"assets/fonts/JetBrainsMono-600.woff2"/"https://cdn.jsdelivr.net/npm/jetbrains-mono@1.0.6/fonts/webfonts/JetBrainsMono-SemiBold.woff2"}
STARTPAGE_CSS=${STARTPAGE_CSS//"assets/fonts/JetBrainsMono-700.woff2"/"https://cdn.jsdelivr.net/npm/jetbrains-mono@1.0.6/fonts/webfonts/JetBrainsMono-Bold.woff2"}
JS=$(<script.js)
STARTPAGE_JS=${JS//"script.src = 'Sortable.min.js';"/"script.src = '$SORTABLE_SRC';"}
STARTPAGE_JS=${STARTPAGE_JS//"Failed to load Sortable.min.js"/"Failed to load Sortable from CDN"}

{
  cat <<'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Start Page</title>
  <script>
    (() => {
      const root = document.documentElement;
      if (!localStorage.getItem('hasVisited')) root.classList.add('is-first-visit');
      if (localStorage.getItem('theme') === 'dark') root.classList.add('dark-mode');
    })();
  </script>
EOF

  echo "  <script src=\"$SORTABLE_SRC\"></script>"
  echo ""
  echo "  <style>"
  echo "$STARTPAGE_CSS"
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
