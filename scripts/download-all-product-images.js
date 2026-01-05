// Script pentru descărcare toate imaginile produselor și categoriilor local
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Funcție pentru creare directoare
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✓ Creat director: ${dirPath}`);
  }
}

// Funcție pentru descărcare imagine
function downloadImage(url, filepath, retries = 3) {
  return new Promise((resolve, reject) => {
    // Skip dacă fișierul există deja
    if (fs.existsSync(filepath)) {
      console.log(`- Skip (există): ${path.basename(filepath)}`);
      resolve();
      return;
    }
    
    const protocol = url.startsWith('https') ? https : http;
    
    const file = fs.createWriteStream(filepath);
    
    const request = protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✓ Descărcat: ${path.basename(filepath)}`);
          resolve();
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        fs.unlinkSync(filepath);
        // Retry cu URL-ul nou
        downloadImage(response.headers.location, filepath, retries).then(resolve).catch(reject);
      } else {
        file.close();
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
        if (retries > 0) {
          console.log(`⚠ Retry pentru ${path.basename(filepath)} (${response.statusCode})...`);
          setTimeout(() => {
            downloadImage(url, filepath, retries - 1).then(resolve).catch(reject);
          }, 2000);
        } else {
          reject(new Error(`HTTP ${response.statusCode} pentru ${url}`));
        }
      }
    });
    
    request.on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      if (retries > 0) {
        console.log(`⚠ Retry pentru ${path.basename(filepath)} (${err.message})...`);
        setTimeout(() => {
          downloadImage(url, filepath, retries - 1).then(resolve).catch(reject);
        }, 2000);
      } else {
        reject(err);
      }
    });
    
    request.setTimeout(30000, () => {
      request.destroy();
      file.close();
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      if (retries > 0) {
        console.log(`⚠ Timeout, retry pentru ${path.basename(filepath)}...`);
        setTimeout(() => {
          downloadImage(url, filepath, retries - 1).then(resolve).catch(reject);
        }, 2000);
      } else {
        reject(new Error(`Timeout pentru ${url}`));
      }
    });
  });
}

// Funcție pentru extragere nume fișier din URL
function getFilenameFromUrl(url, defaultName = 'image.jpg') {
  try {
    const urlPath = new URL(url).pathname;
    const filename = path.basename(urlPath);
    return filename || defaultName;
  } catch {
    return defaultName;
  }
}

