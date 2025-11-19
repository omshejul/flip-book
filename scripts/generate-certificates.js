// scripts/generate-certificates.js
// Generates certificates.json from PDF files in public/certificates
// Also generates thumbnails for each PDF
// Run this script before building: node scripts/generate-certificates.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function checkImageMagick() {
  try {
    execSync('which magick', { stdio: 'ignore' });
    return true;
  } catch {
    try {
      execSync('which convert', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }
}

function generateThumbnail(pdfPath, thumbnailPath) {
  let magickCmd = 'convert';
  try {
    const magickPath = execSync('which magick', { encoding: 'utf8', stdio: 'pipe' }).trim();
    if (magickPath) magickCmd = 'magick';
  } catch {
    try {
      const convertPath = execSync('which convert', { encoding: 'utf8', stdio: 'pipe' }).trim();
      if (convertPath) magickCmd = 'convert';
    } catch {
      return false;
    }
  }
  
  try {
    // Generate thumbnail: first page, 400px width, quality 85
    execSync(
      `${magickCmd} -density 250 "${pdfPath}[0]" -resize 800x -quality 95 "${thumbnailPath}"`,
      { stdio: 'ignore' }
    );
    return true;
  } catch (error) {
    console.error(`Failed to generate thumbnail for ${pdfPath}:`, error.message);
    return false;
  }
}

function generateCertificatesList() {
  const certificatesDir = path.join(process.cwd(), 'public', 'certificates');
  const thumbnailsDir = path.join(certificatesDir, 'thumbnails');
  const outputFile = path.join(process.cwd(), 'public', 'certificates.json');

  if (!fs.existsSync(certificatesDir)) {
    console.error('❌ Certificates directory not found:', certificatesDir);
    process.exit(1);
  }

  // Check if ImageMagick is available
  const hasImageMagick = checkImageMagick();
  if (!hasImageMagick) {
    console.warn('⚠️  ImageMagick not found. Thumbnails will not be generated.');
    console.warn('   Install with: brew install imagemagick (Mac) or sudo apt install imagemagick (Linux)');
  }

  // Create thumbnails directory
  if (hasImageMagick && !fs.existsSync(thumbnailsDir)) {
    fs.mkdirSync(thumbnailsDir, { recursive: true });
  }

  const files = fs.readdirSync(certificatesDir)
    .filter(file => file.toLowerCase().endsWith('.pdf'))
    .map(file => {
      const filePath = path.join(certificatesDir, file);
      const stats = fs.statSync(filePath);
      const thumbnailName = file.replace('.pdf', '.webp');
      const thumbnailPath = path.join(thumbnailsDir, thumbnailName);
      const thumbnailUrl = `/certificates/thumbnails/${thumbnailName}`;

      // Generate thumbnail if ImageMagick is available and thumbnail doesn't exist
      if (hasImageMagick) {
        if (!fs.existsSync(thumbnailPath)) {
          console.log(`📸 Generating thumbnail for ${file}...`);
          generateThumbnail(filePath, thumbnailPath);
        }
      }

      return {
        filename: file,
        name: file.replace('.pdf', ''),
        path: `/certificates/${file}`,
        size: stats.size,
        thumbnail: hasImageMagick && fs.existsSync(thumbnailPath) ? thumbnailUrl : null,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const certificates = {
    generatedAt: new Date().toISOString(),
    count: files.length,
    certificates: files,
  };

  // Ensure data directory exists
  const dataDir = path.dirname(outputFile);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(outputFile, JSON.stringify(certificates, null, 2));
  console.log(`✅ Generated certificates.json with ${files.length} certificates`);
  console.log(`   Output: ${outputFile}`);
  if (hasImageMagick) {
    const thumbnailCount = files.filter(f => f.thumbnail).length;
    console.log(`   Generated ${thumbnailCount} thumbnail${thumbnailCount !== 1 ? 's' : ''}`);
  }
}

generateCertificatesList();
