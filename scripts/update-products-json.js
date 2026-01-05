// Script pentru actualizare src/data/products.json cu structura nouă
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function updateProductsJSON() {
  console.log('Actualizez src/data/products.json...\n');
  
  // Citește JSON procesat
  const processedPath = path.join(__dirname, '..', 'prosista_products_processed.json');
  
  if (!fs.existsSync(processedPath)) {
    console.error('❌ Fișierul prosista_products_processed.json nu există!');
    console.error('   Rulează mai întâi: node scripts/update-products-from-json.js');
    process.exit(1);
  }
  
  const data = JSON.parse(fs.readFileSync(processedPath, 'utf-8'));
  const { structure } = data;
  
  // Creează backup
  const productsJsonPath = path.join(__dirname, '..', 'src', 'data', 'products.json');
  if (fs.existsSync(productsJsonPath)) {
    const backupPath = path.join(__dirname, '..', 'src', 'data', 'products.json.backup');
    fs.copyFileSync(productsJsonPath, backupPath);
    console.log(`✓ Backup creat: ${backupPath}`);
  }
  
  // Generează descrieri și meta SEO pentru categorii (dacă nu există)
  for (const category of structure.categories) {
    if (!category.description) {
      // Generează descriere bazată pe nume și produse
      const productCount = category.products.length + 
        category.subcategories.reduce((sum, sub) => sum + sub.products.length, 0);
      
      category.description = `${category.name} - ${productCount > 0 
        ? `Soluții profesionale pentru ${category.name.toLowerCase()}.` 
        : 'Gama completă de produse.'}`;
    }
    
    // Asigură că imaginea există
    if (!category.image) {
      category.image = `/images/products/${category.slug}.jpg`;
    }
    
    // Asigură că meta SEO există
    if (!category.meta_title) {
      category.meta_title = `${category.name} – PROSISTA`;
    }
    if (!category.meta_description) {
      category.meta_description = `${category.name} PROSISTA pentru proiecte comerciale si publice. Solutii durabile, estetice si conforme cerintelor arhitecturale moderne.`;
    }
  }
  
  // Salvează products.json
  fs.writeFileSync(
    productsJsonPath,
    JSON.stringify(structure, null, 2),
    'utf-8'
  );
  
  console.log(`✓ products.json actualizat: ${productsJsonPath}`);
  console.log(`  - Categorii: ${structure.categories.length}`);
  console.log(`  - Total produse: ${structure.categories.reduce((sum, cat) => 
    sum + cat.products.length + cat.subcategories.reduce((s, sub) => s + sub.products.length, 0), 0
  )}`);
}

updateProductsJSON();

