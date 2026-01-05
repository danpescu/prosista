// Script pentru ștergerea tuturor produselor și reimport din prosista_catalog_v2_RO_FIXED.json
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

// Funcție pentru generare slug din text
function generateSlug(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[®©™]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Funcție pentru generare ID unic
function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

// Funcție pentru ștergere pagini vechi de produse
function deleteOldProductPages() {
  console.log('\n🗑️  Șterg paginile vechi de produse...\n');
  
  const productsDir = path.join(__dirname, '..', 'src', 'pages', 'produse');
  let deleted = 0;
  
  if (!fs.existsSync(productsDir)) {
    console.log('  Directorul nu există:', productsDir);
    return deleted;
  }
  
  function deleteRecursive(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        deleteRecursive(fullPath);
        try {
          const remaining = fs.readdirSync(fullPath);
          if (remaining.length === 0) {
            fs.rmdirSync(fullPath);
          }
        } catch (e) {
          // Ignoră erori
        }
      } else if (entry.isFile() && entry.name.endsWith('.astro') && entry.name !== 'index.astro') {
        fs.unlinkSync(fullPath);
        console.log(`  ✓ Șters: ${path.relative(productsDir, fullPath)}`);
        deleted++;
      }
    }
  }
  
  deleteRecursive(productsDir);
  console.log(`\n✓ Șterse ${deleted} pagini de produse.\n`);
  return deleted;
}

// Funcție pentru ștergere pagini vechi de categorii
function deleteOldCategoryPages() {
  console.log('\n🗑️  Șterg paginile vechi de categorii...\n');
  
  const categoriesDir = path.join(__dirname, '..', 'src', 'pages', 'categorii');
  let deleted = 0;
  
  if (!fs.existsSync(categoriesDir)) {
    console.log('  Directorul nu există:', categoriesDir);
    return deleted;
  }
  
  const entries = fs.readdirSync(categoriesDir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(categoriesDir, entry.name);
    
    if (entry.isDirectory()) {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`  ✓ Șters director: ${entry.name}`);
      deleted++;
    } else if (entry.isFile() && entry.name.endsWith('.astro') && entry.name !== 'index.astro') {
      fs.unlinkSync(fullPath);
      console.log(`  ✓ Șters: ${entry.name}`);
      deleted++;
    }
  }
  
  console.log(`\n✓ Șterse ${deleted} pagini/directoare de categorii.\n`);
  return deleted;
}

// Funcție pentru ștergere products.json existent
function deleteOldProductsJSON() {
  console.log('\n🗑️  Șterg products.json existent...\n');
  
  const productsJsonPath = path.join(__dirname, '..', 'src', 'data', 'products.json');
  
  if (fs.existsSync(productsJsonPath)) {
    // Creează backup înainte de ștergere
    const backupPath = path.join(__dirname, '..', 'src', 'data', 'products.json.backup');
    fs.copyFileSync(productsJsonPath, backupPath);
    console.log(`  ✓ Backup creat: ${backupPath}`);
    
    // Șterge fișierul
    fs.unlinkSync(productsJsonPath);
    console.log(`  ✓ Șters: products.json`);
  } else {
    console.log('  Fișierul nu există, nu e nevoie de ștergere.');
  }
  
  console.log('');
}

