#!/usr/bin/env bash
# Copies the approved public documents from ../latest into public/downloads
# under stable names, and renders a WebP thumbnail of each first page/image.
#
# Only files listed here are published. Confidential/internal documents in
# ../latest (sponsorship prospectus decks, internal briefs, stakeholder target
# lists) are deliberately NOT listed.
#
#   bash scripts/sync-downloads.sh [source_dir]
set -euo pipefail
SRC="${1:-../latest}"
OUT="public/downloads"
mkdir -p "$OUT"

# source file  ->  published name
declare -A FILES=(
  ["nigeria_2_0_concept_note.pdf"]="nigeria-2-0-concept-note.pdf"
  ["NLBS2026_Audience_Profile_Premium.pdf"]="nigeria-2-0-audience-profile.pdf"
  ["WhatsApp Image 2026-09-28 at 20.36.09.jpeg"]="nigeria-2-0-event-flyer.jpg"
)

for src in "${!FILES[@]}"; do
  dest="${FILES[$src]}"
  cp "$SRC/$src" "$OUT/$dest"
  base="${dest%.*}"
  if [[ "$dest" == *.pdf ]]; then
    pdftoppm -f 1 -l 1 -r 110 -png "$OUT/$dest" "/tmp/$base-thumb"
    in=$(ls /tmp/"$base"-thumb*.png | head -1)
  else
    in="$OUT/$dest"
  fi
  python3 - "$in" "$OUT/$base.webp" <<'PY'
import sys
from PIL import Image
im = Image.open(sys.argv[1]).convert("RGB")
im.thumbnail((720, 1000))
im.save(sys.argv[2], "WEBP", quality=82)
print(sys.argv[2], im.size)
PY
  rm -f /tmp/"$base"-thumb*.png
done
ls -la "$OUT"
