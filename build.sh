#!/bin/bash
# Build a self-contained StartPage.html from local project resources.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

OUTPUT="StartPage.html"
STARTPAGE_CSS=$(<style.css)
STARTPAGE_JS=$(<script.js)

# Fonts and icons must work when the HTML is moved away from the project folder.
for FONT_FILE in assets/fonts/*.woff2; do
  FONT_DATA=$(base64 < "$FONT_FILE" | tr -d '\r\n')
  STARTPAGE_CSS=${STARTPAGE_CSS//"$FONT_FILE"/"data:font/woff2;base64,$FONT_DATA"}
done
for ICON_FILE in assets/engine-icons/*.ico assets/engine-icons/*.svg; do
  [ -f "$ICON_FILE" ] || continue
  case "$ICON_FILE" in
    *.svg) ICON_TYPE="image/svg+xml" ;;
    *.ico) ICON_TYPE="image/x-icon" ;;
  esac
  ICON_DATA=$(base64 < "$ICON_FILE" | tr -d '\r\n')
  STARTPAGE_JS=${STARTPAGE_JS//"$ICON_FILE"/"data:$ICON_TYPE;base64,$ICON_DATA"}
done

{
  cat <<'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Start Page</title>
  <script>
EOF
  cat boot.js
  printf '\n  </script>\n  <style>\n%s\n  </style>\n</head>\n' "$STARTPAGE_CSS"

  # Preserve the same UI as the extension version.
  sed -n '/<body>/,/<\/body>/p' index.html | sed '/<\/body>/d'

  printf '  <script>\n'
  cat Sortable.min.js
  printf '\n  </script>\n  <script>\n%s\n  </script>\n</body>\n</html>\n' "$STARTPAGE_JS"
} > "$OUTPUT"

echo "Built $OUTPUT ($(wc -l < "$OUTPUT") lines)"
