// Script pentru generare pagini subcategorii
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const subcategoryTemplate = `---
import Layout from '@/layouts/Layout.astro';
import Container from '@/components/ui/Container.astro';
import Section from '@/components/ui/Section.astro';
import CategoryHero from '@/components/product/CategoryHero.astro';
import SubcategorySidebar from '@/components/product/SubcategorySidebar.astro';
import ProductCard from '@/components/product/ProductCard.astro';
import productsData from '@/data/products.json';
import { readFileSync } from 'fs';
import { join } from 'path';

const products = productsData;
const category = products.categories.find(cat => cat.slug === '{CATEGORY_SLUG}');
const subcategory = category?.subcategories?.find(sub => sub.slug === '{SUBCATEGORY_SLUG}');
const allSubcategories = category?.subcategories || [];

// Load processed products for images
let allProducts = [];
try {
  const processedData = JSON.parse(readFileSync(join(process.cwd(), 'prosista_products_processed.json'), 'utf-8'));
  allProducts = processedData.products || [];
} catch (e) {
  console.warn('Could not load processed products:', e.message);
}
---
<Layout 
  title="{SUBCATEGORY_NAME}"
  description="{SUBCATEGORY_NAME} - {CATEGORY_NAME}"
>
  <!-- Hero Section -->
  <CategoryHero 
    title={subcategory?.name || '{SUBCATEGORY_NAME}'}
    breadcrumbs={[
      { name: 'Acasă', href: '/' },
      { name: '{CATEGORY_NAME}', href: '/categorii/{CATEGORY_SLUG}' },
      { name: '{SUBCATEGORY_NAME}' }
    ]}
    backgroundImage={category?.image}
    categorySlug="{CATEGORY_SLUG}"
  />
  
  <!-- Main Content -->
  <Section padding="lg" class="py-12">
    <div class="w-full lg:w-[1320px] mx-auto px-5 lg:px-0">
      <div class="flex flex-col lg:flex-row" style="gap: 24px;">
        <!-- Sidebar -->
        <SubcategorySidebar 
          currentSubcategoryId="{SUBCATEGORY_ID}"
          subcategories={allSubcategories.map(sub => ({
            id: sub.id,
            name: sub.name,
            slug: sub.slug
          }))}
          categorySlug="{CATEGORY_SLUG}"
        />
        
        <!-- Main Content Grid -->
        <div class="w-full lg:w-[896px] flex-shrink-0">
          {subcategory?.products && subcategory.products.length > 0 ? (
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {subcategory.products.map(product => {
                const productData = allProducts.find(p => p.id === product.id);
                let productImage = category?.image || '{CATEGORY_IMAGE}';
                if (productData?.main_image) {
                  // Extrage extensia din URL sau folosește .jpg ca default
                  const urlMatch = productData.main_image.match(/\\.(jpg|jpeg|png|webp)(\\?|$)/i);
                  const ext = urlMatch ? \`.\${urlMatch[1].toLowerCase()}\` : '.jpg';
                  productImage = \`/images/products-detail/{CATEGORY_SLUG}/\${product.slug}-1\${ext}\`;
                }
                return (
                <ProductCard
                  name={product.name}
                  description={\`Detalii despre \${product.name}\`}
                  image={productImage}
                  href={\`/produse/{CATEGORY_SLUG}/{SUBCATEGORY_SLUG}/\${product.slug}\`}
                  categorySlug="{CATEGORY_SLUG}"
                />
              )})}
            </div>
          ) : (
            <div class="text-center py-12">
              <p class="text-secondary-600">Nu există produse în această subcategorie.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  </Section>
</Layout>
`;

function generateSubcategoryPages() {
  console.log('Generez pagini subcategorii...\n');
  
  // Citește products.json
  const productsJsonPath = path.join(__dirname, '..', 'src', 'data', 'products.json');
  
  if (!fs.existsSync(productsJsonPath)) {
    console.error('❌ Fișierul src/data/products.json nu există!');
    process.exit(1);
  }
  
  const productsData = JSON.parse(fs.readFileSync(productsJsonPath, 'utf-8'));
  const { categories } = productsData;
  
  // Citește produsele procesate pentru imagini
  const processedPath = path.join(__dirname, '..', 'prosista_products_processed.json');
  let processedProducts = [];
  if (fs.existsSync(processedPath)) {
    const processedData = JSON.parse(fs.readFileSync(processedPath, 'utf-8'));
    processedProducts = processedData.products || [];
  }
  
  // Director pentru pagini produse
  const productsDir = path.join(__dirname, '..', 'src', 'pages', 'produse');
  ensureDir(productsDir);
  
  let generated = 0;
  let updated = 0;
  
  for (const category of categories) {
    if (!category.subcategories || category.subcategories.length === 0) {
      continue;
    }
    
    for (const subcategory of category.subcategories) {
      // Creează directorul pentru subcategorie
      const subcategoryDir = path.join(productsDir, category.slug, subcategory.slug);
      ensureDir(subcategoryDir);
      
      // Creează fișierul index.astro pentru subcategorie
      const indexPath = path.join(subcategoryDir, 'index.astro');
      
      // Generează conținut
      let content = subcategoryTemplate
        .replace(/{CATEGORY_SLUG}/g, category.slug)
        .replace(/{CATEGORY_NAME}/g, category.name)
        .replace(/{SUBCATEGORY_SLUG}/g, subcategory.slug)
        .replace(/{SUBCATEGORY_NAME}/g, subcategory.name)
        .replace(/{SUBCATEGORY_ID}/g, subcategory.id)
        .replace(/{CATEGORY_IMAGE}/g, category.image || `/images/products/${category.slug}.jpg`)
        .replace(/{PROCESSED_PRODUCTS_DATA}/g, JSON.stringify(processedProducts));
      
      const exists = fs.existsSync(indexPath);
      
      fs.writeFileSync(indexPath, content, 'utf-8');
      
      if (exists) {
        updated++;
        console.log(`✓ Actualizat: ${category.slug}/${subcategory.slug}/index.astro`);
      } else {
        generated++;
        console.log(`✓ Creat: ${category.slug}/${subcategory.slug}/index.astro`);
      }
    }
  }
  
  console.log(`\n✓ Generare completă!`);
  console.log(`  - Pagini create: ${generated}`);
  console.log(`  - Pagini actualizate: ${updated}`);
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

generateSubcategoryPages();

