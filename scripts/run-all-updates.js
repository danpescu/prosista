// Script master pentru rulare toate actualizările în ordine
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

async function runScript(scriptName, description) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📋 ${description}`);
  console.log(`${'='.repeat(60)}\n`);
  
  try {
    const { stdout, stderr } = await execAsync(`node ${scriptName}`, {
      cwd: __dirname,
      encoding: 'utf-8'
    });
    
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    
    console.log(`\n✓ ${description} - COMPLET\n`);
    return true;
  } catch (error) {
    console.error(`\n❌ Eroare la ${description}:`);
    console.error(error.message);
    if (error.stdout) console.error(error.stdout);
    if (error.stderr) console.error(error.stderr);
    return false;
  }
}

async function runAll() {
  console.log('\n🚀 Încep procesarea completă a produselor...\n');
  
  const scripts = [
    {
      name: 'update-products-from-json.js',
      description: 'Procesare JSON și traducere automată'
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
  console.log('✅ PROCESARE COMPLETĂ!');
  console.log(`${'='.repeat(60)}\n`);
  console.log('Toate produsele au fost actualizate cu succes:');
  console.log('  ✓ JSON procesat și tradus');
  console.log('  ✓ Imagini descărcate local');
  console.log('  ✓ products.json actualizat');
  console.log('  ✓ Pagini categorii generate');
  console.log('  ✓ Pagini produse generate');
  console.log('\n');
}

runAll().catch(error => {
  console.error('Eroare fatală:', error);
  process.exit(1);
});

