// Script pentru reconstruirea completă a produselor din prosista_products_ro.json
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Template pentru pagină produs
const productTemplate = `---
import Layout from '@/layouts/Layout.astro';
import Container from '@/components/ui/Container.astro';
import Section from '@/components/ui/Section.astro';
import CategoryHero from '@/components/product/CategoryHero.astro';
import ProductSidebar from '@/components/product/ProductSidebar.astro';
import ProductGallery from '@/components/product/ProductGallery.astro';
import ProductTabs from '@/components/product/ProductTabs.astro';
import QuoteModal from '@/components/product/QuoteModal.astro';
import productsData from '@/data/products.json';

const products = productsData;
const productName = "{PRODUCT_NAME}";
const productSlug = "{PRODUCT_SLUG}";
const categorySlug = "{CATEGORY_SLUG}";
const subcategorySlug = {SUBCATEGORY_SLUG};

// Find category and subcategory
const category = products.categories.find(cat => cat.slug === categorySlug);
{SUBCATEGORY_LOGIC}
const categoryProducts = {CATEGORY_PRODUCTS};

// Find product for SEO
const product = {PRODUCT_DATA};

const productImages = [
{PRODUCT_IMAGES}
];

const specs = {PRODUCT_SPECS};

const description = \`
{PRODUCT_DESCRIPTION}
\`;
---

<Layout 
  title={product?.meta_title || productName}
  description={product?.meta_description || \`\${productName} - Produs profesional de înaltă calitate.\`}
>
  <!-- Hero Section -->
  <CategoryHero 
    title={productName}
    breadcrumbs={[
      { name: 'Acasă', href: '/' },
      { name: '{CATEGORY_NAME}', href: '/categorii/{CATEGORY_SLUG}' }{BREADCRUMB_SUBCATEGORY}
    ]}
    backgroundImage={PRODUCT_BACKGROUND_IMAGE}
    categorySlug="{CATEGORY_SLUG}"
  />
  
  <Section padding="lg" class="py-12">
    <Container>
      <div class="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <!-- Sidebar -->
        <ProductSidebar 
          currentProductSlug={productSlug}
          categorySlug={{CATEGORY_SLUG_FOR_SIDEBAR}}
          categoryProducts={categoryProducts.map(p => ({
            id: p.id,
            name: p.name,
            slug: p.slug
          }))}
        />
        
        <!-- Main Content -->
        <div class="flex-1">
          <!-- Header with Get Quote Button -->
          <div class="mb-6 flex justify-between items-start">
            <div>
              <h1 class="text-3xl font-bold mb-2" style="font-family: Arial, sans-serif; font-weight: 700; color: rgb(6, 59, 139);">
                {productName}
              </h1>
              <h2 class="text-xl font-semibold text-secondary-600" style="font-family: Arial, sans-serif;">
                {productName}
              </h2>
            </div>
            <button
              id="open-quote-modal"
              class="bg-primary-600 text-white px-6 py-3 font-semibold transition-all duration-200 hover:bg-primary-700 relative overflow-hidden flex-shrink-0"
              style="font-family: Arial, sans-serif;"
            >
              <span class="button-overlay-quote-btn absolute inset-0 bg-accent-600"></span>
              <span class="relative z-10">CERE OFERTĂ</span>
            </button>
          </div>
          
          <!-- Tabs -->
          <div class="mb-8">
            <ProductTabs 
              specs={specs}
              hasDrawing={HAS_DRAWING}
              hasDataSheet={HAS_DATASHEET}
              drawingPdf={DRAWING_PDF}
              datasheetPdf={DATASHEET_PDF}
            />
          </div>
          
          <!-- Gallery -->
          <div class="mb-8">
            <ProductGallery images={productImages} categorySlug="{CATEGORY_SLUG}" />
          </div>
          
          <!-- Description -->
          <div class="prose prose-lg max-w-none">
            <div class="text-secondary-700" style="font-family: Arial, sans-serif; font-size: 14px; line-height: 24px;">
              {DESCRIPTION_PARAGRAPHS}
            </div>
          </div>
        </div>
      </div>
    </Container>
  </Section>
  
  <QuoteModal />
</Layout>

<style>
  .button-overlay-quote-btn {
    clip-path: inset(100% 0 0 0);
    transition: clip-path 0.4s ease-out;
  }
  
  button:hover .button-overlay-quote-btn {
    clip-path: inset(0% 0 0 0%);
  }
</style>
`;

