// Script pentru descărcarea imaginilor de pe prosista.com
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Funcție pentru crearea directoarelor
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✓ Created directory: ${dirPath}`);
  }
}

// Funcție pentru descărcarea unei imagini
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const file = fs.createWriteStream(filepath);
    
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✓ Downloaded: ${path.basename(filepath)}`);
          resolve();
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirects
        file.close();
        fs.unlinkSync(filepath);
        downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
      } else {
        file.close();
        fs.unlinkSync(filepath);
        console.error(`✗ Failed: ${url} (Status: ${response.statusCode})`);
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      console.error(`✗ Error downloading ${url}: ${err.message}`);
      reject(err);
    });
  });
}

// Lista imaginilor de descărcat
const images = [
  // Logo-uri
  {
    url: 'https://www.prosista.com/u/i/logo-en-white.png',
    path: 'public/images/logo-white.png'
  },
  {
    url: 'https://www.prosista.com/u/i/logo-en-footer.png',
    path: 'public/images/logo.png'
  },
  
  // Hero
  {
    url: 'https://www.prosista.com/u/i/slide/slide-01.webp',
    path: 'public/images/hero/hero-bg.jpg'
  },
  
  // Categorii produse (8 imagini)
  {
    url: 'https://www.prosista.com/u/i/kategoriler/metal-asma-tavanlar.jpg',
    path: 'public/images/products/tavane-metalice.jpg'
  },
  {
    url: 'https://www.prosista.com/u/i/kategoriler/ahsap-tavan-ve-duvar-sistemleri.jpg',
    path: 'public/images/products/tavane-lemn.jpg'
  },
  {
    url: 'https://www.prosista.com/u/i/kategoriler/kumas-kapli-akustik-sistemler.jpg',
    path: 'public/images/products/panouri-acustice-tapisate.jpg'
  },
  {
    url: 'https://www.prosista.com/u/i/kategoriler/tasyunu.jpeg',
    path: 'public/images/products/panouri-lana-minerala.jpg'
  },
  {
    url: 'https://www.prosista.com/u/i/kategoriler/heradesign-ahsap-yunu.jpg',
    path: 'public/images/products/panouri-lana-lemn.jpg'
  },
  {
    url: 'https://www.prosista.com/u/i/kategoriler/tasiyici-sistemler.jpg',
    path: 'public/images/products/sisteme-purtatoare.jpg'
  },
  {
    url: 'https://www.prosista.com/u/i/kategoriler/alci-levha-sistemleri.jpeg',
    path: 'public/images/products/gips-vinil.jpg'
  },
  {
    url: 'https://www.prosista.com/u/i/kategoriler/alci-levha-profilleri.jpg',
    path: 'public/images/products/profile-gips.jpg'
  },
];

// Crează directoarele necesare
const dirs = [
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
];

dirs.forEach(dir => {
  ensureDir(path.join(__dirname, '..', dir));
});

// Funcție pentru descărcarea tuturor imaginilor
async function downloadAll() {
  console.log(`\nStarting download of ${images.length} images from prosista.com...\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const img of images) {
    const fullPath = path.join(__dirname, '..', img.path);
    
    try {
      await downloadImage(img.url, fullPath);
      successCount++;
      // Delay pentru a nu suprasolicita serverul
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      failCount++;
      console.error(`Failed to download ${img.url}`);
    }
  }
  
  console.log(`\n✓ Download complete!`);
  console.log(`  Success: ${successCount}`);
  console.log(`  Failed: ${failCount}`);
  console.log(`\nNote: Pentru imagini produse individuale, navighează pe paginile produselor de pe prosista.com`);
}

// Rulează scriptul
downloadAll().catch(console.error);

