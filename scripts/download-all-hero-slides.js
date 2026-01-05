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
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✅ Descărcat: ${path.basename(filepath)}`);
          resolve();
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        // Redirect
        file.close();
        fs.unlinkSync(filepath);
        downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
      } else {
        file.close();
        fs.unlinkSync(filepath);
        reject(new Error(`Eroare ${response.statusCode}: ${url}`));
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
  {
    url: 'https://www.prosista.com/u/i/slide/slide-04.webp',
    path: 'public/images/hero/hero-4.jpg'
  },
  {
    url: 'https://www.prosista.com/u/i/slide/slide-05.webp',
    path: 'public/images/hero/hero-5.jpg'
  },
  {
    url: 'https://www.prosista.com/u/i/slide/slide-06.webp',
    path: 'public/images/hero/hero-6.jpg'
  },
];

ensureDir(path.join(__dirname, '..', 'public/images/hero'));

async function downloadAll() {
  console.log(`\n📥 Descărcare ${heroImages.length} imagini hero de pe prosista.com...\n`);
  
  for (const img of heroImages) {
    const filepath = path.join(__dirname, '..', img.path);
    try {
      await downloadImage(img.url, filepath);
    } catch (error) {
      console.error(`❌ Eroare la descărcare ${img.path}:`, error.message);
    }
  }
  
  console.log(`\n✅ Descărcare completă!\n`);
}

downloadAll();




