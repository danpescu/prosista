// Script master pentru import complet: șterge pagini vechi și rulează toate procesările
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

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
        // Șterge directorul dacă e gol (după ștergerea fișierelor)
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
      // Șterge directorul întreg (categorii)
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
  console.log('\n🚀 IMPORT COMPLET - Ștergere pagini vechi și procesare produse\n');
  console.log('='.repeat(60));
  
  // 1. Șterge paginile vechi și datele existente
  console.log('\n📌 PASUL 1: Ștergere pagini și date existente\n');
  deleteOldProductPages();
  deleteOldCategoryPages();
  deleteOldProductsJSON();
  
  // 2. Rulează scripturile în ordine
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
  console.log('  ✓ JSON procesat');
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

