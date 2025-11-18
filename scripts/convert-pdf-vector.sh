#!/bin/bash
# Convert PDF to WebP with optimized settings for vector graphics
# Usage: ./scripts/convert-pdf-vector.sh input.pdf output-dir

if [ $# -lt 2 ]; then
  echo "Usage: $0 <input.pdf> <output-dir>"
  echo "Example: $0 book.pdf public/books/my-book"
  exit 1
fi

INPUT_PDF="$1"
OUTPUT_DIR="$2"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Convert with settings optimized for vector graphics
# -density 350: High resolution for vectors without hitting encoder limits
# -colorspace RGB: Preserves color accuracy
# -quality 95 & lossless: Prevent fading/compression artifacts
# -resize 4000x4000>: Cap size to avoid WebP encoder restrictions while retaining detail
magick -density 350 -colorspace RGB -quality 95 -define webp:lossless=true -resize 4000x4000\> "$INPUT_PDF" "$OUTPUT_DIR/page-%d.webp"

# Rename pages to start from 1 if they start from 0
cd "$OUTPUT_DIR"
for i in {0..9}; do
  if [ -f "page-$i.webp" ]; then
    mv "page-$i.webp" "page-$((i+1)).webp"
  fi
done

# Handle pages with leading zeros
for file in page-*.webp; do
  if [[ "$file" =~ page-0[0-9]+\.webp ]]; then
    num=$(echo "$file" | sed 's/page-\([0-9]*\)\.webp/\1/' | sed 's/^0*//')
    if [ -z "$num" ]; then num=0; fi
    newnum=$((num + 1))
    mv "$file" "page-${newnum}.webp" 2>/dev/null || true
  fi
done

echo "✅ Conversion complete! Check $OUTPUT_DIR for WebP files."

