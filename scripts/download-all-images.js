// Script complet pentru descărcarea tuturor imaginilor de pe prosista.com
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
  }
}

// Funcție pentru descărcarea unei imagini
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const file = fs.createWriteStream(filepath);
    
    protocol.get(url, {
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
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
        downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
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

// Lista completă de imagini
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
  
  // Referințe (6 imagini)
  {
    url: 'https://www.prosista.com/u/i/referanslar/velux-residence.jpg',
    path: 'public/images/references/velux-residence.jpg'
  },
  {
    url: 'https://www.prosista.com/u/i/g/antalya-havalimani-duty-free-1png.jpg',
    path: 'public/images/references/antalya-airport.jpg'
  },
  {
    url: 'https://www.prosista.com/u/i/referanslar/izmir-metropol-hastanesi-1.jpg',
    path: 'public/images/references/izmir-hospital.jpg'
  },
  {
    url: 'https://www.prosista.com/u/i/referanslar/yumurtalik-termik-santral-binasi-1.jpg',
    path: 'public/images/references/yumurtalik-power.jpg'
  },
  {
    url: 'https://www.prosista.com/u/i/referanslar/yasar-universitesi-1.jpg',
    path: 'public/images/references/yasar-university.jpg'
  },
  {
    url: 'https://www.prosista.com/u/i/referanslar/turkiye-petrolleri-genel-mudurlugu-egrisel-baffle.jpg',
    path: 'public/images/references/turkey-petroleum.jpg'
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
  console.log(`\n📥 Descărcare imagini de pe prosista.com...\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const img of images) {
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
  console.log(`   4. Copiază URL-urile imaginilor și adaugă-le în script`);
}

// Rulează scriptul
downloadAll().catch(console.error);

