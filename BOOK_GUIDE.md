# How to Add or Modify Books - Complete Guide

This guide will walk you through adding new books or modifying existing ones in your flipbook application.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Adding a New Book](#adding-a-new-book)
- [Modifying an Existing Book](#modifying-an-existing-book)
- [Book Formats](#book-formats)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Prerequisites

Before you begin, make sure you have:

1. **ImageMagick installed** (required for PDF conversion)
   ```bash
   # Mac
   brew install imagemagick
   
   # Linux
   sudo apt install imagemagick
   
   # Windows
   # Download from https://imagemagick.org/
   ```

2. **Node.js and pnpm/npm** installed
3. **Access to the project directory**

## Adding a New Book

### Step 1: Prepare Your PDF

1. Place your PDF file in a location you can access
2. Make sure the PDF is named `book.pdf` (recommended) or note the exact filename
3. Check if your PDF contains:
   - **Single pages** (portrait, one page per PDF page) - Simple conversion
   - **Spreads** (landscape, two pages side-by-side) - Requires splitting

### Step 2: Create Book Directory

Create a new directory for your book in `public/books/`:

```bash
mkdir -p public/books/your-book-slug
```

**Important:** Use a URL-friendly slug (lowercase, hyphens, no spaces)
- ✅ Good: `my-awesome-book`, `documentation-trophy`, `product-catalog-2024`
- ❌ Bad: `My Awesome Book`, `book_1`, `book with spaces`

### Step 3: Copy PDF to Book Directory

```bash
cp /path/to/your/book.pdf public/books/your-book-slug/book.pdf
```

**Note:** The PDF should be named `book.pdf` for the download feature to work correctly.

### Step 4: Convert PDF to Images

#### Option A: Simple Pages (One PDF Page = One Flipbook Page)

If your PDF has one page per PDF page (portrait orientation):

```bash
cd public/books/your-book-slug
magick -density 300 "book.pdf" -quality 90 "page-%d.webp"
```

This creates `page-1.webp`, `page-2.webp`, etc.

**If pages start from 0:**
```bash
# Rename pages to start from 1
for i in {0..9}; do
  if [ -f "page-$i.webp" ]; then
    mv "page-$i.webp" "page-$((i+1)).webp"
  fi
done
```

#### Option B: Pages with Leading Zeros

If ImageMagick creates `page-00.webp`, `page-01.webp`, etc.:

```bash
# Rename to remove leading zeros and start from 1
for file in page-*.webp; do
  num=$(echo "$file" | sed 's/page-\([0-9]*\)\.webp/\1/' | sed 's/^0*//')
  if [ -z "$num" ]; then num=0; fi
  newnum=$((num + 1))
  mv "$file" "page-${newnum}.webp"
done
```

#### Option C: PDFs with Spreads (Two Pages Side-by-Side)

If your PDF has landscape pages with two pages side-by-side, you need to split them:

```bash
# First, convert PDF to temporary images
cd public/books/your-book-slug
magick -density 300 "book.pdf" -quality 90 "page-temp-%d.webp"

# Then use the split script
cd ../../..
node scripts/split-all-pages.js public/books/your-book-slug
```

This will split each spread into two individual pages.

### Step 5: Count Your Pages

```bash
ls -1 public/books/your-book-slug/page-*.webp | wc -l
```

Note this number - you'll need it for the next step.

### Step 6: Update books.json

Edit `data/books.json` and add your new book:

```json
[
  {
    "slug": "my-magazine",
    "title": "My Magazine Issue 1",
    "cover": "/books/my-magazine/page-1.webp",
    "pageCount": 88
  },
  {
    "slug": "your-book-slug",
    "title": "Your Book Title",
    "cover": "/books/your-book-slug/page-1.webp",
    "pageCount": 10
  }
]
```

**Fields explained:**
- `slug`: URL-friendly identifier (must match directory name)
- `title`: Display name for your book
- `cover`: Path to the first page image (usually `page-1.webp`)
- `pageCount`: Total number of pages (from Step 5)

### Step 7: Verify Your Book

1. Start the development server:
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

2. Visit your book:
   - Direct route: `http://localhost:3000/your-book-slug`
   - Or navigate from the homepage

3. Test the features:
   - ✅ Pages flip correctly
   - ✅ Download button works
   - ✅ Fullscreen works
   - ✅ Mobile navigation works

### Step 8: Build and Deploy

Once everything looks good:

```bash
# Build static site
pnpm build
# or
npm run build

# Deploy (example with Vercel)
vercel
```

## Modifying an Existing Book

### Update Book Metadata

Edit `data/books.json` to change:
- Title
- Cover image path
- Page count

```json
{
  "slug": "existing-book-slug",  // Don't change this!
  "title": "New Title",
  "cover": "/books/existing-book-slug/page-1.webp",
  "pageCount": 25
}
```

### Replace Pages

1. **Backup existing pages** (optional but recommended):
   ```bash
   cp -r public/books/existing-book-slug public/books/existing-book-slug-backup
   ```

2. **Remove old pages:**
   ```bash
   rm public/books/existing-book-slug/page-*.webp
   ```

3. **Convert new PDF:**
   ```bash
   cd public/books/existing-book-slug
   magick -density 300 "book.pdf" -quality 90 "page-%d.webp"
   ```

4. **Update page count** in `data/books.json`

5. **Rebuild:**
   ```bash
   pnpm build
   ```

### Add More Pages to Existing Book

1. **Find the highest page number:**
   ```bash
   ls -1 public/books/existing-book-slug/page-*.webp | sort -V | tail -1
   ```

2. **Convert additional pages from PDF:**
   ```bash
   cd public/books/existing-book-slug
   # Convert pages starting from page 11 (if you have 10 pages already)
   magick -density 300 "book.pdf[10-19]" -quality 90 "page-%02d.webp"
   ```

3. **Rename to continue numbering:**
   ```bash
   # Rename page-00.webp to page-11.webp, etc.
   for file in page-*.webp; do
     num=$(echo "$file" | sed 's/page-\([0-9]*\)\.webp/\1/' | sed 's/^0*//')
     if [ -z "$num" ]; then num=0; fi
     newnum=$((num + 11))  # Adjust based on your starting page
     mv "$file" "page-${newnum}.webp"
   done
   ```

4. **Update page count** in `data/books.json`

### Update PDF File

Simply replace the PDF file:

```bash
cp /path/to/new-book.pdf public/books/existing-book-slug/book.pdf
```

The download button will automatically use the new PDF.

## Book Formats

### Supported Image Formats

- **WebP** (recommended) - Best compression and quality
- **JPEG** - Also supported, larger file size
- **PNG** - Supported but not recommended (large file size)

### Image Quality Settings

**For WebP:**
```bash
magick -density 300 "book.pdf" -quality 90 "page-%d.webp"
```

**For JPEG:**
```bash
magick -density 300 "book.pdf" -quality 85 "page-%d.jpg"
```

**Quality recommendations:**
- `85-90`: High quality, good file size (recommended)
- `90-95`: Very high quality, larger files
- `75-85`: Lower quality, smaller files (for faster loading)

**Density (DPI) recommendations:**
- `150`: Standard quality, smaller files
- `200`: Good quality, balanced
- `300`: High quality, larger files (recommended for print-quality)

## Troubleshooting

### Problem: Pages are numbered incorrectly

**Solution:** Rename pages to start from 1:
```bash
cd public/books/your-book-slug
for i in {0..9}; do
  if [ -f "page-$i.webp" ]; then
    mv "page-$i.webp" "page-$((i+1)).webp"
  fi
done
```

### Problem: "Unknown size" in download dialog

**Solution:** Make sure your PDF is named `book.pdf`:
```bash
cd public/books/your-book-slug
ls -la *.pdf  # Should show book.pdf
```

### Problem: Pages are split incorrectly (spreads)

**Solution:** Use the split script:
```bash
node scripts/split-all-pages.js public/books/your-book-slug
```

### Problem: Book doesn't appear after adding

**Solutions:**
1. Check `books.json` syntax (valid JSON)
2. Verify slug matches directory name
3. Ensure page files exist and are numbered correctly
4. Restart development server
5. Clear browser cache

### Problem: Images are too large/slow to load

**Solutions:**
1. Reduce quality: `-quality 85` instead of `90`
2. Reduce density: `-density 200` instead of `300`
3. Use WebP format instead of JPEG

### Problem: Download button doesn't work

**Solutions:**
1. Ensure PDF is named `book.pdf`
2. Check file path: `/books/your-slug/book.pdf`
3. Verify PDF file exists in the directory

## Best Practices

### File Naming

- ✅ Use lowercase slugs: `my-book`, `product-catalog`
- ✅ Use hyphens, not underscores: `my-book` not `my_book`
- ✅ Keep slugs short and descriptive
- ✅ PDF should be named `book.pdf` for consistency

### Image Optimization

1. **Use WebP format** for best compression
2. **Use 300 DPI** for high-quality displays
3. **Use quality 90** for WebP (good balance)
4. **Test file sizes** - aim for 200KB-500KB per page

### Directory Structure

```
public/books/
├── your-book-slug/
│   ├── book.pdf          # Source PDF (required for download)
│   ├── page-1.webp       # Page images (required)
│   ├── page-2.webp
│   └── ...
```

### Page Numbering

- Pages must start from `page-1.webp`
- Pages must be sequential: `page-1.webp`, `page-2.webp`, etc.
- No gaps in numbering
- Use WebP extension (or JPEG if preferred)

### Testing Checklist

Before deploying, verify:

- [ ] All pages load correctly
- [ ] Page count matches actual pages
- [ ] Download button works and shows correct file size
- [ ] Fullscreen mode works
- [ ] Mobile navigation works (swipe/scroll)
- [ ] Keyboard navigation works (arrow keys)
- [ ] Book appears in navigation (if applicable)
- [ ] Cover image displays correctly

### Version Control

**Recommended .gitignore entries:**
```
# Don't commit large image files
public/books/*/page-*.webp
public/books/*/page-*.jpg

# But do commit:
public/books/*/book.pdf
data/books.json
```

**Note:** For production, you may want to commit images. Adjust `.gitignore` accordingly.

## Quick Reference

### Add New Book (Simple)

```bash
# 1. Create directory
mkdir -p public/books/my-book

# 2. Copy PDF
cp book.pdf public/books/my-book/book.pdf

# 3. Convert to images
cd public/books/my-book
magick -density 300 "book.pdf" -quality 90 "page-%d.webp"

# 4. Count pages
ls -1 page-*.webp | wc -l

# 5. Update data/books.json
# Add entry with slug, title, cover, pageCount

# 6. Test
pnpm dev
```

### Update Existing Book

```bash
# 1. Backup (optional)
cp -r public/books/my-book public/books/my-book-backup

# 2. Replace PDF
cp new-book.pdf public/books/my-book/book.pdf

# 3. Remove old pages
rm public/books/my-book/page-*.webp

# 4. Convert new PDF
cd public/books/my-book
magick -density 300 "book.pdf" -quality 90 "page-%d.webp"

# 5. Update pageCount in data/books.json

# 6. Rebuild
pnpm build
```

## Need Help?

- Check the [BUILD_GUIDE.md](./BUILD_GUIDE.md) for architecture details
- Review existing books in `public/books/` for examples
- Check `data/books.json` for correct format

---

**Last Updated:** 2024