// Funcție pentru conversie catalog v2 la formatul așteptat
function convertCatalogV2ToProductsFormat() {
  console.log('\n📋 Convertesc prosista_catalog_v2_RO_FIXED.json la formatul așteptat...\n');
  
  const sourcePath = path.join(__dirname, '..', 'prosista_catalog_v2_RO_FIXED.json');
  const targetPath = path.join(__dirname, '..', 'prosista_products.json');
  
  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ Fișierul sursă nu există: ${sourcePath}`);
    process.exit(1);
  }
  
  const sourceData = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'));
  const { arbore_categorii, produse } = sourceData;
  
  // Creează map pentru categorii (nume -> ID)
  const categoryMap = new Map();
  const categories = [];
  const categoryIdMap = new Map(); // nume_ro -> id
  
  // Map pentru a converti nume RO la ID-uri EN așteptate de fix-category-structure.js
  const categoryNameToIdMap = {
    'Sisteme de tavane metalice': 'metal-ceiling-systems',
    'Tavan și perete din lemn': 'wooden-ceiling-and-wall-systems',
    'Panouri acustice acoperite cu stofa': 'fabric-covered-acoustic-panels',
    'Panouri din vata minerala': 'mineral-wool-panels',
    'Panouri din vata de lemn': 'wood-wool-panels',
    'Sisteme de transport': 'carrier-systems',
    'Panou din gips acoperit cu vinil': 'vinyl-coated-gypsum-panel',
    'Profiluri panouri din gips': 'gypsum-panel-profiles',
    'Deflectoare / Tavan liniar': 'baffle-linear-ceiling',
    'Tavan cu celule deschise': 'open-cell-ceiling',
    'Plafon din plasă extinsă': 'expanded-mesh-ceiling',
    'Tavan tip casetă': 'cassette-type-ceiling',
    'Plafon liniar din scândură': 'linear-plank-ceiling',
    'Knauf AMF': 'knauf-amf',
    'Saga Ecophon': 'ecophon-saga',
    'Knauf Heradesign': 'knauf-heradesign'
  };
  
  // Funcție pentru a extrage slug din URL
  function extractSlugFromUrl(url) {
    if (!url) return null;
    const match = url.match(/\/category\/([^\/\s]+)/);
    return match ? match[1] : null;
  }
  
  // Procesează categorii principale
  for (const cat of arbore_categorii) {
    // Încearcă să extragă slug din URL, altfel folosește map-ul, altfel generează
    const categoryId = extractSlugFromUrl(cat.url) || 
                       categoryNameToIdMap[cat.nume_ro] || 
                       generateSlug(cat.nume_en);
    const categoryData = {
      id: categoryId,
      name_ro: cat.nume_ro,
      name_en: cat.nume_en,
      slug_ro: generateSlug(cat.nume_ro),
      slug_en: generateSlug(cat.nume_en),
      parent_id: null,
      meta_title_ro: `${cat.nume_ro} – PROSISTA`,
      meta_description_ro: `${cat.nume_ro} - PROSISTA`
    };
    
    categories.push(categoryData);
    categoryMap.set(cat.nume_ro, categoryData);
    categoryIdMap.set(cat.nume_ro, categoryId);
    
    // Procesează subcategorii
    for (const subcat of cat.subcategorii || []) {
      const subcategoryId = extractSlugFromUrl(subcat.url) || 
                               categoryNameToIdMap[subcat.nume_ro] || 
                               generateSlug(subcat.nume_en);
      const subcategoryData = {
        id: subcategoryId,
        name_ro: subcat.nume_ro,
        name_en: subcat.nume_en,
        slug_ro: generateSlug(subcat.nume_ro),
        slug_en: generateSlug(subcat.nume_en),
        parent_id: categoryId,
        meta_title_ro: `${subcat.nume_ro} – PROSISTA`,
        meta_description_ro: `${subcat.nume_ro} - PROSISTA`
      };
      
      categories.push(subcategoryData);
      categoryMap.set(subcat.nume_ro, subcategoryData);
      categoryIdMap.set(subcat.nume_ro, subcategoryId);
    }
  }
  
  console.log(`✓ Procesate ${categories.length} categorii (${arbore_categorii.length} principale + subcategorii)`);
  
  // Procesează produse
  const products = [];
  
  for (const prod of produse) {
    const productId = generateId();
    const productSlug = generateSlug(prod.nume_ro);
    
    // Găsește ID-urile categoriilor
    const categoryIds = [];
    if (prod.subcategorie_ro) {
      const subcatId = categoryIdMap.get(prod.subcategorie_ro);
      if (subcatId) categoryIds.push(subcatId);
    }
    if (prod.categorie_ro) {
      const catId = categoryIdMap.get(prod.categorie_ro);
      if (catId && !categoryIds.includes(catId)) categoryIds.push(catId);
    }
    
    // Extrage PDF-uri
    const pdfs = (prod.documente_pdf || [])
      .map(doc => doc.url)
      .filter(url => url && !url.includes('katalog.pdf'));
    
    // Procesează descrierea
    let fullDescriptionRo = '';
    if (prod.descriere_ro) {
      // Convertește textul simplu în paragrafe HTML
      const paragraphs = prod.descriere_ro.split('\n\n').filter(p => p.trim());
      fullDescriptionRo = paragraphs.map(p => `<p>${p.trim()}</p>`).join('\n');
    }
    
    const productData = {
      id: productId,
      name_ro: prod.nume_ro,
      name_en: prod.nume_en,
      slug_ro: productSlug,
      slug_en: generateSlug(prod.nume_en),
      full_description_ro: fullDescriptionRo,
      full_description_en: prod.descriere_en || '',
      images: prod.galerie_imagini || [],
      main_image: prod.imagine_principala || (prod.galerie_imagini && prod.galerie_imagini[0]) || '',
      pdfs: pdfs,
      categories: categoryIds,
      meta_title_ro: `${prod.nume_ro} – PROSISTA`,
      meta_description_ro: `${prod.nume_ro} - PROSISTA`
    };
    
    products.push(productData);
  }
  
  console.log(`✓ Procesate ${products.length} produse\n`);
  
  // Salvează în formatul așteptat
  const outputData = {
    categories,
    products
  };
  
  fs.writeFileSync(targetPath, JSON.stringify(outputData, null, 2), 'utf-8');
  console.log(`✓ Salvat prosista_products.json (${categories.length} categorii, ${products.length} produse)\n`);
  
  return { categories, products };
}

// Funcție pentru rulare script
async function runScript(scriptName, description) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📋 ${description}`);
  console.log(`${'='.repeat(60)}\n`);
  
  try {
    const scriptPath = path.join(__dirname, scriptName);
    const { stdout, stderr } = await execAsync(`node "${scriptPath}"`, {
      cwd: path.join(__dirname, '..'),
      encoding: 'utf-8'
    });
    
    if (stdout) console.log(stdout);
    if (stderr && !stderr.includes('DeprecationWarning')) console.error(stderr);
    
    console.log(`\n✓ ${description} - COMPLET\n`);
    return true;
  } catch (error) {
    console.error(`\n❌ Eroare la ${description}:`);
    console.error(error.message);
    if (error.stdout) console.error(error.stdout);
    if (error.stderr && !error.stderr.includes('DeprecationWarning')) console.error(error.stderr);
    return false;
  }
}

