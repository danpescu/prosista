# Ghid: Crearea Paginilor Noi

Acest ghid explică cum să creezi pagini noi în proiectul Astro Prosista.

## Structura de Bază

Toate paginile se află în folderul `src/pages/` și urmează structura de directoare pentru a genera URL-urile.

### Exemplu:
- `src/pages/despre.astro` → `https://site.ro/despre`
- `src/pages/produse/nume-produs.astro` → `https://site.ro/produse/nume-produs`
- `src/pages/categorii/nume-categorie.astro` → `https://site.ro/categorii/nume-categorie`

---

## 1. Pagină Simplă (Statică)

Pentru o pagină simplă (ex: Despre, Servicii, etc.):

```astro
---
import Layout from '@/layouts/Layout.astro';
import Container from '@/components/ui/Container.astro';
import Section from '@/components/ui/Section.astro';

const pageTitle = "Despre Noi";
const pageDescription = "Descrierea paginii pentru SEO";
---

<Layout 
  title={pageTitle}
  description={pageDescription}
>
  <Section padding="lg" class="py-12">
    <Container>
      <h1 class="text-3xl font-bold mb-6">{pageTitle}</h1>
      
      <div class="prose prose-lg max-w-none">
        <p>Conținutul paginii aici...</p>
      </div>
    </Container>
  </Section>
</Layout>
```

**Pași:**
1. Creează fișierul `.astro` în `src/pages/`
2. Importă `Layout`, `Container`, `Section`
3. Definește `title` și `description` pentru SEO
4. Adaugă conținutul în interiorul `<Layout>`

---

## 2. Pagină de Categorie

Pentru o pagină care listează produsele dintr-o categorie:

```astro
---
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
const categorySlug = "nume-categorie"; // slug-ul categoriei
const category = products.categories.find(cat => cat.slug === categorySlug);

// Încarcă produsele procesate pentru imagini
let allProducts = [];
try {
  const processedData = JSON.parse(readFileSync(join(process.cwd(), 'prosista_products_processed.json'), 'utf-8'));
  allProducts = processedData.products || [];
} catch (e) {
  console.warn('Could not load processed products:', e.message);
}
---

<Layout 
  title={category?.meta_title || "Nume Categorie"}
  description={category?.meta_description || "Descriere categorie"}
>
  <!-- Hero Section -->
  <CategoryHero 
    title={category?.name || 'Nume Categorie'}
    breadcrumbs={[
      { name: 'Acasă', href: '/' },
      { name: category?.name || 'Categorie' }
    ]}
    backgroundImage={category?.image}
  />
  
  <!-- Main Content -->
  <Section padding="lg" class="py-12">
    <div class="w-full lg:w-[1320px] mx-auto px-5 lg:px-0">
      <div class="flex flex-col lg:flex-row" style="gap: 24px;">
        <!-- Sidebar -->
        <CategorySidebar 
          currentCategoryId={category?.id}
          categories={products.categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug
          }))}
        />
        
        <!-- Products List -->
        <div class="flex-1">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category?.subcategories?.map(subcategory => (
              subcategory.products?.map(product => {
                const processedProduct = allProducts.find(p => p.id === product.id);
                return (
                  <ProductListCard
                    product={product}
                    categorySlug={categorySlug}
                    subcategorySlug={subcategory.slug}
                    image={processedProduct?.image || product.image}
                  />
                );
              })
            ))}
          </div>
        </div>
      </div>
    </div>
  </Section>
</Layout>
```

**Pași:**
1. Creează fișierul în `src/pages/categorii/nume-categorie.astro`
2. Găsește categoria din `products.json` după slug
3. Folosește `CategoryHero` pentru header
4. Folosește `CategorySidebar` pentru navigare
5. Listează produsele cu `ProductListCard`

---

## 3. Pagină de Produs

Pentru o pagină de produs individual:

```astro
---
import Layout from '@/layouts/Layout.astro';
import Container from '@/components/ui/Container.astro';
import Section from '@/components/ui/Section.astro';
import CategoryHero from '@/components/product/CategoryHero.astro';
import ProductSidebar from '@/components/product/ProductSidebar.astro';
import ProductGallery from '@/components/product/ProductGallery.astro';
import QuoteModal from '@/components/product/QuoteModal.astro';
import productsData from '@/data/products.json';

const products = productsData;
const productName = "Nume Produs";
const productSlug = "nume-produs";
const categorySlug = "nume-categorie";
const subcategorySlug = "nume-subcategorie"; // sau null dacă nu există

// Găsește categoria și subcategoria
const category = products.categories.find(cat => cat.slug === categorySlug);
const subcategory = category?.subcategories?.find(sub => sub.slug === subcategorySlug);
const categoryProducts = (subcategory?.products || category?.products || []).filter(p => p.slug !== productSlug);

// Găsește produsul pentru SEO
const product = subcategory?.products?.find(p => p.slug === productSlug) || 
                category?.products?.find(p => p.slug === productSlug);

// Imagini produs
const productImages = [
  "/images/products-detail/categorie/produs-1.jpg",
  "/images/products-detail/categorie/produs-2.jpg"
];

// Specificații tehnice
const specs = [
  { label: "Material", value: "Valoare" },
  { label: "Dimensiuni", value: "Valoare" }
];

// Descriere produs
const description = `
  Descrierea detaliată a produsului aici...