// Template pentru pagină categorie
const categoryTemplate = `---
import Layout from '@/layouts/Layout.astro';
import Container from '@/components/ui/Container.astro';
import Section from '@/components/ui/Section.astro';
import CategoryHero from '@/components/product/CategoryHero.astro';
import CategorySidebar from '@/components/product/CategorySidebar.astro';
import ProductListCard from '@/components/product/ProductListCard.astro';
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
  const processedData = JSON.parse(readFileSync(join(process.cwd(), 'prosista_products_ro.json'), 'utf-8'));
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
                    const productIndex = subcatIndex % category.products.length;
                    const selectedProduct = category.products[productIndex];
                    const productData = allProducts.find(p => p.id === selectedProduct.id);
                    if (productData?.main_image) {
                      const urlMatch = productData.main_image.match(/\\.(jpg|jpeg|png|webp)(\\?|$)/i);
                      const ext = urlMatch ? \`.\${urlMatch[1].toLowerCase()}\` : '.jpg';
                      subcatImage = \`/images/products-detail/{CATEGORY_SLUG}/\${selectedProduct.slug}-1\${ext}\`;
                    }
                  }
                  return (
                    <ProductListCard
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
                  <ProductListCard
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

// Template pentru pagină subcategorie
const subcategoryTemplate = `---
import Layout from '@/layouts/Layout.astro';
import Container from '@/components/ui/Container.astro';
import Section from '@/components/ui/Section.astro';
import CategoryHero from '@/components/product/CategoryHero.astro';
import SubcategorySidebar from '@/components/product/SubcategorySidebar.astro';
import ProductListCard from '@/components/product/ProductListCard.astro';
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
  const processedData = JSON.parse(readFileSync(join(process.cwd(), 'prosista_products_ro.json'), 'utf-8'));
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
                  <ProductListCard
                    name={product.name}
                    description={\`Detalii despre \${product.name}\`}
                    image={productImage}
                    href={\`/produse/{CATEGORY_SLUG}/{SUBCATEGORY_SLUG}/\${product.slug}\`}
                    categorySlug="{CATEGORY_SLUG}"
                  />
                );
              })}
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

function buildHierarchicalStructure(sourceData) {
  const { categories: sourceCategories, products: sourceProducts } = sourceData;
  
  // Identifică categorii principale (parent_id: null)
  // Excludem categoriile care ar trebui să fie subcategorii
  const mainCategories = sourceCategories.filter(cat => {
    if (cat.parent_id !== null) return false;
    // Excludem categoriile care ar trebui să fie subcategorii
    const subcategoryIds = [
      'baffle-linear-ceiling',
      'open-cell-ceiling',
      'expanded-mesh-ceiling',
      'cassette-type-ceiling',
      'linear-plank-ceiling',
      'knauf-amf',
      'ecophon',
      'eurocoustic',
      'knauf-heradesign',
      'ecophon-saga'
    ];
    return !subcategoryIds.includes(cat.id);
  });
  
  // Identifică subcategorii (parent_id != null sau categoriile speciale)
  const subcategories = sourceCategories.filter(cat => {
    if (cat.parent_id !== null) return true;
    // Tratăm categoriile speciale ca subcategorii
    const metalCeilingSubcats = [
      'baffle-linear-ceiling',
      'open-cell-ceiling',
      'expanded-mesh-ceiling',
      'cassette-type-ceiling',
      'linear-plank-ceiling'
    ];
    const mineralWoolSubcats = [
      'knauf-amf',
      'ecophon',
      'eurocoustic'
    ];
    const woodWoolSubcats = [
      'knauf-heradesign',
      'ecophon-saga'
    ];
    
    return metalCeilingSubcats.includes(cat.id) || 
           metalCeilingSubcats.includes(cat.slug) ||
           mineralWoolSubcats.includes(cat.id) ||
           woodWoolSubcats.includes(cat.id);
  });
  
  
  // Creează map pentru categorii
  const categoryMap = new Map();
  mainCategories.forEach(cat => {
    categoryMap.set(cat.id, {
      id: cat.id,
      name: cat.name_ro || cat.name_en,
      slug: cat.slug_ro || cat.slug,
      meta_title: cat.meta_title_ro || cat.meta_title_en || `${cat.name_ro} – PROSISTA`,
      meta_description: cat.meta_description_ro || cat.meta_description_en || '',
      image: `/images/products/${cat.slug_ro || cat.slug}.jpg`,
      subcategories: [],
      products: []
    });
  });
  
  // Adaugă subcategorii la categorii principale
  subcategories.forEach(subcat => {
    let parentId = subcat.parent_id;
    // Dacă nu are parent_id, determină categoria părinte bazat pe tipul subcategoriei
    if (!parentId) {
      const metalCeilingSubcats = [
        'baffle-linear-ceiling',
        'open-cell-ceiling',
        'expanded-mesh-ceiling',
        'cassette-type-ceiling',
        'linear-plank-ceiling'
      ];
      const mineralWoolSubcats = [
        'knauf-amf',
        'ecophon',
        'eurocoustic'
      ];
      const woodWoolSubcats = [
        'knauf-heradesign',
        'ecophon-saga'
      ];
      
      if (metalCeilingSubcats.includes(subcat.id) || metalCeilingSubcats.includes(subcat.slug)) {
        parentId = 'metal-ceiling-systems';
      } else if (mineralWoolSubcats.includes(subcat.id)) {
        parentId = 'mineral-wool-panels';
      } else if (woodWoolSubcats.includes(subcat.id)) {
        parentId = 'wood-wool-panels';
      }
    }
    
    const parentCategory = categoryMap.get(parentId);
    if (parentCategory) {
      // Verifică dacă subcategoria nu există deja
      const existingSubcat = parentCategory.subcategories.find(s => s.id === subcat.id);
      if (!existingSubcat) {
        parentCategory.subcategories.push({
          id: subcat.id,
          name: subcat.name_ro || subcat.name_en,
          slug: subcat.slug_ro || subcat.slug,
          products: []
        });
      }
    }
  });
  
  // Asociază produse la categorii/subcategorii
  // Folosim logica bazată pe cuvinte cheie specifice pentru fiecare subcategorie
  const processedProductIds = new Set();
  
  // Mapare cuvinte cheie pentru subcategorii
  const subcategoryKeywords = {
    'baffle-linear-ceiling': {
      keywords: ['baffle', 'extruded-baffle', 'vectoral-baffle', 'wall-baffle', 'multipanel', 'f-linear', 'linear-f', 'tavan-tip-baffle', 'tavan-baffle', 'baffle-de-perete', 'tavan-multipanel', 'tavan-liniar'],
      nameKeywords: ['baffle', 'multipanel', 'liniar', 'baffle', 'vectoral'],
      excludeKeywords: ['din lemn', 'acustic din vata', 'wooden', 'glass wool', 'din-lemn', 'acustic-din-vata']
    },
    'open-cell-ceiling': {
      keywords: ['open-cell', 'self-carrying-open-cell', 't15-open-cell', 'pyramid-open-cell', 'lamina-open-cell', 'tavan-open-cell', 'open-cell-autoportant', 'open-cell-t15', 'open-cell-tip-piramida', 'open-cell-lamina'],
      nameKeywords: ['open cell', 'autoportant', 't15', 'piramida', 'lamina']
    },
    'expanded-mesh-ceiling': {
      keywords: ['mesh', 'lay-in-mesh', 'lay-on-mesh', 'hook-on-mesh', 'plasa', 'lay-in-cu-plasa', 'lay-on-cu-plasa', 'hook-on-cu-plasa'],
      nameKeywords: ['plasa', 'mesh', 'lay-in', 'lay-on', 'hook-on']
    },
    'cassette-type-ceiling': {
      keywords: ['clip-in', 'lay-on-suspended', 'lay-in-suspended', 'tavan-suspendat', 'suspendat-clip-in', 'suspendat-lay-on', 'suspendat-lay-in'],
      nameKeywords: ['clip-in', 'suspendat', 'caseta']
    },
    'linear-plank-ceiling': {
      keywords: ['hook-on-suspended', 'hook-on-corridor', 'suspendat-hook-on', 'hook-on-pentru-coridoare'],
      nameKeywords: ['hook-on', 'coridor', 'lama']
    },
    'knauf-amf': {
      keywords: ['amf', 'ecomin', 'thermatex', 'adagio', 'hygena', 'topiq'],
      nameKeywords: ['amf', 'ecomin', 'thermatex', 'adagio', 'hygena', 'topiq']
    },
    'ecophon': {
      keywords: ['opta', 'focus', 'hygiene', 'advantage', 'sombra'],
      nameKeywords: ['opta', 'focus', 'hygiene', 'advantage', 'sombra']
    },
    'eurocoustic': {
      keywords: ['minerval', 'tonga'],
      nameKeywords: ['minerval', 'tonga']
    },
    'knauf-heradesign': {
      keywords: ['heradesign'],
      nameKeywords: ['heradesign']
    },
    'ecophon-saga': {
      keywords: ['saga'],
      nameKeywords: ['saga']
    }
  };
  
  sourceProducts.forEach(product => {
    if (!product.categories || product.categories.length === 0) return;
    
    const productCategoryId = product.categories[0]; // Prima categorie
    const mainCategory = categoryMap.get(productCategoryId);
    
    if (!mainCategory) return;
    
    const productName = (product.name_ro || product.name_en || '').toLowerCase();
    const productSlug = (product.slug_ro || product.slug_en || '').toLowerCase();
    
    // Caută dacă produsul aparține unei subcategorii bazat pe cuvinte cheie
    let assigned = false;
    for (const subcat of mainCategory.subcategories) {
      const mapping = subcategoryKeywords[subcat.id];
      if (!mapping) continue;
      
      // Verifică slug-urile exacte
      const matchesSlug = mapping.keywords.some(keyword => {
        const keywordLower = keyword.toLowerCase();
        return productSlug === keywordLower || 
               productSlug.includes(keywordLower) || 
               keywordLower.includes(productSlug) ||
               productSlug.replace(/-/g, '').includes(keywordLower.replace(/-/g, ''));
      });
      
      // Verifică cuvintele cheie din nume
      const matchesName = mapping.nameKeywords.some(keyword => {
        const keywordLower = keyword.toLowerCase();
        return productName.includes(keywordLower) || 
               productSlug.includes(keywordLower) ||
               productName.replace(/\s+/g, '').includes(keywordLower.replace(/\s+/g, ''));
      });
      
      // Verifică excluderile
      const isExcluded = mapping.excludeKeywords && mapping.excludeKeywords.some(excludeKeyword => {
        const excludeLower = excludeKeyword.toLowerCase();
        return productName.includes(excludeLower) || productSlug.includes(excludeLower);
      });
      
      if (isExcluded) continue; // Skip this subcategory if product matches exclusion
      
      // Verifică și după ID-ul subcategoriei în array-ul categories al produsului
      const matchesCategory = product.categories.includes(subcat.id);
      
      if ((matchesSlug || matchesName || matchesCategory) && !processedProductIds.has(product.id)) {
        subcat.products.push({
          id: product.id,
          name: product.name_ro || product.name_en,
          slug: product.slug_ro || product.slug_en
        });
        processedProductIds.add(product.id);
        assigned = true;
        break;
      }
    }
    
    // Dacă nu s-a găsit o subcategorie, adaugă produsul direct în categorie
    if (!assigned && !processedProductIds.has(product.id)) {
      mainCategory.products.push({
        id: product.id,
        name: product.name_ro || product.name_en,
        slug: product.slug_ro || product.slug_en
      });
      processedProductIds.add(product.id);
    }
  });
  
  // Returnează doar categoriile principale (exclude subcategoriile care au fost adăugate)
  const subcategoryIds = new Set([
    'baffle-linear-ceiling',
    'open-cell-ceiling',
    'expanded-mesh-ceiling',
    'cassette-type-ceiling',
    'linear-plank-ceiling',
    'knauf-amf',
    'ecophon',
    'eurocoustic',
    'knauf-heradesign',
    'ecophon-saga'
  ]);
  
  return Array.from(categoryMap.values()).filter(cat => !subcategoryIds.has(cat.id));
}

function rebuildProducts() {
  console.log('Încep reconstruirea produselor...\n');
  
  // Citește prosista_products_ro.json
  const sourcePath = path.join(__dirname, '..', 'prosista_products_ro.json');
  const sourceData = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'));
  
  console.log(`✓ Citit prosista_products_ro.json`);
  console.log(`  - Categorii: ${sourceData.categories.length}`);
  console.log(`  - Produse: ${sourceData.products.length}\n`);
  
  // Construiește structura ierarhică
  const hierarchicalCategories = buildHierarchicalStructure(sourceData);
  
  // Salvează products.json
  const productsJsonPath = path.join(__dirname, '..', 'src', 'data', 'products.json');
  const productsData = {
    categories: hierarchicalCategories
  };
  
  fs.writeFileSync(productsJsonPath, JSON.stringify(productsData, null, 2), 'utf-8');
  console.log(`✓ Generat src/data/products.json`);
  console.log(`  - Categorii principale: ${hierarchicalCategories.length}\n`);
  
  // Șterge directorul produse existent
  const produseDir = path.join(__dirname, '..', 'src', 'pages', 'produse');
  if (fs.existsSync(produseDir)) {
    fs.rmSync(produseDir, { recursive: true, force: true });
    console.log(`✓ Șters directorul src/pages/produse/\n`);
  }
  
  // Generează paginile
  generatePages(sourceData, hierarchicalCategories);
  
  // Actualizează navigation.json
  updateNavigation(hierarchicalCategories);
  
  console.log('\n✓ Reconstruire completă!');
}

function generatePages(sourceData, categories) {
  console.log('Generez paginile...\n');
  
  const pagesDir = path.join(__dirname, '..', 'src', 'pages');
  const produseDir = path.join(pagesDir, 'produse');
  const categoriiDir = path.join(pagesDir, 'categorii');
  
  // Creează map pentru produse complete
  const productsMap = new Map();
  sourceData.products.forEach(product => {
    productsMap.set(product.id, product);
  });
  
  let categoryPagesGenerated = 0;
  let subcategoryPagesGenerated = 0;
  let productPagesGenerated = 0;
  
  categories.forEach(category => {
    // Generează pagină categorie
    generateCategoryPage(category, categoriiDir);
    categoryPagesGenerated++;
    
    // Generează pagini subcategorii
    if (category.subcategories && category.subcategories.length > 0) {
      category.subcategories.forEach(subcategory => {
        generateSubcategoryPage(category, subcategory, produseDir);
        subcategoryPagesGenerated++;
        
        // Generează pagini produse din subcategorie
        if (subcategory.products && subcategory.products.length > 0) {
          subcategory.products.forEach(product => {
            const fullProduct = productsMap.get(product.id);
            if (fullProduct) {
              generateProductPage(category, subcategory, product, fullProduct, produseDir);
              productPagesGenerated++;
            }
          });
        }
      });
    }
    
    // Generează pagini produse directe din categorie
    if (category.products && category.products.length > 0) {
      category.products.forEach(product => {
        const fullProduct = productsMap.get(product.id);
        if (fullProduct) {
          generateProductPage(category, null, product, fullProduct, produseDir);
          productPagesGenerated++;
        }
      });
    }
  });
  
  console.log(`\n✓ Pagini generate:`);
  console.log(`  - Categorii: ${categoryPagesGenerated}`);
  console.log(`  - Subcategorii: ${subcategoryPagesGenerated}`);
  console.log(`  - Produse: ${productPagesGenerated}`);
}

function generateCategoryPage(category, categoriiDir) {
  ensureDir(categoriiDir);
  
  const filePath = path.join(categoriiDir, `${category.slug}.astro`);
  
  let content = categoryTemplate
    .replace(/{CATEGORY_ID}/g, category.id)
    .replace(/{CATEGORY_NAME}/g, category.name)
    .replace(/{CATEGORY_SLUG}/g, category.slug)
    .replace(/{CATEGORY_DESCRIPTION}/g, category.meta_description || `${category.name} - Soluții profesionale.`)
    .replace(/{CATEGORY_IMAGE}/g, category.image || '/images/products/default.jpg');
  
  fs.writeFileSync(filePath, content, 'utf-8');
}

function generateSubcategoryPage(category, subcategory, produseDir) {
  ensureDir(produseDir);
  const categoryDir = path.join(produseDir, category.slug);
  ensureDir(categoryDir);
  
  const filePath = path.join(categoryDir, `${subcategory.slug}.astro`);
  
  let content = subcategoryTemplate
    .replace(/{CATEGORY_SLUG}/g, category.slug)
    .replace(/{CATEGORY_NAME}/g, category.name)
    .replace(/{SUBCATEGORY_SLUG}/g, subcategory.slug)
    .replace(/{SUBCATEGORY_NAME}/g, subcategory.name)
    .replace(/{SUBCATEGORY_ID}/g, subcategory.id)
    .replace(/{CATEGORY_IMAGE}/g, category.image || '/images/products/default.jpg');
  
  fs.writeFileSync(filePath, content, 'utf-8');
}

function generateProductPage(category, subcategory, product, fullProduct, produseDir) {
  ensureDir(produseDir);
  const categoryDir = path.join(produseDir, category.slug);
  ensureDir(categoryDir);
  
  let filePath;
  if (subcategory) {
    const subcategoryDir = path.join(categoryDir, subcategory.slug);
    ensureDir(subcategoryDir);
    filePath = path.join(subcategoryDir, `${product.slug}.astro`);
  } else {
    filePath = path.join(categoryDir, `${product.slug}.astro`);
  }
  
  // Pregătește datele produsului
  const productImages = (fullProduct.images || []).map((img, idx) => {
    // Extrage extensia din URL
    const urlMatch = img.match(/\.(jpg|jpeg|png|webp)(\?|$)/i);
    const ext = urlMatch ? `.${urlMatch[1].toLowerCase()}` : '.jpg';
    return `  "/images/products-detail/${category.slug}/${product.slug}-${idx + 1}${ext}"`;
  }).join(',\n') || `  "/images/products-detail/${category.slug}/${product.slug}-1.jpg"`;
  
  const productSpecs = `[
  { label: "Descriere", value: "Specificații tehnice disponibile la cerere." }
]`;
  
  // Procesează descrierea
  let description = fullProduct.full_description_ro || fullProduct.full_description_en || '';
  // Elimină HTML tags dacă există
  description = description.replace(/<[^>]*>/g, '').trim();
  // Împarte în paragrafe
  const descriptionParagraphs = description.split('\n\n').map(p => 
    `<p>${p.trim()}</p>`
  ).join('\n');
  
  const subcategoryLogic = subcategory 
    ? `const subcategory = category?.subcategories?.find(sub => sub.slug === subcategorySlug);`
    : 'const subcategory = null;';
  
  const categoryProductsList = subcategory
    ? `(subcategory?.products || []).filter(p => p.slug !== productSlug)`
    : `(category?.products || []).filter(p => p.slug !== productSlug)`;
  
  const breadcrumbSubcategory = subcategory
    ? `,\n      { name: '${subcategory.name}', href: '/produse/${category.slug}/${subcategory.slug}' }`
    : '';
  
  const categorySlugForSidebar = subcategory
    ? `\`\${categorySlug}/\${subcategorySlug}\``
    : `"${category.slug}"`;
  
  // Găsește PDF-uri
  const pdfs = fullProduct.pdfs || [];
  const hasDrawing = pdfs.some(pdf => pdf.includes('teknik-cizim') || pdf.includes('drawing'));
  const hasDataSheet = pdfs.some(pdf => pdf.includes('teknik-foy') || pdf.includes('data-sheet') || pdf.includes('tds'));
  
  const drawingPdf = pdfs.find(pdf => 
    !pdf.includes('katalog.pdf') && 
    (pdf.includes('teknik-cizim') || pdf.includes('drawing'))
  ) || '';
  
  const datasheetPdf = pdfs.find(pdf => 
    !pdf.includes('katalog.pdf') && 
    (pdf.includes('teknik-foy') || pdf.includes('data-sheet') || pdf.includes('tds'))
  ) || pdfs.find(pdf => !pdf.includes('katalog.pdf')) || '';
  
  let content = productTemplate
    .replace(/{PRODUCT_NAME}/g, product.name)
    .replace(/{PRODUCT_SLUG}/g, product.slug)
    .replace(/{CATEGORY_SLUG}/g, category.slug)
    .replace(/{CATEGORY_NAME}/g, category.name)
    .replace(/{SUBCATEGORY_SLUG}/g, subcategory ? `"${subcategory.slug}"` : 'null')
    .replace(/{SUBCATEGORY_LOGIC}/g, subcategoryLogic)
    .replace(/{CATEGORY_PRODUCTS}/g, categoryProductsList)
    .replace(/{PRODUCT_IMAGES}/g, productImages)
    .replace(/{PRODUCT_SPECS}/g, productSpecs)
    .replace(/{PRODUCT_DESCRIPTION}/g, description)
    .replace(/{DESCRIPTION_PARAGRAPHS}/g, descriptionParagraphs || `<p>${product.name} - Produs profesional.</p>`)
    .replace(/{PRODUCT_DATA}/g, JSON.stringify({
      name: product.name,
      slug: product.slug,
      meta_title: fullProduct.meta_title_ro || fullProduct.meta_title_en || `${product.name} – PROSISTA`,
      meta_description: fullProduct.meta_description_ro || fullProduct.meta_description_en || `${product.name} - Produs profesional.`
    }))
    .replace(/{PRODUCT_BACKGROUND_IMAGE}/g, category.image || '/images/products/default.jpg')
    .replace(/{BREADCRUMB_SUBCATEGORY}/g, breadcrumbSubcategory)
    .replace(/{CATEGORY_SLUG_FOR_SIDEBAR}/g, categorySlugForSidebar)
    .replace(/{HAS_DRAWING}/g, hasDrawing ? 'true' : 'false')
    .replace(/{HAS_DATASHEET}/g, hasDataSheet ? 'true' : 'false')
    .replace(/{DRAWING_PDF}/g, drawingPdf)
    .replace(/{DATASHEET_PDF}/g, datasheetPdf);
  
  fs.writeFileSync(filePath, content, 'utf-8');
}

