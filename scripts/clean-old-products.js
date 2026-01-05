// Script pentru ștergere pagini vechi de produse
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productsDir = path.join(__dirname, '..', 'src', 'pages', 'produse');

function deleteOldProductPages(dir) {
  let deleted = 0;
  
  if (!fs.existsSync(dir)) {
    console.log('Directorul nu există:', dir);
    return deleted;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      deleted += deleteOldProductPages(fullPath);
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
      console.log(`✓ Șters: ${path.relative(productsDir, fullPath)}`);
      deleted++;
    }
  }
  
  return deleted;
}

console.log('Șterg paginile vechi de produse...\n');
const deleted = deleteOldProductPages(productsDir);
console.log(`\n✓ Șterse ${deleted} pagini.`);

