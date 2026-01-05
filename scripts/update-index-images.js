import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapare categorii -> imagini
const categoryImages = {
  'panouri-lana-lemn': '/images/products/panouri-lana-lemn.jpg',
  'panouri-lana-minerala': '/images/products/panouri-lana-minerala.jpg',
  'panouri-acustice-tapisate': '/images/products/panouri-acustice-tapisate.jpg',
  'tavane-metalice': '/images/products/tavane-metalice.jpg',
  'tavane-lemn': '/images/products/tavane-lemn.jpg',
  'sisteme-purtatoare': '/images/products/sisteme-purtatoare.jpg',
  'panouri-gips-vinil': '/images/products/gips-vinil.jpg',
  'profile-gips-carton': '/images/products/profile-gips.jpg',
  'baffle-linear': '/images/products/tavane-metalice.jpg',
  'open-cell': '/images/products/tavane-metalice.jpg',
  'mesh-expandat': '/images/products/tavane-metalice.jpg',
  'tip-caseta': '/images/products/tavane-metalice.jpg',
  'plank-linear': '/images/products/tavane-metalice.jpg',
};

// Lista paginilor index de actualizat
const indexPages = [
  { file: 'panouri-lana-lemn/index.astro', category: 'panouri-lana-lemn' },
  { file: 'panouri-lana-minerala/index.astro', category: 'panouri-lana-minerala' },
  { file: 'panouri-acustice-tapisate/index.astro', category: 'panouri-acustice-tapisate' },
  { file: 'tavane-lemn/index.astro', category: 'tavane-lemn' },
  { file: 'sisteme-purtatoare/index.astro', category: 'sisteme-purtatoare' },
  { file: 'panouri-gips-vinil/index.astro', category: 'panouri-gips-vinil' },
  { file: 'profile-gips-carton/index.astro', category: 'profile-gips-carton' },
  { file: 'tavane-metalice/baffle-linear/index.astro', category: 'baffle-linear' },
  { file: 'tavane-metalice/open-cell/index.astro', category: 'open-cell' },
  { file: 'tavane-metalice/mesh-expandat/index.astro', category: 'mesh-expandat' },
  { file: 'tavane-metalice/tip-caseta/index.astro', category: 'tip-caseta' },
  { file: 'tavane-metalice/plank-linear/index.astro', category: 'plank-linear' },
];

function updateIndexPage(filePath, category) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const categoryImage = categoryImages[category] || '/images/products/tavane-metalice.jpg';
  
  // Înlocuiește placeholder-urile în ProductCard
  const placeholderPattern = /image="https:\/\/placehold\.co\/[^"]+"/g;
  content = content.replace(placeholderPattern, `image="${categoryImage}"`);
  
  // Pentru paginile cu template literal
  const templatePattern = /image=\{`https:\/\/placehold\.co\/[^`]+`\}/g;
  content = content.replace(templatePattern, `image="${categoryImage}"`);
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ Updated: ${filePath}`);
}

const pagesDir = path.join(__dirname, '..', 'src', 'pages', 'produse');

console.log('🔄 Actualizare imagini pagini index...\n');

indexPages.forEach(({ file, category }) => {
  const filePath = path.join(pagesDir, file);
  if (fs.existsSync(filePath)) {
    updateIndexPage(filePath, category);
  } else {
    console.log(`⚠️  File not found: ${filePath}`);
  }
});

console.log('\n✅ Actualizare completă!');




