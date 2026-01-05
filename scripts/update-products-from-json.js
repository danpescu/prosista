// Script pentru procesare JSON folosind datele deja traduse în română
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Funcție pentru generare slug din text
function generateSlug(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[®©™]/g, '') // Elimină caractere speciale de marcă
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Funcție pentru extragere conținut din HTML (doar pentru fallback)
function extractContentFromHTML(html) {
  if (!html || typeof html !== 'string') {
    return { description: '', descriptionHTML: '', specs: [] };
  }
  
  try {
    // Extrage text simplu
    const textOnly = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return {
      description: textOnly.substring(0, 500),
      descriptionHTML: html,
      specs: []
    };
  } catch (error) {
    return { description: '', descriptionHTML: '', specs: [] };
  }
}

// Construiește ierarhia categoriilor
function buildCategoryHierarchy(categories) {
  const categoryMap = new Map();
  const rootCategories = [];
  
  // Creează map pentru categorii
  categories.forEach(cat => {
    categoryMap.set(cat.id, {
      ...cat,
      children: [],
      products: []
    });
  });
  
  // Construiește ierarhia
  categories.forEach(cat => {
    const category = categoryMap.get(cat.id);
    
    if (!cat.parent_id) {
      rootCategories.push(category);
    } else {
      // Caută părintele după ID sau nume
      const parent = categoryMap.get(cat.parent_id) || 
        Array.from(categoryMap.values()).find(c => c.name_en === cat.parent_id || c.name_ro === cat.parent_id);
      
      if (parent) {
        parent.children.push(category);
      } else {
        // Dacă nu găsește părintele, adaugă la root
        rootCategories.push(category);
      }
    }
  });
  
  return { categoryMap, rootCategories };
}

