// Script pentru descărcarea imaginilor produselor individuale de pe prosista.com
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
        file.close();
        fs.unlinkSync(filepath);
        downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
      } else {
        file.close();
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      reject(err);
    });
  });
}

// Structura produselor și URL-urile probabile pentru imagini
// Bazat pe structura prosista.com
const productImages = [
  // Baffle/Linear products
  {
    url: 'https://www.prosista.com/u/i/urunler/baffle-tavan/baffle-tavan-01.jpg',
    path: 'public/images/products-detail/baffle/tavan-baffle-1.jpg'
  },
  {
    url: 'https://www.prosista.com/u/i/urunler/baffle-tavan/baffle-tavan-02.jpg',
    path: 'public/images/products-detail/baffle/tavan-baffle-2.jpg'
  },
  {
    url: 'https://www.prosista.com/u/i/urunler/baffle-tavan/baffle-tavan-03.jpg',
    path: 'public/images/products-detail/baffle/tavan-baffle-3.jpg'
  },
  
  // Open Cell products
  {
    url: 'https://www.prosista.com/u/i/urunler/open-cell/open-cell-01.jpg',
    path: 'public/images/products-detail/open-cell/tavan-open-cell-autoportant-1.jpg'
  },
  
  // Mesh products
  {
    url: 'https://www.prosista.com/u/i/urunler/mesh/mesh-01.jpg',
    path: 'public/images/products-detail/mesh/tavan-mesh-lay-in-1.jpg'
  },
];

// Crează directoarele necesare
const dirs = [
  'public/images/products-detail/baffle',
  'public/images/products-detail/open-cell',
  'public/images/products-detail/mesh',
  'public/images/products-detail/tip-caseta',
  'public/images/products-detail/plank-linear',
];

dirs.forEach(dir => {
  ensureDir(path.join(__dirname, '..', dir));
});

// Funcție pentru descărcarea tuturor imaginilor
async function downloadAll() {
  console.log(`\nStarting download of product images from prosista.com...\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const img of productImages) {
    const fullPath = path.join(__dirname, '..', img.path);
    
    try {
      await downloadImage(img.url, fullPath);
      successCount++;
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      failCount++;
      // Nu afișăm eroarea pentru fiecare încercare eșuată
    }
  }
  
  console.log(`\n✓ Download complete!`);
  console.log(`  Success: ${successCount}`);
  console.log(`  Failed: ${failCount}`);
  console.log(`\nNote: Multe imagini produse pot fi găsite direct pe prosista.com`);
  console.log(`      Navighează pe paginile produselor și verifică URL-urile imaginilor în DevTools`);
}

// Rulează scriptul
downloadAll().catch(console.error);

