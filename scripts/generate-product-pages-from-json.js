// Script pentru generare pagini produse folosind template-ul aprobat
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productTemplate = `---
import Layout from '@/layouts/Layout.astro';
import Container from '@/components/ui/Container.astro';
import Section from '@/components/ui/Section.astro';
import CategoryHero from '@/components/product/CategoryHero.astro';
import ProductSidebar from '@/components/product/ProductSidebar.astro';
import ProductGallery from '@/components/product/ProductGallery.astro';
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

const specs = [
{PRODUCT_SPECS}
];

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
          <!-- Product Container with Border -->
          <div class="bg-white border border-gray-200 p-6">
            <!-- Gallery - First -->
            <div class="mb-8">
              <ProductGallery images={productImages} categorySlug="{CATEGORY_SLUG}" />
            </div>
            
            <!-- Header with Title and PDF Buttons -->
            <div class="mb-6">
              <div class="flex flex-wrap justify-between items-center gap-4">
                <h1 class="text-2xl font-bold" style="font-family: Arial, sans-serif; font-weight: 700; color: rgb(6, 59, 139);">
                  {productName}
                </h1>
                <div class="flex flex-wrap items-center gap-4">
{PDF_BUTTONS}
                </div>
              </div>
            </div>

            <!-- CERE OFERTĂ Button -->
            <div class="mb-6 flex justify-end">
              <button
                id="open-quote-modal"
                class="bg-primary-600 text-white px-6 py-3 font-semibold transition-all duration-200 hover:bg-primary-700 relative overflow-hidden"
                style="font-family: Arial, sans-serif;"
              >
                <span class="button-overlay-quote-btn absolute inset-0 bg-accent-600"></span>
                <span class="relative z-10">CERE OFERTĂ</span>
              </button>
            </div>
            
            <!-- Specifications -->
            {specs.length > 0 && (
              <div class="mb-8">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {specs.map(spec => (
                    <div class="border-b border-secondary-200 pb-3">
                      <dt class="text-sm font-medium text-secondary-500" style="font-family: Arial, sans-serif;">{spec.label}</dt>
                      <dd class="mt-1 text-sm text-secondary-900" style="font-family: Arial, sans-serif;">{spec.value}</dd>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <!-- Description -->
            <div class="prose prose-lg max-w-none">
              <div class="text-secondary-700" style="font-family: Arial, sans-serif; font-size: 14px; line-height: 24px;">
                {DESCRIPTION_PARAGRAPHS}
              </div>
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

function generateProductPages() {
  console.log('Generez pagini produse...\n');
  
  // Citește JSON procesat și products.json
  const processedPath = path.join(__dirname, '..', 'prosista_products_processed.json');
  const productsJsonPath = path.join(__dirname, '..', 'src', 'data', 'products.json');
  
  if (!fs.existsSync(processedPath)) {
    console.error('❌ Fișierul prosista_products_processed.json nu există!');
    process.exit(1);
  }
  
  if (!fs.existsSync(productsJsonPath)) {
    console.error('❌ Fișierul src/data/products.json nu există!');
    process.exit(1);
  }
  
  const processedData = JSON.parse(fs.readFileSync(processedPath, 'utf-8'));
  const productsData = JSON.parse(fs.readFileSync(productsJsonPath, 'utf-8'));
  
  const { products: processedProducts } = processedData;
  const { categories } = productsData;
  
  // Lista de subcategorii și categorii principale care nu trebuie tratate ca produse
  // IMPORTANT: Exclude doar dacă ID-ul produsului este același cu ID-ul categoriei, nu slug-ul
  // (pentru a permite produse cu același slug ca categoria, ex: vinyl-coated-gypsum-panel)
  const excludedIds = new Set();
  const excludedSlugs = new Set();
  categories.forEach(cat => {
    // Exclude categorii principale (doar ID-ul, nu slug-ul)
    excludedIds.add(cat.id);
    // Exclude subcategorii (doar ID-ul, nu slug-ul)
    if (cat.subcategories) {
      cat.subcategories.forEach(sub => {
        excludedIds.add(sub.id);
      });
    }
  });
  
  // Filtrează produsele - exclude subcategoriile și categoriile principale
  const actualProducts = processedProducts.filter(product => {
    // Exclude dacă ID-ul produsului este o subcategorie sau categorie principală
    // NU exclude dacă doar slug-ul este același (pentru a permite produse cu același slug ca categoria)
    if (excludedIds.has(product.id)) {
      return false;
    }
    return true;
  });
  
  // Director pentru pagini produse
  const productsDir = path.join(__dirname, '..', 'src', 'pages', 'produse');
  ensureDir(productsDir);
  
  let generated = 0;
  let updated = 0;
  
  for (const product of actualProducts) {
    // Găsește categoria și subcategoria - folosește slug pentru matching
    const category = categories.find(cat => 
      cat.products?.some(p => p.slug === product.slug) ||
      cat.subcategories?.some(sub => sub.products?.some(p => p.slug === product.slug))
    );
    
    if (!category) {
      console.warn(`⚠ Produs ${product.name} nu are categorie asociată`);
      continue;
    }
    
    // Verifică dacă e în subcategorie
    const subcategory = category.subcategories?.find(sub =>
      sub.products?.some(p => p.slug === product.slug)
    );
    
    // Construiește calea fișierului
    let filePath;
    let categorySlugForSidebar;
    let breadcrumbSubcategory = '';
    let subcategoryLogic = '';
    let categoryProductsList = '';
    
    if (subcategory) {
      // Produs în subcategorie - folosește doar produsele din subcategorie
      const subcategoryDir = path.join(productsDir, category.slug, subcategory.slug);
      ensureDir(subcategoryDir);
      filePath = path.join(subcategoryDir, `${product.slug}.astro`);
      categorySlugForSidebar = `\`\${categorySlug}/\${subcategorySlug}\``;
      breadcrumbSubcategory = `,\n      { name: '${subcategory.name}', href: '/produse/${category.slug}/${subcategory.slug}' }`;
      subcategoryLogic = `const subcategory = category?.subcategories?.find(sub => sub.slug === subcategorySlug);`;
      categoryProductsList = `(subcategory?.products || []).filter(p => p.slug !== productSlug)`;
    } else {
      // Produs direct în categorie - folosește doar produsele directe din categorie (nu din subcategorii)
      const categoryDir = path.join(productsDir, category.slug);
      ensureDir(categoryDir);
      filePath = path.join(categoryDir, `${product.slug}.astro`);
      categorySlugForSidebar = `{categorySlug}`;
      subcategoryLogic = `// Product directly in category`;
      categoryProductsList = `(category?.products || []).filter(p => p.slug !== productSlug)`;
    }
    
    // Generează imagini - folosește main_image ca prima imagine dacă există
    let productImages = '';
    let backgroundImagePath = `category?.image || "/images/products/${category.slug}.jpg"`;
    
    if (product.images && product.images.length > 0) {
      // Dacă există main_image și nu e deja prima în array, o punem primul
      const imagesArray = [...product.images];
      if (product.main_image && imagesArray[0] !== product.main_image) {
        // Elimină main_image din array dacă există în altă poziție
        const mainImageIndex = imagesArray.indexOf(product.main_image);
        if (mainImageIndex > 0) {
          imagesArray.splice(mainImageIndex, 1);
        }
        // Pune main_image primul
        imagesArray.unshift(product.main_image);
      }
      
      // Extrage extensie pentru prima imagine (main_image sau prima din array)
      const firstImageUrl = product.main_image || imagesArray[0];
      const firstImageExtension = firstImageUrl.match(/\.(jpg|jpeg|png|webp)$/i)?.[0] || '.jpg';
      
      // Generează array-ul de imagini pentru galerie
      productImages = imagesArray.map((img, idx) => {
        // Extrage extensie din URL sau folosește extensia primei imagini
        const extension = img.match(/\.(jpg|jpeg|png|webp)$/i)?.[0] || firstImageExtension;
        return `  "/images/products-detail/${category.slug}/${product.slug}-${idx + 1}${extension}"`;
      }).join(',\n');
      
      // Setează backgroundImage pentru CategoryHero
      backgroundImagePath = `"/images/products-detail/${category.slug}/${product.slug}-1${firstImageExtension}"`;
    } else if (product.main_image) {
      // Dacă nu există array de imagini dar există main_image
      const extension = product.main_image.match(/\.(jpg|jpeg|png|webp)$/i)?.[0] || '.jpg';
      productImages = `  "/images/products-detail/${category.slug}/${product.slug}-1${extension}"`;
      backgroundImagePath = `"/images/products-detail/${category.slug}/${product.slug}-1${extension}"`;
    } else {
      // Nu există imagini - lasăm gol (nu generăm imagine default)
      productImages = '';
    }
    
    // Generează specificații - doar dacă există în JSON
    const productSpecs = product.specs && product.specs.length > 0
      ? product.specs.map(spec => 
          `  { label: "${spec.label}", value: "${spec.value}" }`
        ).join(',\n')
      : ''; // Nu generăm spec default
    
    // Generează paragrafe descriere (folosește descriptionHTML dacă există)
    let descriptionParagraphs = '';
    if (product.descriptionHTML && product.descriptionHTML.trim() !== '') {
      // Folosește HTML-ul tradus direct (deja are structura)
      descriptionParagraphs = product.descriptionHTML
        .replace(/<p([^>]*)>/g, '<p class="mb-4"$1>')
        .replace(/\n/g, '\n              ');
    } else if (product.description && product.description.trim() !== '') {
      // Fallback: convertește textul în paragrafe
      descriptionParagraphs = product.description.split('\n\n')
        .filter(p => p.trim())
        .map(p => `<p class="mb-4">${p.trim()}</p>`)
        .join('\n              ');
    }
    // Dacă nu există descriere, lasăm gol (nu generăm descriere default)
    
    // Generează conținut
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
      .replace(/{PRODUCT_DESCRIPTION}/g, product.description || '')
      .replace(/{PRODUCT_DATA}/g, JSON.stringify({
        name: product.name,
        slug: product.slug,
        meta_title: product.meta_title,
        meta_description: product.meta_description
      }))
      .replace(/{PRODUCT_BACKGROUND_IMAGE}/g, backgroundImagePath)
      .replace(/{BREADCRUMB_SUBCATEGORY}/g, breadcrumbSubcategory)
      .replace(/{CATEGORY_SLUG_FOR_SIDEBAR}/g, subcategory ? `\`\${categorySlug}/\${subcategorySlug}\`` : `"${category.slug}"`);
    
    // Găsește PDF-ul pentru desen (exclude katalog.pdf)
    const drawingPdf = product.pdfs?.find(pdf => 
      !pdf.includes('katalog.pdf') && 
      (pdf.includes('teknik-cizim') || pdf.includes('drawing'))
    ) || '';
    
    // Găsește PDF-ul pentru fișa tehnică (exclude katalog.pdf, preferă teknik-foy)
    const datasheetPdf = product.pdfs?.find(pdf => 
      !pdf.includes('katalog.pdf') && 
      (pdf.includes('teknik-foy') || pdf.includes('data-sheet') || pdf.includes('tds'))
    ) || product.pdfs?.find(pdf => !pdf.includes('katalog.pdf')) || '';
    
    // Generează butoanele PDF - doar pentru documente care există
    let pdfButtons = '';
    
    if (drawingPdf) {
      pdfButtons += `                <a 
                  href="${drawingPdf}" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors font-semibold text-sm"
                  style="font-family: Arial, sans-serif;"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  Teknik Çizim
                </a>`;
    }
    
    if (datasheetPdf) {
      if (pdfButtons) pdfButtons += '\n';
      pdfButtons += `                <a 
                  href="${datasheetPdf}" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors font-semibold text-sm"
                  style="font-family: Arial, sans-serif;"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  Fișa Tehnică
                </a>`;
    }
    
    content = content
      .replace(/{PDF_BUTTONS}/g, pdfButtons)
      .replace(/{DESCRIPTION_PARAGRAPHS}/g, descriptionParagraphs);
    
    const exists = fs.existsSync(filePath);
    
    fs.writeFileSync(filePath, content, 'utf-8');
    
    if (exists) {
      updated++;
      console.log(`✓ Actualizat: ${category.slug}${subcategory ? `/${subcategory.slug}` : ''}/${product.slug}.astro`);
    } else {
      generated++;
      console.log(`✓ Creat: ${category.slug}${subcategory ? `/${subcategory.slug}` : ''}/${product.slug}.astro`);
    }
  }
  
  console.log(`\n✓ Generare completă!`);
  console.log(`  - Pagini create: ${generated}`);
  console.log(`  - Pagini actualizate: ${updated}`);
  console.log(`  - Total: ${processedProducts.length}`);
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

generateProductPages();