// Funcție principală
async function downloadAllImages() {
  console.log('\nÎncep descărcarea imaginilor...\n');
  
  // Citește JSON procesat
  const processedPath = path.join(__dirname, '..', 'prosista_products_processed.json');
  
  if (!fs.existsSync(processedPath)) {
    console.error('❌ Fișierul prosista_products_processed.json nu există!');
    console.error('   Rulează mai întâi: node scripts/update-products-from-json.js');
    process.exit(1);
  }
  
  const data = JSON.parse(fs.readFileSync(processedPath, 'utf-8'));
  const { categories, products } = data;
  
  // Creează directoarele necesare
  const publicImagesDir = path.join(__dirname, '..', 'public', 'images');
  const productsDir = path.join(publicImagesDir, 'products');
  const productsDetailDir = path.join(publicImagesDir, 'products-detail');
  
  ensureDir(publicImagesDir);
  ensureDir(productsDir);
  ensureDir(productsDetailDir);
  
  // Descarcă imagini categorii
  console.log('\n📁 Descărcare imagini categorii...');
  const categoryImages = new Set();
  
  for (const category of categories) {
    // Încearcă să găsească o imagine pentru categorie din produsele sale
    const categoryProducts = products.filter(p => 
      p.categories && p.categories.includes(category.id)
    );
    
    if (categoryProducts.length > 0 && categoryProducts[0].main_image) {
      const imageUrl = categoryProducts[0].main_image;
      const filename = `${category.slug}.jpg`;
      const filepath = path.join(productsDir, filename);
      
      categoryImages.add({ url: imageUrl, filepath, category: category.slug });
    }
  }
  
  // Descarcă imagini categorii
  for (const { url, filepath, category } of categoryImages) {
    try {
      await downloadImage(url, filepath);
      await new Promise(resolve => setTimeout(resolve, 500)); // Pauză între descărcări
    } catch (error) {
      console.error(`❌ Eroare la descărcare imagine categorie ${category}: ${error.message}`);
    }
  }
  
  // Descarcă imagini produse
  console.log('\n📁 Descărcare imagini produse...');
  const productImages = [];
  
  // Citește products.json pentru a găsi categoria principală corectă
  const productsJsonPath = path.join(__dirname, '..', 'src', 'data', 'products.json');
  let productsJson = null;
  if (fs.existsSync(productsJsonPath)) {
    productsJson = JSON.parse(fs.readFileSync(productsJsonPath, 'utf-8'));
  }
  
  // Funcție helper pentru a găsi categoria principală a unui produs
  function findMainCategoryForProduct(productSlug, productId) {
    if (!productsJson) return null;
    
    for (const category of productsJson.categories) {
      // Verifică produsele directe din categorie
      if (category.products && category.products.some(p => p.id === productId || p.slug === productSlug)) {
        return { slug: category.slug, id: category.id };
      }
      // Verifică produsele din subcategorii
      if (category.subcategories) {
        for (const subcategory of category.subcategories) {
          if (subcategory.products && subcategory.products.some(p => p.id === productId || p.slug === productSlug)) {
            return { slug: category.slug, id: category.id };
          }
        }
      }
    }
    return null;
  }
  
  for (const product of products) {
    // Folosește images sau main_image dacă images este gol
    let imagesToDownload = [];
    if (product.images && product.images.length > 0) {
      imagesToDownload = product.images;
    } else if (product.main_image) {
      // Dacă nu are images, folosește main_image
      imagesToDownload = [product.main_image];
    } else {
      // Skip dacă nu are nici images nici main_image
      continue;
    }
    
    // Găsește categoria principală - încearcă mai întâi din products.json
    let mainCategory = findMainCategoryForProduct(product.slug, product.id);
    
    // Dacă nu găsește în products.json, încearcă din categories
    if (!mainCategory && product.categories && product.categories.length > 0) {
      const foundCategory = categories.find(c => c.id === product.categories[0]);
      if (foundCategory) {
        mainCategory = { slug: foundCategory.slug, id: foundCategory.id };
      }
    }
    
    if (!mainCategory) {
      console.warn(`⚠ Nu s-a găsit categorie pentru produs: ${product.name} (${product.slug})`);
      continue;
    }
    
    const categoryDetailDir = path.join(productsDetailDir, mainCategory.slug);
    ensureDir(categoryDetailDir);
    
    // Descarcă toate imaginile produsului
    for (let i = 0; i < imagesToDownload.length; i++) {
      const imageUrl = imagesToDownload[i];
      const extension = path.extname(getFilenameFromUrl(imageUrl)) || '.jpg';
      const filename = `${product.slug}-${i + 1}${extension}`;
      const filepath = path.join(categoryDetailDir, filename);
      
      productImages.push({ url: imageUrl, filepath, product: product.slug });
    }
  }
  
  // Descarcă imagini produse (cu limitare pentru a evita rate limiting)
  let downloaded = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const { url, filepath, product } of productImages) {
    try {
      await downloadImage(url, filepath);
      downloaded++;
      await new Promise(resolve => setTimeout(resolve, 500)); // Pauză între descărcări
    } catch (error) {
      if (error.message.includes('există')) {
        skipped++;
      } else {
        errors++;
        console.error(`❌ Eroare la descărcare imagine produs ${product}: ${error.message}`);
      }
    }
  }
  
  console.log(`\n✓ Descărcare completă!`);
  console.log(`  - Descărcate: ${downloaded}`);
  console.log(`  - Skip (există): ${skipped}`);
  console.log(`  - Erori: ${errors}`);
  console.log(`  - Total procesate: ${productImages.length}`);
}

// Rulează descărcarea
downloadAllImages().catch(error => {
  console.error('Eroare:', error);
  process.exit(1);
});

