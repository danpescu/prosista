import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapare produse -> imagini categorii (fallback)
const categoryImages = {
  'panouri-lana-lemn': '/images/products/panouri-lana-lemn.jpg',
  'panouri-lana-minerala': '/images/products/panouri-lana-minerala.jpg',
  'panouri-acustice-tapisate': '/images/products/panouri-acustice-tapisate.jpg',
  'tavane-metalice': '/images/products/tavane-metalice.jpg',
  'tavane-lemn': '/images/products/tavane-lemn.jpg',
  'sisteme-purtatoare': '/images/products/sisteme-purtatoare.jpg',
  'panouri-gips-vinil': '/images/products/gips-vinil.jpg',
  'profile-gips-carton': '/images/products/profile-gips.jpg',
};

// Mapare produse -> imagini specifice existente
const productImageMap = {
  'knauf-heradesign': {
    category: 'panouri-lana-lemn',
    images: [
      '/images/products-detail/panouri-lana-lemn/knauf-heradesign-1.jpg',
      '/images/products/panouri-lana-lemn.jpg',
      '/images/products/panouri-lana-lemn.jpg',
    ]
  },
  'ecophon-saga': {
    category: 'panouri-lana-lemn',
    images: [
      '/images/products/panouri-lana-lemn.jpg',
      '/images/products/panouri-lana-lemn.jpg',
    ]
  },
  'sistem-purtator-t24': {
    category: 'sisteme-purtatoare',
    images: [
      '/images/products-detail/sisteme-purtatoare/sistem-purtator-t24-1.jpg',
      '/images/products/sisteme-purtatoare.jpg',
    ]
  },
};

// Funcție pentru a obține imagini pentru un produs
function getProductImages(productSlug, categorySlug) {
  // Verifică dacă există imagini specifice
  if (productImageMap[productSlug]) {
    return productImageMap[productSlug].images;
  }
  
  // Folosește imaginea categoriei ca fallback
  const categoryImage = categoryImages[categorySlug] || '/images/products/tavane-metalice.jpg';
  return [categoryImage, categoryImage, categoryImage];
}

