// Script pentru crearea structurii de directoare pentru imagini placeholder
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const directories = [
  'public/images',
  'public/images/hero',
  'public/images/products',
  'public/images/products-detail',
  'public/images/products-detail/baffle',
  'public/images/products-detail/open-cell',
  'public/images/products-detail/mesh',
  'public/images/products-detail/tip-caseta',
  'public/images/products-detail/plank-linear',
  'public/images/references',
  'public/images/about',
];

// Create directories
directories.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✓ Created directory: ${dir}`);
  } else {
    console.log(`- Directory already exists: ${dir}`);
  }
});

// Create placeholder image files (empty files as placeholders)
const placeholderFiles = [
  'public/images/logo.png',
  'public/images/logo-white.png',
  'public/images/og-image.jpg',
  'public/images/hero/hero-bg.jpg',
  'public/images/products/tavane-metalice.jpg',
  'public/images/products/tavane-lemn.jpg',
  'public/images/products/panouri-acustice-tapisate.jpg',
  'public/images/products/panouri-lana-minerala.jpg',
  'public/images/products/panouri-lana-lemn.jpg',
  'public/images/products/sisteme-purtatoare.jpg',
  'public/images/products/gips-vinil.jpg',
  'public/images/products/profile-gips.jpg',
  'public/images/references/velux-residence.jpg',
  'public/images/references/antalya-airport.jpg',
  'public/images/references/izmir-hospital.jpg',
  'public/images/references/yumurtalik-power.jpg',
  'public/images/references/yasar-university.jpg',
  'public/images/references/turkey-petroleum.jpg',
];

placeholderFiles.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  if (!fs.existsSync(fullPath)) {
    // Create empty file as placeholder
    fs.writeFileSync(fullPath, '');
    console.log(`✓ Created placeholder: ${file}`);
  } else {
    console.log(`- File already exists: ${file}`);
  }
});

console.log('\n✓ Placeholder image structure created!');
console.log('\nNote: Replace placeholder images with real images from prosista.com or client.');

