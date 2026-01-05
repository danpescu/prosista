// Script pentru recrearea tuturor produselor cu traduceri din CSV
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Funcție pentru generare slug din text românesc
function generateSlugRO(text) {
  if (!text) return '';
  
  // Transliterare caractere românești
  const romanianMap = {
    'ă': 'a', 'â': 'a', 'î': 'i', 'ș': 's', 'ț': 't',
    'Ă': 'a', 'Â': 'a', 'Î': 'i', 'Ș': 's', 'Ț': 't'
  };
  
  let slug = text.toLowerCase();
  
  // Înlocuiește caracterele românești
  for (const [ro, en] of Object.entries(romanianMap)) {
    slug = slug.replace(new RegExp(ro, 'g'), en);
  }
  
  // Elimină caractere speciale și înlocuiește spațiile cu -
  slug = slug
    .replace(/[®©™]/g, '') // Elimină simboluri
    .replace(/[^a-z0-9]+/g, '-') // Înlocuiește non-alfanumerice cu -
    .replace(/^-+|-+$/g, ''); // Elimină - de la început și sfârșit
  
  return slug;
}

// Funcție pentru parsare CSV (noua structură cu 6 coloane)
function parseCSV(csvPath) {
  console.log(`📄 Citesc CSV-ul: ${csvPath}\n`);
  
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  // Sare peste header
  const dataLines = lines.slice(1);
  
  const productTranslations = new Map(); // Map pentru traduceri produse (product_en -> translation)
  const categoryTranslations = new Map(); // Map pentru traduceri categorii (category_en -> category_ro)
  const subcategoryTranslations = new Map(); // Map pentru traduceri subcategorii (subcategory_en -> subcategory_ro)
  
  for (const line of dataLines) {
    if (!line.trim()) continue;
    
    // Parse CSV line (noua structură: category_en, category_ro, subcategory_en, subcategory_ro, product_en, product_ro)
    const parts = line.split(',');
    if (parts.length >= 6) {
      const [category_en, category_ro, subcategory_en, subcategory_ro, product_en, product_ro] = parts;
      
      const catEn = category_en.trim();
      const catRo = category_ro.trim();
      const subcatEn = subcategory_en.trim();
      const subcatRo = subcategory_ro.trim();
      const prodEn = product_en.trim();
      const prodRo = product_ro.trim();
      
      // Salvează traducerea produsului
      productTranslations.set(prodEn, {
        category_en: catEn,
        category_ro: catRo,
        subcategory_en: subcatEn,
        subcategory_ro: subcatRo,
        product_en: prodEn,
        product_ro: prodRo
      });
      
      // Salvează traducerile categoriilor (dacă nu există deja)
      if (catEn && catRo && !categoryTranslations.has(catEn)) {
        categoryTranslations.set(catEn, catRo);
      }
      
      // Salvează traducerile subcategoriilor (dacă nu există deja și dacă nu e gol)
      if (subcatEn && subcatRo && !subcategoryTranslations.has(subcatEn)) {
        subcategoryTranslations.set(subcatEn, subcatRo);
      }
    }
  }
  
  console.log(`✓ Parsate ${productTranslations.size} traduceri produse din CSV`);
  console.log(`✓ Parsate ${categoryTranslations.size} traduceri categorii din CSV`);
  console.log(`✓ Parsate ${subcategoryTranslations.size} traduceri subcategorii din CSV\n`);
  
  return {
    products: productTranslations,
    categories: categoryTranslations,
    subcategories: subcategoryTranslations
  };
}

