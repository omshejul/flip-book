// scripts/split-all-pages.js
// Splits each page image in half (left and right) to create two individual pages
// Usage: node scripts/split-all-pages.js <input-dir>

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function splitAllPages(inputDir) {
  const files = fs.readdirSync(inputDir)
    .filter(f => f.startsWith('page-temp-') && (f.endsWith('.jpg') || f.endsWith('.webp')))
    .sort((a, b) => {
      const matchA = a.match(/page-temp-(\d+)\.(jpg|webp)/);
      const matchB = b.match(/page-temp-(\d+)\.(jpg|webp)/);
      if (!matchA || !matchB) return 0;
      const numA = parseInt(matchA[1]);
      const numB = parseInt(matchB[1]);
      return numA - numB;
    });
  
  const ext = files.length > 0 && files[0].endsWith('.webp') ? 'webp' : 'jpg';

  console.log(`Found ${files.length} images to split...`);

  // Check if ImageMagick is available
  try {
    execSync('which magick || which convert', { stdio: 'ignore' });
  } catch (e) {
    console.error('❌ ImageMagick not found. Please install it:');
    console.error('   brew install imagemagick  # Mac');
    console.error('   sudo apt install imagemagick  # Linux');
    process.exit(1);
  }

  const convertCmd = execSync('which magick', { encoding: 'utf8' }).trim() ? 'magick' : 'convert';
  
  // Find the highest existing page number
  const existingPages = fs.readdirSync(inputDir)
    .filter(f => f.match(/^page-(\d+)\.(jpg|webp)$/))
    .map(f => parseInt(f.match(/^page-(\d+)\./)[1]))
    .filter(n => !isNaN(n));
  
  const maxPageNum = existingPages.length > 0 ? Math.max(...existingPages) : 1;
  let newPageNum = maxPageNum + 1;
  
  console.log(`Starting from page ${newPageNum} (highest existing: ${maxPageNum})`);

  files.forEach((file, index) => {
    const inputPath = path.join(inputDir, file);
    
    // Get image dimensions
    const identifyOutput = execSync(
      `${convertCmd} identify "${inputPath}"`,
      { encoding: 'utf8' }
    );
    
    const dimensions = identifyOutput.match(/(\d+)x(\d+)/);
    if (!dimensions) {
      console.error(`Could not read dimensions for ${file}`);
      return;
    }
    
    const width = parseInt(dimensions[1]);
    const height = parseInt(dimensions[2]);
    
    console.log(`Splitting ${file} (${width}x${height}) into two pages...`);
    
    // Split into left and right pages
    const leftPage = path.join(inputDir, `page-${newPageNum}.${ext}`);
    const rightPage = path.join(inputDir, `page-${newPageNum + 1}.${ext}`);
    
    // Calculate half width
    const halfWidth = Math.floor(width / 2);
    const rightWidth = width - halfWidth;
    const rightStart = halfWidth;
    
    // Extract left half (left page)
    execSync(
      `${convertCmd} "${inputPath}" -crop ${halfWidth}x${height}+0+0 +repage "${leftPage}"`
    );
    
    // Extract right half (right page)
    execSync(
      `${convertCmd} "${inputPath}" -crop ${rightWidth}x${height}+${rightStart}+0 +repage "${rightPage}"`
    );
    
    newPageNum += 2;
    console.log(`  → Created page-${newPageNum - 2}.${ext} and page-${newPageNum - 1}.${ext}`);
    
    // Remove temp file
    fs.unlinkSync(inputPath);
  });

  console.log(`\n✅ Done! Created ${newPageNum - 2} individual page images (starting from page 2).`);
  console.log(`\nUpdate books.json with pageCount: ${newPageNum - 2}`);
}

// Get command line arguments
const args = process.argv.slice(2);
if (args.length < 1) {
  console.log(`
Usage: node scripts/split-all-pages.js <input-dir>

Example:
  node scripts/split-all-pages.js ./public/books/my-magazine
  `);
  process.exit(1);
}

splitAllPages(args[0]);

