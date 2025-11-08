# Static Flipbook Site

A simple, static-only flipbook viewer built with Next.js. Perfect for personal use - no backend required!

> 📖 **For detailed build instructions and architecture documentation, see [BUILD_GUIDE.md](./BUILD_GUIDE.md)**

## Features

- 📖 Beautiful page-flip animation using `react-pageflip`
- 🎨 Modern, responsive UI
- ⌨️ Keyboard navigation (arrow keys)
- 📱 Mobile-friendly
- 🚀 Static site generation - deploy anywhere

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Add Your Books

#### Option A: Using ImageMagick (Recommended)

```bash
# Install ImageMagick
brew install imagemagick  # Mac
# or
sudo apt install imagemagick  # Linux

# Convert PDF to images
convert -density 150 input.pdf -quality 90 public/books/my-book/page-%d.jpg
```

#### Option B: Using Node.js Script

```bash
# Install conversion dependencies
npm install pdfjs-dist canvas sharp

# Convert PDF
node scripts/convert-pdf.js input.pdf public/books/my-book
```

### 3. Update Metadata

Edit `data/books.json` to add your book:

```json
{
  "slug": "my-book",
  "title": "My Book Title",
  "cover": "/books/my-book/page-1.jpg",
  "pageCount": 24
}
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your flipbooks.

### 5. Build & Deploy

```bash
# Build static site
npm run build

# Deploy to Vercel
vercel

# Or deploy to Netlify
netlify deploy --prod
```

## Project Structure

```
flip-book/
├── app/
│   ├── page.tsx              # Home page (book list)
│   └── book/[slug]/page.tsx  # Book viewer
├── components/
│   └── FlipBook.tsx          # Flipbook component
├── data/
│   └── books.json            # Book metadata
├── public/
│   └── books/                # Book images
│       ├── my-magazine/
│       │   ├── page-1.jpg
│       │   ├── page-2.jpg
│       │   └── ...
│       └── product-catalog/
│           └── ...
└── scripts/
    └── convert-pdf.js        # PDF conversion script
```

## Adding a New Book

1. **Convert PDF to images:**

   ```bash
   mkdir -p public/books/my-new-book
   convert -density 150 my-book.pdf -quality 90 public/books/my-new-book/page-%d.jpg
   ```

2. **Add to `data/books.json`:**

   ```json
   {
     "slug": "my-new-book",
     "title": "My New Book",
     "cover": "/books/my-new-book/page-1.jpg",
     "pageCount": 20
   }
   ```

3. **Rebuild and deploy:**
   ```bash
   npm run build
   vercel
   ```

## Configuration

The site is configured for static export in `next.config.ts`:

```typescript
{
  output: 'export',
  images: {
    unoptimized: true,
  }
}
```

This allows deployment to any static hosting service (Vercel, Netlify, GitHub Pages, etc.).

## Notes

- Images should be named `page-1.jpg`, `page-2.jpg`, etc.
- Recommended image quality: 85-90% JPEG
- Recommended resolution: 150-200 DPI for PDF conversion
- The flipbook component supports keyboard navigation (arrow keys)
- Mobile users can swipe/scroll through pages

## License

MIT
