import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✓ Downloaded: ${filepath}`);
          resolve();
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirects
        file.close();
        fs.unlinkSync(filepath);
        downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
      } else {
        file.close();
        fs.unlinkSync(filepath);
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
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

// Create directory if it doesn't exist
const dir = path.join(__dirname, '../public/images');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Try to download world map from prosista.com
const worldMapUrls = [
  'https://www.prosista.com/u/i/world-map.jpg',
  'https://www.prosista.com/u/i/harita.jpg',
  'https://www.prosista.com/u/i/map.jpg',
  'https://www.prosista.com/u/i/about/world-map.jpg',
];

async function downloadWorldMap() {
  const filepath = path.join(dir, 'world-map.jpg');
  
  for (const url of worldMapUrls) {
    try {
      console.log(`Trying to download from: ${url}`);
      await downloadImage(url, filepath);
      console.log(`\n✓ World map downloaded successfully!`);
      return;
    } catch (error) {
      console.log(`✗ Failed: ${error.message}`);
    }
  }
  
  console.log('\n⚠ Could not download world map from prosista.com');
  console.log('Please manually download the world map image and save it as: public/images/world-map.jpg');
}

downloadWorldMap().catch(console.error);

