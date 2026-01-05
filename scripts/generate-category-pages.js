// Script pentru generare pagini categorii folosind template-ul aprobat
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const categoryTemplate = `---
import Layout from '@/layouts/Layout.astro';
import Container from '@/components/ui/Container.astro';
import Section from '@/components/ui/Section.astro';
import CategoryHero from '@/components/product/CategoryHero.astro';
import CategorySidebar from '@/components/product/CategorySidebar.astro';
import ProductCard from '@/components/product/ProductCard.astro';
import productsData from '@/data/products.json';
import { readFileSync } from 'fs';
import { join } from 'path';

const products = productsData;
const category = products.categories.find(cat => cat.id === '{CATEGORY_ID}');
const allCategories = products.categories.map(cat => ({
  id: cat.id,
  name: cat.name,
  slug: cat.slug
}));

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
  title={category?.meta_title || "{CATEGORY_NAME}"}
  description={category?.meta_description || "{CATEGORY_DESCRIPTION}"}
>
  <!-- Hero Section -->
  <CategoryHero 
    title={category?.name || '{CATEGORY_NAME}'}
    breadcrumbs={[
      { name: 'Acasă', href: '/' },
      { name: '{CATEGORY_NAME}' }
    ]}
    backgroundImage={category?.image}
  />
  
  <!-- Main Content -->
  <Section padding="lg" class="py-12">
    <div class="w-full lg:w-[1320px] mx-auto px-5 lg:px-0">
      <div class="flex flex-col lg:flex-row" style="gap: 24px;">
        <!-- Sidebar -->
        <CategorySidebar 
          currentCategoryId="{CATEGORY_ID}"
          allCategories={allCategories}
        />
        
        <!-- Main Content Grid -->
        <div class="w-full lg:w-[896px] flex-shrink-0">
          {category?.subcategories && category.subcategories.length > 0 ? (
            <>
              <!-- Subcategorii -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                {category.subcategories.map((subcat, subcatIndex) => {
                  // Găsește prima poză de produs din subcategorie sau din categorie
                  let subcatImage = category?.image || '{CATEGORY_IMAGE}';
                  if (subcat.products && subcat.products.length > 0) {
                    const firstProduct = subcat.products[0];
                    const productData = allProducts.find(p => p.id === firstProduct.id);
                    if (productData?.main_image) {
                      // Extrage extensia din URL sau folosește .jpg ca default
                      const urlMatch = productData.main_image.match(/\\.(jpg|jpeg|png|webp)(\\?|$)/i);
                      const ext = urlMatch ? \`.\${urlMatch[1].toLowerCase()}\` : '.jpg';
                      subcatImage = \`/images/products-detail/{CATEGORY_SLUG}/\${firstProduct.slug}-1\${ext}\`;
                    }
                  } else if (category.products && category.products.length > 0) {
                    // Dacă subcategoria nu are produse, folosește un produs diferit pentru fiecare subcategorie
                    // Folosește indexul subcategoriei pentru a selecta un produs diferit
                    const productIndex = subcatIndex % category.products.length;
                    const selectedProduct = category.products[productIndex];
                    const productData = allProducts.find(p => p.id === selectedProduct.id);
                    if (productData?.main_image) {
                      // Extrage extensia din URL sau folosește .jpg ca default
                      const urlMatch = productData.main_image.match(/\\.(jpg|jpeg|png|webp)(\\?|$)/i);
                      const ext = urlMatch ? \`.\${urlMatch[1].toLowerCase()}\` : '.jpg';
                      subcatImage = \`/images/products-detail/{CATEGORY_SLUG}/\${selectedProduct.slug}-1\${ext}\`;
                    }
                  }
                  return (
                    <ProductCard
                      name={subcat.name}
                      description={subcat.description || \`Detalii despre \${subcat.name}\`}
                      image={subcatImage}
                      href={\`/produse/{CATEGORY_SLUG}/\${subcat.slug}\`}
                      categorySlug="{CATEGORY_SLUG}"
                    />
                  );
                })}
              </div>
            </>
          ) : (
              category?.products && category.products.length > 0 ? (
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                {category.products.map(product => {
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
                    href={\`/produse/{CATEGORY_SLUG}/\${product.slug}\`}
                    categorySlug="{CATEGORY_SLUG}"
                  />
                )})}
              </div>
            ) : (
              <div class="text-center py-12">
                <p class="text-secondary-600">Nu există produse în această categorie.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  </Section>
</Layout>
`;

function generateCategoryPages() {
  console.log('Generez pagini categorii...\n');
  
  // Citește products.json
  const productsJsonPath = path.join(__dirname, '..', 'src', 'data', 'products.json');
  
  if (!fs.existsSync(productsJsonPath)) {
    console.error('❌ Fișierul src/data/products.json nu există!');
    console.error('   Rulează mai întâi: node scripts/update-products-json.js');
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
  
  // Director pentru pagini categorii
  const categoriesDir = path.join(__dirname, '..', 'src', 'pages', 'categorii');
  ensureDir(categoriesDir);
  
  let generated = 0;
  let updated = 0;
  
  for (const category of categories) {
    const filePath = path.join(categoriesDir, `${category.slug}.astro`);
    
    // Generează conținut
    let content = categoryTemplate
      .replace(/{CATEGORY_ID}/g, category.id)
      .replace(/{CATEGORY_NAME}/g, category.name)
      .replace(/{CATEGORY_DESCRIPTION}/g, category.description || `${category.name} - Gama completă de produse.`)
      .replace(/{CATEGORY_SLUG}/g, category.slug)
      .replace(/{CATEGORY_IMAGE}/g, category.image || `/images/products/${category.slug}.jpg`)
      // Nu mai înlocuim PROCESSED_PRODUCTS_DATA - se încarcă din fișier la runtime
    
    const exists = fs.existsSync(filePath);
    
    fs.writeFileSync(filePath, content, 'utf-8');
    
    if (exists) {
      updated++;
      console.log(`✓ Actualizat: ${category.slug}.astro`);
    } else {
      generated++;
      console.log(`✓ Creat: ${category.slug}.astro`);
    }
  }
  
  console.log(`\n✓ Generare completă!`);
  console.log(`  - Pagini create: ${generated}`);
  console.log(`  - Pagini actualizate: ${updated}`);
  console.log(`  - Total: ${categories.length}`);
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

generateCategoryPages();

