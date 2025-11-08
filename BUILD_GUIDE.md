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
- [Features](#features)
- [Deployment](#deployment)
- [Customization](#customization)

## Overview

This is a **static-only** flipbook viewer built with Next.js. It converts PDFs into page images and displays them with a beautiful page-flip animation. The entire site is pre-rendered at build time, requiring no backend or server-side processing.

### Key Characteristics

- ✅ **100% Static** - No backend required
- ✅ **Pre-rendered** - All pages generated at build time
- ✅ **Zero Runtime Costs** - Can be hosted on any static hosting service
- ✅ **Fast Loading** - Optimized images and static assets
- ✅ **Mobile Friendly** - Responsive design with touch support

## Tech Stack

### Core Technologies

- **Next.js 16** - React framework with static site generation
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework

### Key Libraries

- **react-pageflip** (`^2.0.3`) - Page flip animation library
- **Next.js Image** - Optimized image component

### Build Tools

- **ImageMagick** - PDF to image conversion (optional, can use Node.js script)
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
PDF File → Convert to Images → Store in /public/books/ → 
Metadata in books.json → Build Static Pages → Deploy
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
│           ├── book.pdf       # Original PDF
│           ├── page-1.jpg      # Converted page images
│           ├── page-2.jpg
│           └── ...
├── scripts/
│   └── convert-pdf.js         # PDF conversion helper
├── next.config.ts              # Next.js config (static export)
└── package.json                # Dependencies
```

## Setup Instructions

### Prerequisites

- Node.js 18+ (or pnpm)
- ImageMagick (for PDF conversion) - Optional

### Step 1: Create Next.js Project

```bash
npx create-next-app@latest flipbook-site
cd flipbook-site
```

### Step 2: Install Dependencies

```bash
npm install react-pageflip
# or
pnpm add react-pageflip
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
```

## How It Works

### 1. PDF Conversion (Pre-build)

PDFs are converted to images **before** deployment:

```bash
# Using ImageMagick (recommended)
magick -density 150 book.pdf -quality 90 public/books/my-book/page-%d.jpg

# Then rename to start from page-1.jpg
for i in {0..29}; do
  mv "page-$i.jpg" "page-$((i+1)).jpg"
done
```

### 2. Metadata Configuration

Books are defined in `data/books.json`:

```json
[
  {
    "slug": "my-magazine",
    "title": "My Magazine Issue 1",
    "cover": "/books/my-magazine/page-1.jpg",
    "pageCount": 30
  }
]
```

### 3. Component Rendering

The `FlipBook` component:

1. **Generates page URLs** from the slug and page count
2. **Renders HTMLFlipBook** with all page images
3. **Manages state** for current page, controls visibility, fullscreen
4. **Handles interactions** - keyboard, mouse, touch

### 4. Static Generation

Next.js generates static HTML for:
- Homepage (`/`) - renders FlipBook directly
- Book routes (`/book/[slug]`) - optional dynamic routes

### 5. Build Output

```bash
npm run build
```

Creates `out/` directory with:
- Static HTML files
- Optimized JavaScript bundles
- Image assets
- CSS files

## Adding Books

### Step 1: Convert PDF to Images

```bash
# Create directory
mkdir -p public/books/my-new-book

# Convert PDF (ImageMagick)
magick -density 150 my-book.pdf -quality 90 public/books/my-new-book/page-%d.jpg

# Rename to start from page-1.jpg
cd public/books/my-new-book
count=$(ls page-*.jpg | wc -l)
for i in $(seq 0 $((count-1))); do
  if [ -f "page-$i.jpg" ]; then
    mv "page-$i.jpg" "page-$((i+1)).jpg"
  fi
done
```

### Step 2: Copy PDF (Optional)

```bash
cp my-book.pdf public/books/my-new-book/book.pdf
```

### Step 3: Update Metadata

Add to `data/books.json`:

```json
{
  "slug": "my-new-book",
  "title": "My New Book",
  "cover": "/books/my-new-book/page-1.jpg",
  "pageCount": 30
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
   - Responsive sizing

2. **Navigation**
   - Previous/Next buttons (overlay on book)
   - Keyboard arrows (← →)
   - Touch/swipe support (mobile)
   - Click on page edges to flip

3. **Auto-hiding Controls**
   - Controls appear on mouse movement
   - Auto-hide after 2 seconds of inactivity
   - Smooth fade transitions

4. **Fullscreen Mode**
   - Button in top-right corner
   - F11 or Ctrl+F keyboard shortcut
   - Escape to exit

5. **PDF Download**
   - Download button next to fullscreen
   - Downloads original PDF file

6. **Responsive Design**
   - Adapts to screen size
   - Mobile-friendly touch controls
   - Minimum/maximum size constraints

### UI/UX Features

- **No background** - Transparent, immersive experience
- **No scrollbars** - Clean, distraction-free interface
- **No title** - Focus on content
- **Page counter** - Shows current page / total pages
- **Disabled state** - Buttons disabled at first/last page

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
flippingTime={1000}  // milliseconds
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
className="px-4 py-2 bg-black/60 text-white rounded-lg ..."
```

### Change Image Quality

When converting PDFs:

```bash
magick -density 200 book.pdf -quality 95 ...  # Higher quality
magick -density 100 book.pdf -quality 80 ...  # Lower quality, smaller files
```

### Add Multiple Books

1. Convert each PDF to images
2. Add entries to `books.json`
3. Update homepage to show book list (or keep single book)

### Custom Styling

Modify `app/globals.css` or add custom CSS classes to components.

## Troubleshooting

### Images Not Loading

- Check file paths match `books.json` metadata
- Ensure images are in `public/books/[slug]/`
- Verify image naming: `page-1.jpg`, `page-2.jpg`, etc.

### Build Errors

- Ensure all required props are passed to `HTMLFlipBook`
- Check TypeScript types match
- Verify `books.json` is valid JSON

### Fullscreen Not Working

- Some browsers require user interaction first
- Check browser console for errors
- Ensure `containerRef` is properly set

### Controls Not Hiding

- Check mouse event listeners are attached
- Verify timer cleanup in useEffect
- Check browser console for errors

## Performance Considerations

### Image Optimization

- Use appropriate DPI (150-200) for PDF conversion
- JPEG quality 85-90 balances size and quality
- Consider WebP format for better compression

### Build Optimization

- Static export eliminates runtime overhead
- Images are served as static assets
- JavaScript is code-split and optimized

### Loading Performance

- First 2 pages use `priority` prop for faster loading
- Remaining pages lazy load
- Consider adding loading states

## License

MIT

## Credits

- **react-pageflip** - Page flip animation library
- **Next.js** - React framework
- **ImageMagick** - PDF conversion tool

---

**Built with ❤️ for static flipbook viewing**

