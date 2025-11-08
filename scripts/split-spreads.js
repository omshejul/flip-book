// scripts/split-spreads.js
// Splits spread images (2 pages side by side) into individual page images
// Usage: node scripts/split-spreads.js <input-dir>

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function splitSpreads(inputDir) {
  const files = fs.readdirSync(inputDir)
    .filter(f => f.startsWith('page-') && (f.endsWith('.jpg') || f.endsWith('.webp')))
    .sort((a, b) => {
      const numA = parseInt(a.match(/page-(\d+)\.(jpg|webp)/)[1]);
      const numB = parseInt(b.match(/page-(\d+)\.(jpg|webp)/)[1]);
      return numA - numB;
    });
  
  const ext = files.length > 0 && files[0].endsWith('.webp') ? 'webp' : 'jpg';

  console.log(`Found ${files.length} images to process...`);

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
  const tempDir = path.join(inputDir, 'temp');
  
  // Create temp directory
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // Move original files to temp
  files.forEach(file => {
    fs.renameSync(
      path.join(inputDir, file),
      path.join(tempDir, file)
    );
  });

  let newPageNum = 1;

  files.forEach((file, index) => {
    const inputPath = path.join(tempDir, file);
    
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
    const aspectRatio = width / height;
    
    // If width is roughly 2x height (or wider), it's likely a spread
    // Portrait single page: ~0.75 aspect ratio
    // Landscape spread: ~1.5+ aspect ratio
    if (aspectRatio > 1.2) {
      console.log(`Splitting spread: ${file} (${width}x${height}, ratio: ${aspectRatio.toFixed(2)})`);
      
      // Split into left and right pages
      const leftPage = path.join(inputDir, `page-${newPageNum}.${ext}`);
      const rightPage = path.join(inputDir, `page-${newPageNum + 1}.${ext}`);
      
      // Extract left half
      execSync(
        `${convertCmd} "${inputPath}" -crop 50%x100%+0+0 "${leftPage}"`
      );
      
      // Extract right half
      execSync(
        `${convertCmd} "${inputPath}" -crop 50%x100%+50%+0 "${rightPage}"`
      );
      
      newPageNum += 2;
      console.log(`  → Created page-${newPageNum - 2}.${ext} and page-${newPageNum - 1}.${ext}`);
    } else {
      // Single page, just rename
      const newPath = path.join(inputDir, `page-${newPageNum}.${ext}`);
      fs.copyFileSync(inputPath, newPath);
      console.log(`Single page: ${file} → page-${newPageNum}.${ext}`);
      newPageNum += 1;
    }
  });

  // Clean up temp directory
  fs.rmSync(tempDir, { recursive: true, force: true });
  
  const totalPages = newPageNum - 1;
  console.log(`\n✅ Done! Created ${totalPages} individual page images.`);
  console.log(`\nUpdate books.json with pageCount: ${totalPages}`);
}

// Get command line arguments
const args = process.argv.slice(2);
if (args.length < 1) {
  console.log(`
Usage: node scripts/split-spreads.js <input-dir>

Example:
  node scripts/split-spreads.js ./public/books/my-magazine
  `);
  process.exit(1);
}

splitSpreads(args[0]);