function processJSON() {
  console.log('Încep procesarea JSON...\n');
  
  // Citește JSON
  const jsonPath = path.join(__dirname, '..', 'prosista_products.json');
  const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  
  const { categories: rawCategories, products: rawProducts } = rawData;
  
  // Construiește ierarhia categoriilor
  const { categoryMap, rootCategories } = buildCategoryHierarchy(rawCategories);
  
  // Procesează categorii (folosește direct datele din română)
  console.log('Procesez categorii...');
  const processedCategories = [];
  const categoryNameMap = new Map(); // Map pentru ID -> nume în română
  
  for (let i = 0; i < rawCategories.length; i++) {
    const category = rawCategories[i];
    console.log(`  [${i + 1}/${rawCategories.length}] ${category.name_ro || category.name_en}...`);
    
    // Folosește direct datele din română
    const nameRo = category.name_ro || category.name_en;
    if (!category.name_ro) {
      console.warn(`    ⚠ Lipsește name_ro pentru: ${category.name_en}, folosesc name_en`);
    }
    
    // Folosește slug_ro dacă există, altfel generează din name_ro
    const slugRo = category.slug_ro || generateSlug(nameRo);
    
    // Salvează numele pentru mapare
    categoryNameMap.set(category.id, nameRo);
    
    processedCategories.push({
      id: category.id,
      name: nameRo,
      slug: slugRo,
      parent_id: category.parent_id, // Va fi înlocuit mai jos cu numele părintelui
      description: '', // Va fi completat mai târziu
      image: `/images/products/${slugRo}.jpg`,
      meta_title: category.meta_title_ro || nameRo,
      meta_description: category.meta_description_ro || `${nameRo} - PROSISTA`
    });
  }
  
  // Înlocuiește parent_id cu numele părintelui în română
  console.log('\nActualizez parent_id cu numele părinților...');
  for (const category of processedCategories) {
    if (category.parent_id) {
      const parentName = categoryNameMap.get(category.parent_id);
      if (parentName) {
        category.parent_id = parentName;
      } else {
        console.warn(`⚠ Părinte negăsit pentru ${category.name}: ${category.parent_id}`);
        category.parent_id = null;
      }
    }
  }
  
  // Procesează produse (folosește direct datele din română)
  console.log(`\nProcesez produse (${rawProducts.length} total)...`);
  const processedProducts = [];
  
  for (let i = 0; i < rawProducts.length; i++) {
    const product = rawProducts[i];
    console.log(`\n[${i + 1}/${rawProducts.length}] ${product.name_ro || product.name_en}...`);
    
    // Folosește direct datele din română
    const nameRo = product.name_ro || product.name_en;
    if (!product.name_ro) {
      console.warn(`    ⚠ Lipsește name_ro pentru: ${product.name_en}, folosesc name_en`);
    }
    
    // Folosește slug_ro dacă există, altfel slug_en, altfel generează din name_ro
    const slugRo = product.slug_ro || product.slug_en || generateSlug(nameRo);
    
    // Folosește direct full_description_ro
    let descriptionRoHTML = '';
    let descriptionRo = '';
    
    // Verifică dacă full_description_ro este doar numele produsului (nu o descriere reală)
    const isOnlyName = product.full_description_ro && (
      product.full_description_ro.trim() === `<p>${nameRo}</p>` ||
      product.full_description_ro.trim() === nameRo ||
      product.full_description_ro.length < 50
    );
    
    if (product.full_description_ro && !isOnlyName) {
      descriptionRo = product.full_description_ro;
      
      // Dacă descrierea conține HTML, folosește-l direct
      if (descriptionRo.includes('<') && descriptionRo.includes('>')) {
        descriptionRoHTML = descriptionRo;
      } else {
        // Convertește textul simplu în paragrafe HTML
        const paragraphs = descriptionRo.split('\n\n').filter(p => p.trim());
        descriptionRoHTML = paragraphs.map(p => `<p>${p.trim()}</p>`).join('\n');
      }
    }
    // Dacă nu există descriere sau este doar numele, lasăm gol (nu generăm descriere default)
    
    // Filtrează PDF-uri (exclude katalog.pdf)
    const pdfs = (product.pdfs || [])
      .filter(pdf => !pdf.includes('katalog.pdf'))
      .filter(pdf => pdf && pdf.trim() !== '');
    
    // Extrage specificații tehnice (dacă există)
    const technicalSpecs = [];
    // Dacă există specificații în JSON, le folosim direct
    // Altfel, le lăsăm goale
    
    processedProducts.push({
      id: product.id,
      name: nameRo,
      slug: slugRo,
      description: descriptionRoHTML || descriptionRo || '',
      descriptionHTML: descriptionRoHTML || '',
      images: product.images || [],
      main_image: product.main_image || '',
      pdfs: pdfs,
      hasDrawing: pdfs.some(pdf => pdf.includes('teknik-cizim') || pdf.includes('drawing')),
      hasDataSheet: pdfs.some(pdf => pdf.includes('teknik-foy') || pdf.includes('data-sheet') || pdf.includes('tds')),
      categories: product.categories || [],
      specs: technicalSpecs,
      meta_title: product.meta_title_ro || nameRo,
      meta_description: product.meta_description_ro || `${nameRo} - PROSISTA`
    });
    
    // Adaugă produsul la categoriile sale
    product.categories?.forEach(catId => {
      const cat = categoryMap.get(catId);
      if (cat) {
        cat.products.push({
          id: product.id,
          name: nameRo,
          slug: slugRo
        });
      }
    });
  }
  
  // Construiește structura finală pentru products.json
  const outputStructure = {
    categories: []
  };
  
  // Adaugă categorii principale (fără parent)
  for (const rootCat of rootCategories) {
    const processedCat = processedCategories.find(c => c.id === rootCat.id);
    if (!processedCat) continue;
    
    const categoryData = {
      id: processedCat.id,
      name: processedCat.name,
      slug: processedCat.slug,
      description: '', // Va fi generat mai târziu
      image: processedCat.image,
      meta_title: processedCat.meta_title,
      meta_description: processedCat.meta_description,
      subcategories: [],
      products: []
    };
    
    // Adaugă subcategorii (children)
    for (const child of rootCat.children) {
      const processedChild = processedCategories.find(c => c.id === child.id);
      if (!processedChild) continue;
      
      const subcategoryData = {
        id: processedChild.id,
        name: processedChild.name,
        slug: processedChild.slug,
        parent_id: processedChild.parent_id, // Numele părintelui în română
        products: child.products.map(p => ({
          id: p.id,
          name: p.name,
          slug: p.slug
        }))
      };
      
      categoryData.subcategories.push(subcategoryData);
    }
    
    // Adaugă produse directe (dacă nu sunt în subcategorii)
    const directProducts = rootCat.products.filter(p => {
      // Verifică dacă produsul nu e deja într-o subcategorie
      return !rootCat.children.some(child => 
        child.products.some(cp => cp.id === p.id)
      );
    });
    
    categoryData.products = directProducts.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug
    }));
    
    outputStructure.categories.push(categoryData);
  }
  
  // Salvează JSON procesat
  const outputPath = path.join(__dirname, '..', 'prosista_products_processed.json');
  fs.writeFileSync(
    outputPath,
    JSON.stringify({
      categories: processedCategories,
      products: processedProducts,
      structure: outputStructure
    }, null, 2),
    'utf-8'
  );
  
  console.log(`\n✓ Procesare completă!`);
  console.log(`✓ Categorii procesate: ${processedCategories.length}`);
  console.log(`✓ Produse procesate: ${processedProducts.length}`);
  console.log(`✓ JSON salvat în: ${outputPath}`);
  
  return { processedCategories, processedProducts, outputStructure };
}

// Rulează procesarea
processJSON();