// Funcție pentru adaptare descriere în română (limbaj profesional)
// Traduce și adaptează textul din engleză în română păstrând un ton profesional
function adaptDescriptionToRomanian(description_en, product_name_ro) {
  if (!description_en || !description_en.trim()) {
    return '';
  }
  
  // Traducere simplificată - mapare cuvinte cheie comune
  const translations = {
    // Cuvinte tehnice
    'ceiling': 'tavan',
    'panel': 'panou',
    'system': 'sistem',
    'suspended': 'suspendat',
    'carrier': 'sistem de susținere',
    'profile': 'profil',
    'features': 'caracteristici',
    'installation': 'instalare',
    'acoustic': 'acustic',
    'wool': 'vată',
    'glass': 'sticlă',
    'mineral': 'minerală',
    'wood': 'lemn',
    'metal': 'metalic',
    'vinyl': 'vinil',
    'gypsum': 'gips',
    'baffle': 'deflector',
    'open cell': 'celule deschise',
    'mesh': 'plasă',
    
    // Fraze comune
    'Features of': 'Caracteristici',
    'can be manufactured': 'poate fi fabricat',
    'available in': 'disponibil în',
    'standard colors': 'culori standard',
    'easy to install': 'ușor de instalat',
    'provides': 'oferă',
    'designed for': 'proiectat pentru'
  };
  
  let translated = description_en;
  
  // Aplică traducerile de bază
  for (const [en, ro] of Object.entries(translations)) {
    const regex = new RegExp(en, 'gi');
    translated = translated.replace(regex, ro);
  }
  
  // Returnează textul tradus (versiune simplificată)
  // Pentru o traducere completă profesională, ar trebui folosit un serviciu de traducere
  return ''; // Lasă gol pentru a fi completat manual cu o traducere profesională
}

// Funcție pentru generare ID unic
function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

