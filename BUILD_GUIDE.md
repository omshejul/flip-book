# Flipbook Site - Build Guide

A comprehensive guide on how this static flipbook viewer is built and how to replicate it.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [How It Works](#how-it-works)
- [Adding Books](#adding-books)
- [PDF Conversion Workflow](#pdf-conversion-workflow)
- [Features](#features)
- [Deployment](#deployment)
- [Customization](#customization)

## Overview

This is a **static-only** flipbook viewer built with Next.js. It converts PDFs into page images and displays them with a beautiful page-flip animation. The entire site is pre-rendered at build time, requiring no backend or server-side processing.

### Key Characteristics

- ✅ **100% Static** - No backend required
- ✅ **Pre-rendered** - All pages generated at build time
- ✅ **Zero Runtime Costs** - Can be hosted on any static hosting service
- ✅ **Fast Loading** - Optimized WebP images and static assets
- ✅ **Mobile Friendly** - Responsive design with touch support and haptic feedback
- ✅ **Full Width** - Adapts to viewport size dynamically

## Tech Stack

### Core Technologies

- **Next.js 16** - React framework with static site generation
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework

### Key Libraries

- **react-pageflip** (`^2.0.3`) - Page flip animation library
- **react-feather** (`^2.0.10`) - Icon library
- **Next.js Image** - Optimized image component

### Build Tools

- **ImageMagick** - PDF to image conversion (required for scripts)
- **pnpm/npm** - Package manager

## Architecture

### Static Site Generation (SSG)

The site uses Next.js's static export feature:

```typescript
// next.config.ts
{
  output: 'export',
  images: { unoptimized: true }
}
```

This generates a fully static site in the `out/` directory that can be deployed anywhere.

### Data Flow

```
PDF File → Convert to Images (WebP) → Split Spreads (if needed) → 
Store in /public/books/ → Metadata in books.json → Build Static Pages → Deploy
```

### Component Architecture

```
app/page.tsx (Homepage)
  └── components/FlipBook.tsx
      ├── react-pageflip (HTMLFlipBook)
      ├── Next.js Image (for each page)
      └── Overlay Controls (buttons, page counter)
```

## Project Structure

```
flip-book/
├── app/
│   ├── page.tsx              # Homepage - renders FlipBook directly
│   ├── layout.tsx             # Root layout
│   ├── globals.css            # Global styles (scrollbar hiding)
│   └── book/
│       └── [slug]/
│           ├── page.tsx       # Dynamic book route (optional)
│           └── not-found.tsx  # 404 page
├── components/
│   └── FlipBook.tsx           # Main flipbook component
├── data/
│   └── books.json             # Book metadata
├── public/
│   └── books/
│       └── my-magazine/
│           ├── Cover final.pdf        # Cover PDF
│           ├── Haridwar Book final.pdf  # Main PDF
│           ├── page-1.webp            # Converted page images (WebP)
│           ├── page-2.webp
│           └── ...
├── scripts/
│   ├── convert-pdf.js         # PDF conversion helper (Node.js)
│   ├── split-all-pages.js     # Splits all pages in half (for spreads)
│   └── split-spreads.js       # Detects and splits spread images
├── next.config.ts              # Next.js config (static export)
└── package.json                # Dependencies
```

## Setup Instructions

### Prerequisites

- Node.js 18+ (or pnpm)
- ImageMagick (required for PDF conversion scripts)
  - Mac: `brew install imagemagick`
  - Linux: `sudo apt install imagemagick`
  - Windows: Download from [ImageMagick website](https://imagemagick.org/)

### Step 1: Create Next.js Project

```bash
npx create-next-app@latest flipbook-site
cd flipbook-site
```

### Step 2: Install Dependencies

```bash
npm install react-pageflip react-feather
# or
pnpm add react-pageflip react-feather
```

### Step 3: Configure Next.js for Static Export

Update `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

### Step 4: Create Directory Structure

```bash
mkdir -p components data public/books scripts
```

### Step 5: Set Up Global Styles

Add to `app/globals.css`:

```css
/* Hide scrollbars */
::-webkit-scrollbar {
  display: none;
}

html, body {
  -ms-overflow-style: none;
  scrollbar-width: none;
  overflow: hidden;
}

/* Disable hover effects on page flip edges */
.stf-parent {
  cursor: default !important;
}

.stf-parent .stf-block {
  cursor: default !important;
}

.stf-parent .stf-block:hover {
  cursor: default !important;
  pointer-events: none;
}

.stf-parent .stf-page {
  cursor: default !important;
}
```

## How It Works

### 1. PDF Conversion (Pre-build)

PDFs are converted to WebP images **before** deployment using ImageMagick at 300 DPI for high resolution.

### 2. Spread Splitting

If PDF pages contain spreads (two pages side-by-side), they are automatically split into individual pages using the `split-all-pages.js` script.

### 3. Metadata Configuration

Books are defined in `data/books.json`:

```json
[
  {
    "slug": "my-magazine",
    "title": "My Magazine Issue 1",
    "cover": "/books/my-magazine/page-1.webp",
    "pageCount": 88
  }
]
```

### 4. Component Rendering

The `FlipBook` component:

1. **Generates page URLs** from the slug and page count (WebP format)
2. **Renders HTMLFlipBook** with all page images
3. **Manages state** for current page, controls visibility, fullscreen, window size
4. **Handles interactions** - keyboard, mouse, touch, haptic feedback
5. **Adapts to viewport** - Full width with dynamic sizing

### 5. Static Generation

Next.js generates static HTML for:
- Homepage (`/`) - renders FlipBook directly
- Book routes (`/[slug]`) - dynamic routes for each book

### 6. Build Output

```bash
npm run build
```

Creates `out/` directory with:
- Static HTML files
- Optimized JavaScript bundles
- WebP image assets
- CSS files

## PDF Conversion Workflow

### For PDFs with Spreads (Two Pages Side-by-Side)

If your PDF contains spreads (two landscape pages per PDF page), follow this workflow:

#### Step 1: Convert Cover PDF

```bash
# Convert cover PDF to WebP
magick -density 300 "public/books/my-magazine/Cover final.pdf" -quality 90 public/books/my-magazine/page-temp-cover.webp

# Split cover into two pages
width=$(magick identify -format '%w' public/books/my-magazine/page-temp-cover.webp)
height=$(magick identify -format '%h' public/books/my-magazine/page-temp-cover.webp)
halfWidth=$((width / 2))
rightWidth=$((width - halfWidth))

magick public/books/my-magazine/page-temp-cover.webp -crop ${halfWidth}x${height}+0+0 +repage public/books/my-magazine/page-1.webp
magick public/books/my-magazine/page-temp-cover.webp -crop ${rightWidth}x${height}+${halfWidth}+0 +repage public/books/my-magazine/page-2.webp
rm public/books/my-magazine/page-temp-cover.webp
```

#### Step 2: Convert Main PDF (Skip First Page)

```bash
# Convert PDF pages 2 onwards (skip page 1) to WebP
cd public/books/my-magazine
for i in {1..41}; do
  magick -density 300 "Haridwar Book final.pdf[$i]" -quality 90 "page-temp-$i.webp"
done
```

#### Step 3: Split All Pages

```bash
# Use the split-all-pages.js script to split each page in half
node scripts/split-all-pages.js public/books/my-magazine
```

This script:
- Finds all `page-temp-*.webp` files
- Splits each image in half (left and right)
- Creates `page-N.webp` files starting from the highest existing page number
- Removes temp files after processing

#### Step 4: Update Metadata

Count the total pages and update `data/books.json`:

```json
{
  "slug": "my-magazine",
  "title": "My Magazine Issue 1",
  "cover": "/books/my-magazine/page-1.webp",
  "pageCount": 88
}
```

### For Single-Page PDFs

If your PDF already has one page per PDF page:

```bash
# Convert PDF to WebP images
magick -density 300 book.pdf -quality 90 public/books/my-book/page-%d.webp

# Rename to start from page-1.webp
cd public/books/my-book
count=$(ls page-*.webp | wc -l)
for i in $(seq 0 $((count-1))); do
  if [ -f "page-$i.webp" ]; then
    mv "page-$i.webp" "page-$((i+1)).webp"
  fi
done
```

## Adding Books

### Step 1: Prepare PDFs

- **Cover PDF**: `Cover final.pdf` (optional, can be split into 2 pages)
- **Main PDF**: `Haridwar Book final.pdf` (or your book PDF)

Place them in `public/books/[book-slug]/`

### Step 2: Convert PDFs to Images

Follow the [PDF Conversion Workflow](#pdf-conversion-workflow) above.

### Step 3: Update Metadata

Add to `data/books.json`:

```json
{
  "slug": "my-new-book",
  "title": "My New Book",
  "cover": "/books/my-new-book/page-1.webp",
  "pageCount": 88
}
```

### Step 4: Rebuild

```bash
npm run build
```

## Features

### Core Features

1. **Page Flip Animation**
   - Smooth 3D page flip effect
   - Shadow and depth effects
   - Responsive sizing with full-width support
   - Fast animation (500ms)

2. **Navigation**
   - Previous/Next buttons (overlay on book, rounded with borders)
   - Keyboard arrows (← →)
   - Touch/swipe support (mobile)
   - Click on page edges to flip
   - Haptic feedback on supported devices

3. **Auto-hiding Controls**
   - Controls appear on mouse movement (desktop)
   - Auto-hide after 2 seconds of inactivity
   - Always visible on mobile devices
   - Smooth fade transitions

4. **Fullscreen Mode**
   - Button in top-right corner
   - F11 or Ctrl+F keyboard shortcut
   - Escape to exit
   - Cross-browser support (including iOS Safari)

5. **PDF Download**
   - Download button next to fullscreen
   - Downloads original PDF file

6. **Responsive Design**
   - Full-width adaptation to viewport
   - Mobile-friendly touch controls
   - Dynamic window size tracking
   - Minimum/maximum size constraints

### UI/UX Features

- **No background** - Transparent, immersive experience
- **No scrollbars** - Clean, distraction-free interface
- **No title** - Focus on content
- **No hover effects** - Disabled hover cursor on page edges
- **Page counter** - Shows current page / total pages
  - Top-left on mobile
  - Bottom-center on desktop
- **Disabled state** - Buttons disabled at first/last page
- **Rounded buttons** - Modern design with borders and backdrop blur
- **Haptic feedback** - Short vibration on button clicks (mobile)

### Technical Features

- **WebP Format** - Better compression and quality than JPEG
- **High Resolution** - 300 DPI conversion for crisp images
- **Dynamic Sizing** - Adapts to window size changes
- **Spread Splitting** - Automatic detection and splitting of two-page spreads

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or connect GitHub repo for auto-deploy
```

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

### GitHub Pages

```bash
# Build
npm run build

# Copy out/ to gh-pages branch
# Or use GitHub Actions
```

### Any Static Host

1. Build the site: `npm run build`
2. Upload `out/` directory contents to your host
3. Configure host to serve `index.html` for all routes

## Customization

### Change Page Flip Speed

In `components/FlipBook.tsx`:

```typescript
flippingTime={500}  // milliseconds (default: 500)
```

### Adjust Control Hide Delay

```typescript
timer = setTimeout(() => {
  setShowControls(false);
}, 2000);  // Change 2000 to desired milliseconds
```

### Modify Button Styles

Update Tailwind classes in `FlipBook.tsx`:

```typescript
className="p-3 bg-black/40 text-white rounded-full border border-neutral-500/40 ..."
```

### Change Image Quality/Resolution

When converting PDFs:

```bash
# Higher resolution (slower, larger files)
magick -density 300 book.pdf -quality 90 ...

# Lower resolution (faster, smaller files)
magick -density 150 book.pdf -quality 85 ...
```

### Adjust Full-Width Constraints

In `components/FlipBook.tsx`:

```typescript
maxWidth={windowSize.width - 40}  // 40px padding
maxHeight={windowSize.height - 40}
```

### Modify Haptic Feedback

```typescript
navigator.vibrate(10);  // Change duration (milliseconds)
```

### Add Multiple Books

1. Convert each PDF to images
2. Add entries to `books.json`
3. Update homepage to show book list (or keep single book)

### Custom Styling

Modify `app/globals.css` or add custom CSS classes to components.

## Scripts Reference

### split-all-pages.js

Splits all temporary page images in half (for spreads).

**Usage:**
```bash
node scripts/split-all-pages.js <input-dir>
```

**What it does:**
- Finds all `page-temp-*.webp` files in the directory
- Splits each image vertically in half (left and right)
- Creates `page-N.webp` files starting from the highest existing page number
- Removes temp files after processing

### split-spreads.js

Detects spread images (two pages side-by-side) and splits them automatically.

**Usage:**
```bash
node scripts/split-spreads.js <input-dir>
```

**What it does:**
- Analyzes aspect ratio to detect spreads
- Splits spreads into individual pages
- Leaves single pages unchanged

### convert-pdf.js

Node.js-based PDF conversion script (alternative to ImageMagick command line).

**Usage:**
```bash
node scripts/convert-pdf.js <pdf-path> <output-dir>
```

## Troubleshooting

### Images Not Loading

- Check file paths match `books.json` metadata
- Ensure images are in `public/books/[slug]/`
- Verify image naming: `page-1.webp`, `page-2.webp`, etc.
- Check WebP format is supported

### Build Errors

- Ensure all required props are passed to `HTMLFlipBook`
- Check TypeScript types match
- Verify `books.json` is valid JSON
- Ensure ImageMagick is installed for scripts

### Fullscreen Not Working

- Some browsers require user interaction first
- Check browser console for errors
- Ensure `containerRef` is properly set
- iOS Safari uses different API - code handles this automatically

### Controls Not Hiding

- Check mouse event listeners are attached
- Verify timer cleanup in useEffect
- Check browser console for errors
- Mobile devices always show controls

### Spread Splitting Issues

- Verify ImageMagick is installed
- Check aspect ratio detection threshold in script
- Ensure temp files are named correctly (`page-temp-*.webp`)
- Check script output for errors

### Full Width Not Working

- Verify `windowSize` state is updating
- Check `maxWidth` and `maxHeight` props
- Ensure `size="stretch"` and `autoSize={true}` are set
- Check browser console for errors

## Performance Considerations

### Image Optimization

- Use WebP format for better compression (20-30% smaller than JPEG)
- Use appropriate DPI (300 for high quality, 150-200 for balance)
- WebP quality 90 balances size and quality
- Consider image dimensions based on viewport

### Build Optimization

- Static export eliminates runtime overhead
- Images are served as static assets
- JavaScript is code-split and optimized
- First 2 pages use `priority` prop for faster loading

### Loading Performance

- First 2 pages use `priority` prop for faster loading
- Remaining pages lazy load
- Consider adding loading states
- WebP format reduces file sizes significantly

## License

MIT

## Credits

- **react-pageflip** - Page flip animation library
- **react-feather** - Icon library
- **Next.js** - React framework
- **ImageMagick** - PDF conversion tool

---

**Built with ❤️ for static flipbook viewing**


pdftoppm -png -r 600 -scale-to 4000 -f 3 -l 3 "book.pdf" page
rm -f "page-3.webp"
magick page-03.png -quality 95 -define webp:lossless=true "page-3.webp"
rm -f "page-03.png"

pdftoppm -png -r 600 -scale-to 4000 -f 4 -l 4 "book.pdf" page
rm -f "page-4.webp"
magick page-04.png -quality 95 -define webp:lossless=true "page-4.webp"
rm -f "page-04.png"




PAGE=4; pdftoppm -png -r 600 -scale-to 4000 -f $PAGE -l $PAGE "book.pdf" page && rm -f "page-$PAGE.webp" && magick page-$(printf "%02d" $PAGE).png -quality 95 -define webp:lossless=true "page-$PAGE.webp" && rm -f "page-$(printf "%02d" $PAGE).png"


# High res for AutoCAD drawings
PAGE=4; pdftoppm -png -r 600 -scale-to 4000 -f $PAGE -l $PAGE "book.pdf" page && rm -f "page-$PAGE.webp" && magick page-$(printf "%02d" $PAGE).png -quality 95 -define webp:lossless=true "page-$PAGE.webp" && rm -f "page-$(printf "%02d" $PAGE).png"
PAGE=4; pdftoppm -png -r 1200 -scale-to 8000 -f $PAGE -l $PAGE "book.pdf" page && rm -f "page-$PAGE.webp" && magick page-$(printf "%02d" $PAGE).png -quality 95 -define webp:lossless=true "page-$PAGE.webp" && rm -f "page-$(printf "%02d" $PAGE).png"
# Low res for raster/regular pages
PAGE=4; pdftoppm -png -r 300 -scale-to 2000 -f $PAGE -l $PAGE "book.pdf" page && rm -f "page-$PAGE.webp" && magick page-$(printf "%02d" $PAGE).png -quality 85 "page-$PAGE.webp" && rm -f "page-$(printf "%02d" $PAGE).png"
PAGE=26; pdftoppm -png -r 400 -scale-to 3000 -f $PAGE -l $PAGE "book.pdf" page && rm -f "page-$PAGE.webp" && magick page-$(printf "%02d" $PAGE).png -quality 85 "page-$PAGE.webp" && rm -f "page-$(printf "%02d" $PAGE).png"



<!-- loop for n pages -->
for PAGE in {1..26}; do
  pdftoppm -png -r 1200 -scale-to 8000 -f $PAGE -l $PAGE "book.pdf" page && \
  rm -f "page-$PAGE.webp" && \
  magick page-$(printf "%02d" $PAGE).png -quality 85 "page-$PAGE.webp" && \
  rm -f "page-$(printf "%02d" $PAGE).png"
done
for PAGE in {3..12}; do
  pdftoppm -png -r 400 -scale-to 4000 -f $PAGE -l $PAGE "book.pdf" page && \
  rm -f "page-$PAGE.webp" && \
  magick page-$(printf "%02d" $PAGE).png -quality 85 "page-$PAGE.webp" && \
  rm -f "page-$(printf "%02d" $PAGE).png"
done
for PAGE in {13..21}; do
  pdftoppm -png -r 1200 -scale-to 8000 -f $PAGE -l $PAGE "book.pdf" page && \
  rm -f "page-$PAGE.webp" && \
  magick page-$(printf "%02d" $PAGE).png -quality 85 "page-$PAGE.webp" && \
  rm -f "page-$(printf "%02d" $PAGE).png"
done