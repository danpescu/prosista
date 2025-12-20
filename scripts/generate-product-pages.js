// Script pentru generarea automată a paginilor produse
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'products.json'), 'utf-8')
);

const template = `---
import Layout from '@/layouts/Layout.astro';
import Container from '@/components/ui/Container.astro';
import Section from '@/components/ui/Section.astro';
import Breadcrumb from '@/components/ui/Breadcrumb.astro';
import ProductHero from '@/components/product/ProductHero.astro';
import ProductGallery from '@/components/product/ProductGallery.astro';
import ProductSpecs from '@/components/product/ProductSpecs.astro';
import ProductFeatures from '@/components/product/ProductFeatures.astro';
import Applications from '@/components/product/Applications.astro';
import RelatedProducts from '@/components/product/RelatedProducts.astro';

const productName = "{PRODUCT_NAME}";
const productImages = [
  "https://placehold.co/800x600/1e40af/ffffff?text={PRODUCT_NAME_SLUG}+1",
  "https://placehold.co/800x600/1e40af/ffffff?text={PRODUCT_NAME_SLUG}+2",
];

const specs = [
  { label: "Material", value: "Specificații tehnice" },
  { label: "Dimensiuni", value: "Standard" },
  { label: "Culoare", value: "Diverse opțiuni" },
];

const features = [
  "Design modern și elegant",
  "Performanță acustică superioară",
  "Ușor de montat",
  "Durabilitate înaltă",
];

const applications = [
  "Spații comerciale",
  "Birouri",
  "Săli de conferințe",
];

const relatedProducts = [];
---

<Layout 
  title={productName}
  description={\`\${productName} - {CATEGORY_DESCRIPTION}\`}
>
  <ProductHero 
    name={productName}
    image={productImages[0]}
    category="{CATEGORY_NAME}"
  />
  
  <Section padding="lg">
    <Container>
      <Breadcrumb items={[
        { name: 'Acasă', href: '/' },
        { name: 'Produse', href: '/produse' },
        { name: '{CATEGORY_NAME}', href: '{CATEGORY_HREF}' },
        { name: productName }
      ]} />
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div class="lg:col-span-2">
          <div class="mb-8">
            <h2 class="text-3xl font-semibold mb-4">Descriere</h2>
            <div class="prose prose-lg max-w-none">
              <p>
                {PRODUCT_NAME} este o soluție profesională pentru {CATEGORY_DESCRIPTION}.
              </p>
            </div>
          </div>
          
          <div class="mb-8">
            <ProductGallery images={productImages} />
          </div>
        </div>
        
        <div class="space-y-8">
          <ProductSpecs specs={specs} />
          <ProductFeatures features={features} />
        </div>
      </div>
      
      <div class="mb-12">
        <Applications applications={applications} />
      </div>
      
      <div>
        <RelatedProducts products={relatedProducts} />
      </div>
    </Container>
  </Section>
</Layout>
`;

function createProductPage(category, subcategory, product, basePath) {
  const categoryName = category.name;
  const categoryHref = `/produse/${category.slug}`;
  const categoryDescription = category.description;
  
  let filePath;
  if (subcategory) {
    filePath = path.join(basePath, 'produse', category.slug, subcategory.slug, `${product.slug}.astro`);
  } else {
    filePath = path.join(basePath, 'produse', category.slug, `${product.slug}.astro`);
  }
  
  // Check if file already exists
  if (fs.existsSync(filePath)) {
    console.log(`- Skipping (exists): ${filePath}`);
    return;
  }
  
  // Ensure directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Replace template variables
  let content = template
    .replace(/{PRODUCT_NAME}/g, product.name)
    .replace(/{PRODUCT_NAME_SLUG}/g, product.slug)
    .replace(/{CATEGORY_NAME}/g, categoryName)
    .replace(/{CATEGORY_HREF}/g, categoryHref)
    .replace(/{CATEGORY_DESCRIPTION}/g, categoryDescription);
  
  fs.writeFileSync(filePath, content);
  console.log(`✓ Created: ${filePath}`);
}

const basePath = path.join(__dirname, '..', 'src', 'pages');

productsData.categories.forEach(category => {
  if (category.subcategories && category.subcategories.length > 0) {
    category.subcategories.forEach(subcategory => {
      subcategory.products.forEach(product => {
        createProductPage(category, subcategory, product, basePath);
      });
    });
  } else {
    category.products.forEach(product => {
      createProductPage(category, null, product, basePath);
    });
  }
});

console.log('\n✅ All product pages generated!');