`;
---

<Layout 
  title={product?.meta_title || productName}
  description={product?.meta_description || `${productName} - Produs profesional de înaltă calitate.`}
>
  <!-- Hero Section -->
  <CategoryHero 
    title={productName}
    breadcrumbs={[
      { name: 'Acasă', href: '/' },
      { name: category?.name || 'Categorie', href: `/categorii/${categorySlug}` },
      ...(subcategory ? [{ name: subcategory.name, href: `/produse/${categorySlug}/${subcategorySlug}` }] : []),
      { name: productName }
    ]}
    backgroundImage={productImages[0]}
    categorySlug={categorySlug}
  />
  
  <Section padding="lg" class="py-12">
    <Container>
      <div class="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <!-- Sidebar -->
        <ProductSidebar 
          currentProductSlug={productSlug}
          categorySlug={subcategory ? `${categorySlug}/${subcategorySlug}` : categorySlug}
          categoryProducts={categoryProducts.map(p => ({
            id: p.id,
            name: p.name,
            slug: p.slug
          }))}
        />
        
        <!-- Main Content -->
        <div class="flex-1">
          <div class="bg-white border border-gray-200 p-6">
            <!-- Gallery -->
            <div class="mb-8">
              <ProductGallery images={productImages} categorySlug={categorySlug} />
            </div>
            
            <!-- Title and PDF Buttons -->
            <div class="mb-6">
              <div class="flex flex-wrap justify-between items-center gap-4">
                <h1 class="text-2xl font-bold" style="font-family: Arial, sans-serif; font-weight: 700; color: rgb(6, 59, 139);">
                  {productName}
                </h1>
                <div class="flex flex-wrap items-center gap-4">
                  <a 
                    href="/path/to/pdf.pdf" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors font-semibold text-sm"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    Fișa Tehnică
                  </a>
                </div>
              </div>
            </div>

            <!-- CERE OFERTĂ Button -->
            <div class="mb-6 flex justify-end">
              <button
                id="open-quote-modal"
                class="bg-primary-600 text-white px-6 py-3 font-semibold transition-all duration-200 hover:bg-primary-700 relative overflow-hidden"
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
                      <dt class="text-sm font-medium text-secondary-500">{spec.label}</dt>
                      <dd class="mt-1 text-sm text-secondary-900">{spec.value}</dd>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <!-- Description -->
            <div class="prose prose-lg max-w-none">
              <div class="text-secondary-700" style="font-family: Arial, sans-serif; font-size: 14px; line-height: 24px;">
                <p set:html={description} />
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
```

**Pași:**
1. Creează fișierul în `src/pages/produse/categorie/subcategorie/nume-produs.astro`
2. Definește datele produsului (nume, slug, imagini, specs, descriere)
3. Găsește categoria și produsul din `products.json`
4. Folosește `ProductGallery` pentru imagini
5. Adaugă butonul "CERE OFERTĂ" cu `QuoteModal`

---

## Componente Disponibile

### Layout & UI
- `Layout` - Layout principal cu SEO și meta tags
- `Container` - Container pentru conținut
- `Section` - Secțiune cu padding configurable
- `Breadcrumb` - Breadcrumb navigation

### Product Components
- `CategoryHero` - Header pentru categorii/produse
- `CategorySidebar` - Sidebar cu lista categoriilor
- `ProductSidebar` - Sidebar cu lista produselor din categorie
- `ProductGallery` - Galerie imagini produs
- `ProductListCard` - Card pentru listarea produselor
- `ProductSpecs` - Specificații tehnice
- `ProductFeatures` - Lista de caracteristici
- `QuoteModal` - Modal pentru cerere ofertă

### Home Components
- `Hero` - Hero section homepage
- `ProductGrid` - Grid categorii produse
- `AboutSection` - Secțiune despre
- `References` - Referințe/clienți
- `ContactFormHome` - Formular contact

---

## Convenții

### Nume Fișiere
- Folosește kebab-case: `nume-produs.astro`
- Pentru pagini principale: `index.astro` în folder
- URL-ul se generează automat din structura de directoare

### Structură Directoare
```
src/pages/
├── index.astro                    → /
├── contact.astro                  → /contact
├── categorii/
│   └── nume-categorie.astro       → /categorii/nume-categorie
└── produse/
    └── categorie/
        └── subcategorie/
            └── nume-produs.astro  → /produse/categorie/subcategorie/nume-produs
```

### Imagini
- Plasează imaginile în `public/images/`
- Folosește path-uri absolute: `/images/categorie/produs.jpg`
- Organizează pe categorii: `public/images/products-detail/categorie/`

### SEO
- Întotdeauna definește `title` și `description` în Layout
- Folosește meta tags din Layout pentru Open Graph
- Adaugă breadcrumbs pentru navigare

---

## Exemple Rapide

### Pagină Simplă Nouă
```bash
# Creează fișierul
src/pages/servicii.astro
```

### Pagină Categorie Nouă
```bash
# Creează fișierul
src/pages/categorii/noua-categorie.astro
# Adaugă categoria în src/data/products.json
```

### Pagină Produs Nouă
```bash
# Creează fișierul
src/pages/produse/categorie/subcategorie/noul-produs.astro
# Adaugă produsul în src/data/products.json
```

---

## Testare

După ce creezi o pagină nouă:

1. Rulează serverul de dezvoltare:
```bash
npm run dev
```

2. Verifică URL-ul în browser:
- `http://localhost:4321/nume-pagina`

3. Verifică că:
- Pagina se încarcă corect
- Imagini se afișează
- Links funcționează
- SEO meta tags sunt corecte

---

## Ajutor

Pentru întrebări sau probleme, verifică:
- `src/data/products.json` - structura datelor
- Paginile existente pentru exemple
- Componentele din `src/components/`
