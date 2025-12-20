// Script pentru descărcarea imaginilor produselor de pe prosista.com
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✓ ${path.basename(filepath)}`);
          resolve();
        });
      } else {
        file.close();
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      reject(err);
    });
  });
}

// Structura pentru imagini produse bazată pe prosista.com
// Notă: Aceste URL-uri sunt probabile și trebuie verificate manual
const productImages = [
  // Panouri Lână Lemn
  {
    url: 'https://www.prosista.com/u/i/kategoriler/heradesign-ahsap-yunu.jpg',
    path: 'public/images/products-detail/panouri-lana-lemn/knauf-heradesign-1.jpg'
  },
  
  // Sisteme Purtătoare - folosim imaginea categoriei
  {
    url: 'https://www.prosista.com/u/i/kategoriler/tasiyici-sistemler.jpg',
    path: 'public/images/products-detail/sisteme-purtatoare/sistem-purtator-t24-1.jpg'
  },
];

// Crează directoarele necesare
const dirs = [
  'public/images/products-detail/panouri-lana-lemn',
  'public/images/products-detail/sisteme-purtatoare',
];

dirs.forEach(dir => {
  ensureDir(path.join(__dirname, '..', dir));
});

async function downloadAll() {
  console.log(`\n📥 Descărcare imagini produse de pe prosista.com...\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const img of productImages) {
    const fullPath = path.join(__dirname, '..', img.path);
    
    try {
      await downloadImage(img.url, fullPath);
      successCount++;
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (err) {
      failCount++;
      console.error(`✗ Eșuat: ${path.basename(img.path)}`);
    }
  }
  
  console.log(`\n✅ Descărcare completă!`);
  console.log(`   Succes: ${successCount}`);
  console.log(`   Eșuat: ${failCount}`);
  console.log(`\n📝 Notă: Pentru imagini produse individuale:`);
  console.log(`   1. Navighează pe prosista.com/en/products/...`);
  console.log(`   2. Deschide DevTools (F12) → Network tab`);
  console.log(`   3. Filtrează după "image"`);
  console.log(`   4. Copiază URL-urile imaginilor`);
  console.log(`   5. Actualizează array-ul productImages în acest script`);
}

downloadAll().catch(console.error);

