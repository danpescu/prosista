// Script pentru descărcarea imaginilor hero de pe prosista.com
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

const heroImages = [
  {
    url: 'https://www.prosista.com/u/i/slide/slide-01.webp',
    path: 'public/images/hero/hero-1.jpg'
  },
  {
    url: 'https://www.prosista.com/u/i/slide/slide-02.webp',
    path: 'public/images/hero/hero-2.jpg'
  },
  {
    url: 'https://www.prosista.com/u/i/slide/slide-03.webp',
    path: 'public/images/hero/hero-3.jpg'
  },
];

ensureDir(path.join(__dirname, '..', 'public/images/hero'));

async function downloadAll() {
  console.log(`\n📥 Descărcare imagini hero de pe prosista.com...\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const img of heroImages) {
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
}

downloadAll().catch(console.error);

