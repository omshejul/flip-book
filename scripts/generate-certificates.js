// scripts/generate-certificates.js
// Generates certificates.json from PDF files in public/certificates
// Run this script before building: node scripts/generate-certificates.js

const fs = require('fs');
const path = require('path');

function generateCertificatesList() {
  const certificatesDir = path.join(process.cwd(), 'public', 'certificates');
  const outputFile = path.join(process.cwd(), 'public', 'certificates.json');

  if (!fs.existsSync(certificatesDir)) {
    console.error('❌ Certificates directory not found:', certificatesDir);
    process.exit(1);
  }

  const files = fs.readdirSync(certificatesDir)
    .filter(file => file.toLowerCase().endsWith('.pdf'))
    .map(file => {
      const filePath = path.join(certificatesDir, file);
      const stats = fs.statSync(filePath);
      return {
        filename: file,
        name: file.replace('.pdf', ''),
        path: `/certificates/${file}`,
        size: stats.size,
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
}

generateCertificatesList();