function updateNavigation(categories) {
  const navigationPath = path.join(__dirname, '..', 'src', 'data', 'navigation.json');
  
  // Exclude subcategoriile din navigation (doar categoriile principale)
  const subcategoryIds = new Set([
    'baffle-linear-ceiling',
    'open-cell-ceiling',
    'expanded-mesh-ceiling',
    'cassette-type-ceiling',
    'linear-plank-ceiling',
    'knauf-amf',
    'ecophon',
    'eurocoustic',
    'knauf-heradesign',
    'ecophon-saga'
  ]);
  
  const subcategorySlugs = new Set([
    'tavane-tip-baffle-si-liniare',
    'tavane-tip-open-cell',
    'tavane-din-plasa-metalica-expandata',
    'tavane-tip-caseta',
    'tavane-liniare-tip-lama',
    'knauf-amf',
    'ecophon',
    'eurocoustic',
    'knauf-heradesign',
    'ecophon-saga'
  ]);
  
  const mainCategories = categories.filter(cat => 
    !subcategoryIds.has(cat.id) && !subcategorySlugs.has(cat.slug)
  );
  
  const navigation = {
    products: mainCategories.map(cat => ({
      name: cat.name,
      href: `/categorii/${cat.slug}`
    }))
  };
  
  fs.writeFileSync(navigationPath, JSON.stringify(navigation, null, 2), 'utf-8');
  console.log(`✓ Actualizat src/data/navigation.json\n`);
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

rebuildProducts();