// Funcție pentru a actualiza o pagină
function updateProductPage(filePath, productSlug, categorySlug) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const images = getProductImages(productSlug, categorySlug);
  
  // Înlocuiește placeholder-urile
  const placeholderPattern = /https:\/\/placehold\.co\/[^\]]+/g;
  const imagePattern = /const productImages = \[([^\]]+)\];/s;
  
  if (imagePattern.test(content)) {
    const imageArray = images.map(img => `  "${img}"`).join(',\n');
    content = content.replace(imagePattern, `const productImages = [\n${imageArray},\n];`);
  }
  
  // Actualizează și în relatedProducts
  const relatedPattern = /image: "https:\/\/placehold\.co\/[^"]+"/g;
  content = content.replace(relatedPattern, (match) => {
    // Extrage numele produsului din placeholder
    const nameMatch = match.match(/text=([^&"]+)/);
    if (nameMatch) {
      const relatedProductName = nameMatch[1].replace(/\+/g, ' ').toLowerCase();
      // Folosește imaginea categoriei pentru produsele înrudite
      return `image: "${categoryImages[categorySlug] || '/images/products/tavane-metalice.jpg'}"`;
    }
    return match;
  });
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ Updated: ${filePath}`);
}

// Lista tuturor paginilor de produse
const productPages = [
  // Panouri Lână Lemn
  { file: 'panouri-lana-lemn/knauf-heradesign.astro', slug: 'knauf-heradesign', category: 'panouri-lana-lemn' },
  { file: 'panouri-lana-lemn/ecophon-saga.astro', slug: 'ecophon-saga', category: 'panouri-lana-lemn' },
  
  // Panouri Lână Minerală
  { file: 'panouri-lana-minerala/eurocoustic.astro', slug: 'eurocoustic', category: 'panouri-lana-minerala' },
  { file: 'panouri-lana-minerala/ecophon.astro', slug: 'ecophon', category: 'panouri-lana-minerala' },
  { file: 'panouri-lana-minerala/knauf-amf.astro', slug: 'knauf-amf', category: 'panouri-lana-minerala' },
  
  // Panouri Acustice Tapițate
  { file: 'panouri-acustice-tapisate/panouri-tavan-lana-sticla.astro', slug: 'panouri-tavan-lana-sticla', category: 'panouri-acustice-tapisate' },
  { file: 'panouri-acustice-tapisate/panouri-perete-lana-sticla.astro', slug: 'panouri-perete-lana-sticla', category: 'panouri-acustice-tapisate' },
  { file: 'panouri-acustice-tapisate/canopy-acustic-lana-sticla.astro', slug: 'canopy-acustic-lana-sticla', category: 'panouri-acustice-tapisate' },
  { file: 'panouri-acustice-tapisate/baffle-acustic-lana-sticla.astro', slug: 'baffle-acustic-lana-sticla', category: 'panouri-acustice-tapisate' },
  
  // Tavane Lemn
  { file: 'tavane-lemn/perete-acustic-lemn.astro', slug: 'perete-acustic-lemn', category: 'tavane-lemn' },
  { file: 'tavane-lemn/tavan-acustic-lemn.astro', slug: 'tavan-acustic-lemn', category: 'tavane-lemn' },
  { file: 'tavane-lemn/baffle-lemn.astro', slug: 'baffle-lemn', category: 'tavane-lemn' },
  
  // Tavane Metalice - Baffle/Linear
  { file: 'tavane-metalice/baffle-linear/tavan-baffle.astro', slug: 'tavan-baffle', category: 'tavane-metalice' },
  { file: 'tavane-metalice/baffle-linear/tavan-baffle-extrudat.astro', slug: 'tavan-baffle-extrudat', category: 'tavane-metalice' },
  { file: 'tavane-metalice/baffle-linear/tavan-baffle-vectoral.astro', slug: 'tavan-baffle-vectoral', category: 'tavane-metalice' },
  { file: 'tavane-metalice/baffle-linear/baffle-perete.astro', slug: 'baffle-perete', category: 'tavane-metalice' },
  { file: 'tavane-metalice/baffle-linear/tavan-multipanel.astro', slug: 'tavan-multipanel', category: 'tavane-metalice' },
  { file: 'tavane-metalice/baffle-linear/tavan-linear-f.astro', slug: 'tavan-linear-f', category: 'tavane-metalice' },
  
  // Tavane Metalice - Open Cell
  { file: 'tavane-metalice/open-cell/tavan-open-cell-autoportant.astro', slug: 'tavan-open-cell-autoportant', category: 'tavane-metalice' },
  { file: 'tavane-metalice/open-cell/tavan-open-cell-t15.astro', slug: 'tavan-open-cell-t15', category: 'tavane-metalice' },
  { file: 'tavane-metalice/open-cell/tavan-open-cell-piramidal.astro', slug: 'tavan-open-cell-piramidal', category: 'tavane-metalice' },
  { file: 'tavane-metalice/open-cell/tavan-open-cell-lamina.astro', slug: 'tavan-open-cell-lamina', category: 'tavane-metalice' },
  
  // Tavane Metalice - Mesh
  { file: 'tavane-metalice/mesh-expandat/tavan-mesh-lay-in.astro', slug: 'tavan-mesh-lay-in', category: 'tavane-metalice' },
  { file: 'tavane-metalice/mesh-expandat/tavan-mesh-lay-on.astro', slug: 'tavan-mesh-lay-on', category: 'tavane-metalice' },
  { file: 'tavane-metalice/mesh-expandat/tavan-mesh-hook-on.astro', slug: 'tavan-mesh-hook-on', category: 'tavane-metalice' },
  
  // Tavane Metalice - Tip Casetă
  { file: 'tavane-metalice/tip-caseta/tavan-suspendat-lay-in.astro', slug: 'tavan-suspendat-lay-in', category: 'tavane-metalice' },
  { file: 'tavane-metalice/tip-caseta/tavan-suspendat-lay-on.astro', slug: 'tavan-suspendat-lay-on', category: 'tavane-metalice' },
  { file: 'tavane-metalice/tip-caseta/tavan-suspendat-clip-in.astro', slug: 'tavan-suspendat-clip-in', category: 'tavane-metalice' },
  
  // Tavane Metalice - Plank Linear
  { file: 'tavane-metalice/plank-linear/tavan-coridor-hook-on.astro', slug: 'tavan-coridor-hook-on', category: 'tavane-metalice' },
  { file: 'tavane-metalice/plank-linear/tavan-suspendat-hook-on.astro', slug: 'tavan-suspendat-hook-on', category: 'tavane-metalice' },
  
  // Sisteme Purtătoare
  { file: 'sisteme-purtatoare/sistem-purtator-t24.astro', slug: 'sistem-purtator-t24', category: 'sisteme-purtatoare' },
  { file: 'sisteme-purtatoare/sistem-purtator-t15.astro', slug: 'sistem-purtator-t15', category: 'sisteme-purtatoare' },
  { file: 'sisteme-purtatoare/sistem-purtator-canal-t15.astro', slug: 'sistem-purtator-canal-t15', category: 'sisteme-purtatoare' },
  
  // Panouri Gips Vinil
  { file: 'panouri-gips-vinil/panou-acustic-vinil.astro', slug: 'panou-acustic-vinil', category: 'panouri-gips-vinil' },
  { file: 'panouri-gips-vinil/panou-gips-vinil.astro', slug: 'panou-gips-vinil', category: 'panouri-gips-vinil' },
  
  // Profile Gips-Carton
  { file: 'profile-gips-carton/profile-gips-carton.astro', slug: 'profile-gips-carton', category: 'profile-gips-carton' },
];

// Actualizează toate paginile
const pagesDir = path.join(__dirname, '..', 'src', 'pages', 'produse');

console.log('🔄 Actualizare imagini produse...\n');

productPages.forEach(({ file, slug, category }) => {
  const filePath = path.join(pagesDir, file);
  if (fs.existsSync(filePath)) {
    updateProductPage(filePath, slug, category);
  } else {
    console.log(`⚠️  File not found: ${filePath}`);
  }
});

console.log('\n✅ Actualizare completă!');

