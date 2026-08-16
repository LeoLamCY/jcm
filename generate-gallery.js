// Run with: node generate-gallery.js
// Scans images/gallery/ and writes images/gallery/manifest.json

const fs = require('fs');
const path = require('path');

const galleryDir = path.join(__dirname, 'images', 'gallery');
const manifestPath = path.join(galleryDir, 'manifest.json');
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

const files = fs.readdirSync(galleryDir)
    .filter(f => imageExtensions.has(path.extname(f).toLowerCase()))
    .sort();

fs.writeFileSync(manifestPath, JSON.stringify(files, null, 2));
console.log(`manifest.json written with ${files.length} image(s).`);