// Funcție principală pentru recreare produse
async function recreateProductsWithTranslations() {
  console.log('\n🚀 RECREARE PRODUSE CU TRADUCERI\n');
  console.log('='.repeat(60));
  
  // 1. Citește traducerile din CSV
  const csvPath = path.join(__dirname, '..', 'traduceri.csv');
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ Fișierul traduceri.csv nu există: ${csvPath}`);
    process.exit(1);
  }
  
  const translations = parseCSV(csvPath);
  
  // 2. Citește catalogul JSON
  const jsonPath = path.join(__dirname, '..', 'prosista_catalog_v2.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ Fișierul prosista_catalog_v2.json nu există: ${jsonPath}`);
    process.exit(1);
  }
  
  console.log(`📄 Citesc JSON-ul: ${jsonPath}\n`);
  const catalogData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const { arbore_categorii, produse } = catalogData;
  
  console.log(`✓ Încărcate ${produse.length} produse din JSON\n`);
  
  // 3. Procesează categoriile EXACT din structura JSON
  console.log('\n📌 PASUL 1: Procesare categorii și subcategorii din structura JSON\n');
  
  // Funcție pentru extragere slug din URL
  function extractSlugFromUrl(url) {
    if (!url) return null;
    const match = url.match(/\/category\/([^\/\s]+)/);
    if (match) {
      return match[1].trim().replace(/\s+$/, ''); // Elimină spațiile de la sfârșit
    }
    return null;
  }
  
  const categories = [];
  const categoryMap = new Map(); // Mapare nume_ro -> category object
  const categoryEnMap = new Map(); // Mapare nume_en -> category object
  const categoryIdMap = new Map(); // Mapare id -> category object (pentru acces rapid)
  
  // Folosește EXACT structura din arbore_categorii, dar cu traducerile din CSV
  for (const cat of arbore_categorii) {
    // JSON folosește "nume" (în engleză), traducerea în română vine din CSV
    const categoryNameEn = cat.nume;
    const categoryNameRo = translations.categories.get(categoryNameEn) || categoryNameEn;
    
    // Extrage slug-ul din URL sau generează din nume_en
    const categoryId = extractSlugFromUrl(cat.url) || generateSlugRO(categoryNameEn);
    const categorySlug = generateSlugRO(categoryNameRo);
    
    const categoryData = {
      id: categoryId,
      name: categoryNameRo,
      name_en: categoryNameEn,
      slug: categorySlug,
      slug_en: generateSlugRO(categoryNameEn),
      description: `${categoryNameRo} - Soluții profesionale.`,
      image: `/images/products/${categorySlug}.jpg`,
      meta_title: `${categoryNameRo} – PROSISTA`,
      meta_description: `${categoryNameRo} - PROSISTA`,
      subcategories: [],
      products: []
    };
    
    categories.push(categoryData);
    categoryMap.set(categoryNameRo, categoryData);
    categoryEnMap.set(categoryNameEn, categoryData);
    categoryIdMap.set(categoryId, categoryData);
    
    console.log(`✓ Categorie: ${categoryNameRo} (ID: ${categoryId})`);
    
    // Procesează subcategorii EXACT din structura JSON, dar cu traducerile din CSV
    for (const subcat of cat.subcategorii || []) {
      // JSON folosește "nume" (în engleză), traducerea în română vine din CSV
      const subcategoryNameEn = subcat.nume;
      const subcategoryNameRo = translations.subcategories.get(subcategoryNameEn) || subcategoryNameEn;
      
      // Extrage slug-ul din URL sau generează din nume_en
      const subcategoryId = extractSlugFromUrl(subcat.url) || generateSlugRO(subcategoryNameEn);
      const subcategorySlug = generateSlugRO(subcategoryNameRo);
      
      const subcategoryData = {
        id: subcategoryId,
        name: subcategoryNameRo,
        name_en: subcategoryNameEn,
        slug: subcategorySlug,
        slug_en: generateSlugRO(subcategoryNameEn),
        parent_id: categoryNameRo,
        products: []
      };
      
      categoryData.subcategories.push(subcategoryData);
      categoryMap.set(subcategoryNameRo, subcategoryData);
      categoryEnMap.set(subcategoryNameEn, subcategoryData);
      
      console.log(`  → Subcategorie: ${subcategoryNameRo} (ID: ${subcategoryId})`);
    }
  }
  
  console.log(`\n✓ Procesate ${categories.length} categorii principale\n`);
  
  // 4. Mapează produsele cu traducerile
  console.log('\n📌 PASUL 2: Mapare traduceri și creare produse\n');
  
  const allProducts = [];
  let mapped = 0;
  let unmapped = 0;
  
  for (const product of produse) {
    // JSON folosește "nume" (în engleză)
    const nume_en = product.nume;
    const translation = translations.products.get(nume_en);
    
    if (!translation) {
      console.warn(`⚠️  Nu s-a găsit traducere pentru: ${nume_en}`);
      unmapped++;
      // Folosește numele din JSON dacă nu există traducere
      const nume_ro = nume_en;
      const slug_ro = generateSlugRO(nume_ro);
      
      // Găsește categoria pentru a obține ID-ul
      let category = categoryEnMap.get(product.categorie);
      let categoryId = null;
      if (category) {
        categoryId = category.id;
      }
      
      const productData = {
        id: generateId(),
        name: nume_ro,
        name_en: nume_en,
        slug: slug_ro,
        slug_en: generateSlugRO(nume_en),
        full_description_ro: '',
        full_description_en: product.descriere || '',
        images: product.galerie_imagini && product.galerie_imagini.length > 0 
          ? product.galerie_imagini 
          : (product.imagine_principala ? [product.imagine_principala] : []),
        main_image: product.imagine_principala || (product.galerie_imagini && product.galerie_imagini[0]) || '',
        pdfs: (product.documente_pdf || []).map(doc => doc.url).filter(url => url && !url.includes('katalog.pdf')),
        category: product.categorie || '',
        subcategory: product.subcategorie || '',
        categories: categoryId ? [categoryId] : [],
        meta_title: `${nume_ro} – PROSISTA`,
        meta_description: `${nume_ro} - PROSISTA`
      };
      
      allProducts.push(productData);
      
      // Adaugă produsul la categoria/subcategoria corespunzătoare
      // Caută categoria după nume_en
      if (category) {
        if (product.subcategorie) {
          // Caută subcategoria
          const subcategory = category.subcategories.find(sub => 
            sub.name_en === product.subcategorie
          );
          if (subcategory) {
            subcategory.products.push({
              id: productData.id,
              name: productData.name,
              slug: productData.slug
            });
          } else {
            // Dacă nu există subcategoria, adaugă la categoria principală
            category.products.push({
              id: productData.id,
              name: productData.name,
              slug: productData.slug
            });
          }
        } else {
          category.products.push({
            id: productData.id,
            name: productData.name,
            slug: productData.slug
          });
        }
      } else {
        console.warn(`  ⚠️  Categorie negăsită pentru ${nume_ro}: ${product.categorie}`);
      }
      
      continue;
    }
    
    // Folosește traducerea din CSV
    const nume_ro = translation.product_ro;
    const slug_ro = generateSlugRO(nume_ro);
    
    // Adaptează descrierea (pentru moment lasă goală pentru completare manuală)
    const descriere_ro = adaptDescriptionToRomanian(product.descriere, nume_ro);
    
    // Găsește categoria pentru a obține ID-ul
    const category = categoryEnMap.get(translation.category_en);
    let categoryId = null;
    if (category) {
      categoryId = category.id;
    }
    
    // Pregătește datele pentru produs
    const productData = {
      id: generateId(),
      name: nume_ro,
      name_en: nume_en,
      slug: slug_ro,
      slug_en: generateSlugRO(nume_en),
      full_description_ro: descriere_ro,
      full_description_en: product.descriere || '',
      images: product.galerie_imagini && product.galerie_imagini.length > 0 
        ? product.galerie_imagini 
        : (product.imagine_principala ? [product.imagine_principala] : []),
      main_image: product.imagine_principala || (product.galerie_imagini && product.galerie_imagini[0]) || '',
      pdfs: (product.documente_pdf || []).map(doc => doc.url).filter(url => url && !url.includes('katalog.pdf')),
      category: translation.category_en || '',
      subcategory: translation.subcategory_en || '',
      categories: categoryId ? [categoryId] : [],
      meta_title: `${nume_ro} – PROSISTA`,
      meta_description: `${nume_ro} - PROSISTA`
    };
    
    allProducts.push(productData);
    mapped++;
    
    // Adaugă produsul la categoria/subcategoria corespunzătoare
    // Caută categoria după nume_en (din CSV)
    if (!category) {
      console.warn(`  ⚠️  Categorie negăsită pentru ${nume_ro}: "${translation.category_en}" (nu există în categoryEnMap)`);
    }
    if (category) {
      if (translation.subcategory_en) {
        const subcategory = category.subcategories.find(sub => sub.name_en === translation.subcategory_en);
        if (subcategory) {
          subcategory.products.push({
            id: productData.id,
            name: productData.name,
            slug: productData.slug
          });
        } else {
          // Dacă nu există subcategoria, adaugă la categoria principală
          category.products.push({
            id: productData.id,
            name: productData.name,
            slug: productData.slug
          });
        }
      } else {
        category.products.push({
          id: productData.id,
          name: productData.name,
          slug: productData.slug
        });
      }
    }
    
    console.log(`✓ ${mapped}. ${nume_ro} → slug: ${slug_ro}`);
  }
  
  console.log(`\n✓ Mapate ${mapped} produse`);
  console.log(`⚠️  Nemapate/fără traducere ${unmapped} produse\n`);
  
  // Debug: Verifică câte produse sunt în categorii
  console.log('\n🔍 Debug - Produse în categorii:');
  categories.forEach(cat => {
    const totalInSubcats = cat.subcategories.reduce((sum, sub) => sum + sub.products.length, 0);
    console.log(`  ${cat.name}: ${cat.products.length} produse directe, ${totalInSubcats} în subcategorii`);
  });
  console.log('');
  
  // 5. Salvează în prosista_products_with_translations.json (intermediar)
  console.log('\n📌 PASUL 3: Salvare date în prosista_products_with_translations.json\n');
  
  const outputIntermediatePath = path.join(__dirname, '..', 'prosista_products_with_translations.json');
  const intermediateData = {
    categories: categories.map(cat => ({
      id: cat.id,
      name_ro: cat.name,
      name_en: cat.name_en,
      slug_ro: cat.slug,
      slug_en: cat.slug_en,
      parent_id: null,
      meta_title_ro: cat.meta_title,
      meta_description_ro: cat.meta_description
    })),
    products: allProducts,
    metadata: {
      totalCategories: categories.length,
      totalProducts: allProducts.length,
      mappedProducts: mapped,
      unmappedProducts: unmapped,
      updatedAt: new Date().toISOString()
    }
  };
  
  fs.writeFileSync(outputIntermediatePath, JSON.stringify(intermediateData, null, 2), 'utf-8');
  console.log(`✓ Salvat: ${outputIntermediatePath}\n`);
  
  // 5b. Salvează în prosista_products_processed.json (necesar pentru generate-product-pages-from-json.js)
  const processedPath = path.join(__dirname, '..', 'prosista_products_processed.json');
  const processedData = {
    categories: categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      parent_id: null,
      description: cat.description || '',
      image: cat.image,
      meta_title: cat.meta_title,
      meta_description: cat.meta_description
    })),
    products: allProducts.map(p => ({
      id: p.id,
      name: p.name,
      name_en: p.name_en,
      slug: p.slug,
      slug_en: p.slug_en,
      description: p.full_description_ro || '',
      full_description_ro: p.full_description_ro || '',
      full_description_en: p.full_description_en || '',
      main_image: p.main_image,
      images: p.images,
      pdfs: p.pdfs,
      category: p.category || '',
      subcategory: p.subcategory || '',
      categories: p.categories || [],
      meta_title: p.meta_title,
      meta_description: p.meta_description
    })),
    metadata: {
      totalCategories: categories.length,
      totalProducts: allProducts.length,
      updatedAt: new Date().toISOString()
    }
  };
  
  fs.writeFileSync(processedPath, JSON.stringify(processedData, null, 2), 'utf-8');
  console.log(`✓ Salvat: prosista_products_processed.json\n`);
  
  // 6. Salvează în src/data/products.json (structura finală pentru Astro)
  console.log('\n📌 PASUL 4: Salvare în src/data/products.json\n');
  
  // Creează backup
  const productsJsonPath = path.join(__dirname, '..', 'src', 'data', 'products.json');
  if (fs.existsSync(productsJsonPath)) {
    const backupPath = path.join(__dirname, '..', 'src', 'data', 'products.json.backup');
    fs.copyFileSync(productsJsonPath, backupPath);
    console.log(`✓ Backup creat: products.json.backup\n`);
  }
  
  // Creează un map pentru acces rapid la produse după ID
  const productsMap = new Map();
  allProducts.forEach(product => {
    productsMap.set(product.id, product);
  });
  
  // Adaugă datele complete ale produselor în categorii și subcategorii
  const categoriesWithProducts = categories.map(cat => {
    const categoryWithProducts = {
      ...cat,
      products: cat.products.map(p => {
        const fullProduct = productsMap.get(p.id);
        return fullProduct ? {
          id: fullProduct.id,
          name: fullProduct.name,
          slug: fullProduct.slug,
          description: fullProduct.full_description_ro || '',
          main_image: fullProduct.main_image,
          images: fullProduct.images,
          pdfs: fullProduct.pdfs,
          meta_title: fullProduct.meta_title,
          meta_description: fullProduct.meta_description
        } : p;
      }),
      subcategories: cat.subcategories.map(sub => ({
        ...sub,
        products: sub.products.map(p => {
          const fullProduct = productsMap.get(p.id);
          return fullProduct ? {
            id: fullProduct.id,
            name: fullProduct.name,
            slug: fullProduct.slug,
            description: fullProduct.full_description_ro || '',
            main_image: fullProduct.main_image,
            images: fullProduct.images,
            pdfs: fullProduct.pdfs,
            meta_title: fullProduct.meta_title,
            meta_description: fullProduct.meta_description
          } : p;
        })
      }))
    };
    return categoryWithProducts;
  });
  
  // Salvează structura finală
  const finalData = {
    categories: categoriesWithProducts
  };
  
  fs.mkdirSync(path.dirname(productsJsonPath), { recursive: true });
  fs.writeFileSync(productsJsonPath, JSON.stringify(finalData, null, 2), 'utf-8');
  console.log(`✓ Salvat: src/data/products.json\n`);
  
  // 7. Afișează sumar
  console.log('\n' + '='.repeat(60));
  console.log('✅ RECREARE PRODUSE COMPLETĂ!\n');
  console.log(`  ✓ Categorii procesate: ${categories.length}`);
  console.log(`  ✓ Produse mapate cu traduceri: ${mapped}`);
  console.log(`  ✓ Produse fără traducere: ${unmapped}`);
  console.log(`  ✓ Total produse: ${allProducts.length}`);
  console.log('\n📝 NOTĂ: Descrierile în română au rămas goale pentru completare manuală.');
  console.log('    Editează fișierul prosista_products_with_translations.json pentru a adăuga descrierile.');
  console.log('='.repeat(60) + '\n');
}

// Rulează scriptul
recreateProductsWithTranslations().catch(error => {
  console.error('❌ Eroare fatală:', error);
  process.exit(1);
});