// Funcție principală
async function runFullImport() {
  console.log('\n🚀 IMPORT COMPLET - Ștergere produse și reimport din prosista_catalog_v2_RO_FIXED.json\n');
  console.log('='.repeat(60));
  
  // 1. Șterge paginile vechi și datele existente
  console.log('\n📌 PASUL 1: Ștergere pagini și date existente\n');
  deleteOldProductPages();
  deleteOldCategoryPages();
  deleteOldProductsJSON();
  
  // 2. Convertește catalog v2 la formatul așteptat
  console.log('\n📌 PASUL 2: Conversie format JSON\n');
  convertCatalogV2ToProductsFormat();
  
  // 3. Rulează scripturile de import în ordine
  const scripts = [
    {
      name: 'update-products-from-json.js',
      description: 'Procesare JSON și structurare date'
    },
    {
      name: 'fix-category-structure.js',
      description: 'Fixare structură categorii (8 categorii principale)'
    },
    {
      name: 'download-all-product-images.js',
      description: 'Descărcare imagini produse și categorii'
    },
    {
      name: 'update-products-json.js',
      description: 'Actualizare src/data/products.json'
    },
    {
      name: 'generate-category-pages.js',
      description: 'Generare pagini categorii'
    },
    {
      name: 'generate-subcategory-pages.js',
      description: 'Generare pagini subcategorii'
    },
    {
      name: 'generate-product-pages-from-json.js',
      description: 'Generare pagini produse'
    }
  ];
  
  for (const script of scripts) {
    const success = await runScript(script.name, script.description);
    
    if (!success) {
      console.error(`\n❌ Procesarea s-a oprit din cauza erorii la: ${script.description}`);
      console.error('   Verifică erorile de mai sus și încearcă din nou.\n');
      process.exit(1);
    }
    
    // Pauză mică între scripturi
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('✅ IMPORT COMPLET FINALIZAT!');
  console.log(`${'='.repeat(60)}\n`);
  console.log('Toate produsele au fost importate cu succes:');
  console.log('  ✓ Pagini vechi șterse');
  console.log('  ✓ JSON convertit și procesat');
  console.log('  ✓ Imagini descărcate local');
  console.log('  ✓ products.json actualizat');
  console.log('  ✓ Pagini categorii generate');
  console.log('  ✓ Pagini produse generate');
  console.log('\n');
}

// Rulează importul complet
runFullImport().catch(error => {
  console.error('Eroare fatală:', error);
  process.exit(1);
});
