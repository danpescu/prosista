// Script pentru procesare JSON în batch-uri mici (pentru a evita rate limiting)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Folosește scriptul principal dar cu limitare de batch
const mainScript = path.join(__dirname, 'update-products-from-json.js');

// Citește argumentele din linia de comandă
const args = process.argv.slice(2);
const batchSize = parseInt(args[0]) || 10; // Default: 10 produse per batch
const batchNumber = parseInt(args[1]) || 1; // Default: batch 1

console.log(`\n📦 Procesare în batch-uri:`);
console.log(`   Batch size: ${batchSize} produse`);
console.log(`   Batch number: ${batchNumber}`);
console.log(`\n💡 Pentru a procesa următorul batch, rulează:`);
console.log(`   node scripts/update-products-from-json-batch.js ${batchSize} ${batchNumber + 1}\n`);

// Importă și rulează funcția principală din scriptul principal
import(`./update-products-from-json.js?batchSize=${batchSize}&batchNumber=${batchNumber}`).catch(() => {
  // Dacă importul direct nu funcționează, sugerează alternativă
  console.log('\n💡 Alternativă: Rulează scriptul principal și oprește-l manual după fiecare batch:');
  console.log('   node scripts/update-products-from-json.js');
  console.log('   (Apasă Ctrl+C după fiecare batch și continuă mai târziu)\n');
});

