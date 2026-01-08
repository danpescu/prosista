// Script pentru descărcarea imaginilor suplimentare de referințe de pe prosista.com
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
        // Don't reject for 404, just log
        if (response.statusCode === 404) {
          console.log(`✗ Nu există: ${path.basename(filepath)} (404)`);
          resolve(); // Continue even if image doesn't exist
        } else {
          reject(new Error(`HTTP ${response.statusCode}`));
        }
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      console.log(`✗ Eroare: ${path.basename(filepath)} - ${err.message}`);
      resolve(); // Continue even on error
    });
  });
}

// Lista de imagini suplimentare de referințe
// Acestea sunt imagini care ar putea exista pe site-ul englez
const referenceImages = [
  // Velux Residence
  {
    url: 'https://www.prosista.com/u/i/referanslar/velux-residence-2.jpg',
    path: 'public/images/references/velux-residence-2.jpg'
  },
  {
    url: 'https://www.prosista.com/u/i/referanslar/velux-residence-4.jpg',
    path: 'public/images/references/velux-residence-4.jpg'
  },
  // Antalya Airport
  {
    url: 'https://www.prosista.com/u/i/referanslar/antalya-havalimani-2.jpg',
    path: 'public/images/references/antalya-airport-2.jpg'
  },
  {
    url: 'https://www.prosista.com/u/i/referanslar/antalya-havalimani-3.jpg',
    path: 'public/images/references/antalya-airport-3.jpg'
  },
  // Izmir Hospital
  {
    url: 'https://www.prosista.com/u/i/referanslar/izmir-metropol-hastanesi-2.jpg',
    path: 'public/images/references/izmir-hospital-2.jpg'
  },
  {
    url: 'https://www.prosista.com/u/i/referanslar/izmir-metropol-hastanesi-3.jpg',
    path: 'public/images/references/izmir-hospital-3.jpg'
  },
  // Yumurtalik Power
  {
    url: 'https://www.prosista.com/u/i/referanslar/yumurtalik-termik-santral-binasi-2.jpg',
    path: 'public/images/references/yumurtalik-power-2.jpg'
  },
  {
    url: 'https://www.prosista.com/u/i/referanslar/yumurtalik-termik-santral-binasi-3.jpg',
    path: 'public/images/references/yumurtalik-power-3.jpg'
  },
  // Yasar University
  {
    url: 'https://www.prosista.com/u/i/referanslar/yasar-universitesi-2.jpg',
    path: 'public/images/references/yasar-university-2.jpg'
  },
  {
    url: 'https://www.prosista.com/u/i/referanslar/yasar-universitesi-3.jpg',
    path: 'public/images/references/yasar-university-3.jpg'
  },
  // Turkey Petroleum
  {
    url: 'https://www.prosista.com/u/i/referanslar/turkiye-petrolleri-2.jpg',
    path: 'public/images/references/turkey-petroleum-2.jpg'
  },
  {
    url: 'https://www.prosista.com/u/i/referanslar/turkiye-petrolleri-3.jpg',
    path: 'public/images/references/turkey-petroleum-3.jpg'
  },
];

// Crează directoarele necesare
const dirs = [
  'public/images/references',
];

dirs.forEach(dir => {
  ensureDir(path.join(__dirname, '..', dir));
});

// Funcție pentru descărcarea tuturor imaginilor
async function downloadAll() {
  console.log(`\n📥 Descărcare imagini suplimentare de referințe de pe prosista.com...\n`);
  
  let successCount = 0;
  let failCount = 0;
  let notFoundCount = 0;
  
  for (const img of referenceImages) {
    const fullPath = path.join(__dirname, '..', img.path);
    
    // Skip if already exists
    if (fs.existsSync(fullPath)) {
      console.log(`⊘ Deja există: ${path.basename(img.path)}`);
      continue;
    }
    
    try {
      await downloadImage(img.url, fullPath);
      successCount++;
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (err) {
      failCount++;
      console.error(`✗ Eșuat: ${path.basename(img.path)} - ${err.message}`);
    }
  }
  
  console.log(`\n✅ Descărcare completă!`);
  console.log(`   Succes: ${successCount}`);
  console.log(`   Eșuat: ${failCount}`);
  console.log(`\n📝 Notă: Unele imagini pot să nu existe pe server.`);
  console.log(`   Paginile vor funcționa cu imaginile existente.`);
}

// Rulează scriptul
downloadAll().catch(console.error);
