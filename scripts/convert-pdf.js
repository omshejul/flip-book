// scripts/convert-pdf.js
// Run locally to convert PDFs to images before deploying
// Usage: node scripts/convert-pdf.js input.pdf output-dir

const fs = require('fs');
const path = require('path');

// Note: This script requires additional dependencies:
// npm install pdfjs-dist canvas sharp
// OR use ImageMagick instead (simpler):
// convert -density 150 input.pdf -quality 90 public/books/my-book/page-%d.jpg

async function convertPDF(inputPath, outputDir) {
  try {
    // Check if pdfjs-dist is available
    const pdfjsLib = require('pdfjs-dist/legacy/build/pdf');
    const { createCanvas } = require('canvas');
    const sharp = require('sharp');

    const data = new Uint8Array(fs.readFileSync(inputPath));
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      
      const canvas = createCanvas(viewport.width, viewport.height);
      const context = canvas.getContext('2d');
      
      await page.render({ canvasContext: context, viewport }).promise;
      
      const buffer = canvas.toBuffer('image/png');
      await sharp(buffer)
        .jpeg({ quality: 85 })
        .toFile(path.join(outputDir, `page-${i}.jpg`));
      
      console.log(`Converted page ${i}/${pdf.numPages}`);
    }
    
    console.log(`✅ Successfully converted ${pdf.numPages} pages to ${outputDir}`);
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error(`
❌ Missing dependencies. Install them with:
   npm install pdfjs-dist canvas sharp

OR use ImageMagick instead (simpler):
   brew install imagemagick  # Mac
   sudo apt install imagemagick  # Linux
   
   Then run:
   convert -density 150 ${inputPath} -quality 90 ${outputDir}/page-%d.jpg
      `);
    } else {
      console.error('Error converting PDF:', error);
    }
  }
}

// Get command line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log(`
Usage: node scripts/convert-pdf.js <input.pdf> <output-dir>

Example:
  node scripts/convert-pdf.js ./my-book.pdf ./public/books/my-book

Or use ImageMagick (recommended):
  convert -density 150 input.pdf -quality 90 public/books/my-book/page-%d.jpg
  `);
  process.exit(1);
}

convertPDF(args[0], args[1]);

