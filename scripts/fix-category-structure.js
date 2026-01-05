// Script pentru fixarea structurii categoriilor - doar 8 categorii principale
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Definiție categoriile principale (8 categorii)
const MAIN_CATEGORIES = {
  'metal-ceiling-systems': {
    id: 'metal-ceiling-systems',
    name_en: 'Metal Ceiling Systems',
    name_ro: 'Sisteme de tavane metalice',
    subcategories: [
      'baffle-linear-ceiling',
      'open-cell-ceiling',
      'expanded-mesh-ceiling',
      'cassette-type-ceiling',
      'linear-plank-ceiling'
    ]
  },
  'wooden-ceiling-and-wall-systems': {
    id: 'wooden-ceiling-and-wall-systems',
    name_en: 'Wooden Ceiling and Wall',
    name_ro: 'Sisteme din lemn pentru tavan si perete',
    subcategories: []
  },
  'fabric-covered-acoustic-panels': {
    id: 'fabric-covered-acoustic-panels',
    name_en: 'Fabric Covered Acoustic Panels',
    name_ro: 'Panouri acustice placate cu material textil',
    subcategories: []
  },
  'mineral-wool-panels': {
    id: 'mineral-wool-panels',
    name_en: 'Mineral Wool Panels',
    name_ro: 'Panouri din vata minerala',
    subcategories: [
      'knauf-amf',
      'ecophon',
      'eurocoustic'
    ]
  },
  'wood-wool-panels': {
    id: 'wood-wool-panels',
    name_en: 'Wood Wool Panels',
    name_ro: 'Panouri din vata de lemn',
    subcategories: [
      'knauf-heradesign',
      'ecophon-saga'
    ]
  },
  'carrier-systems': {
    id: 'carrier-systems',
    name_en: 'Carrier Systems',
    name_ro: 'Sisteme de sustinere',
    subcategories: []
  },
  'vinyl-coated-gypsum-panel': {
    id: 'vinyl-coated-gypsum-panel',
    name_en: 'Vinyl Coated Gypsum Panel',
    name_ro: 'Panouri gips cu vinil',
    subcategories: []
  },
  'gypsum-panel-profiles': {
    id: 'gypsum-panel-profiles',
    name_en: 'Gypsum Panel Profiles',
    name_ro: 'Profile pentru panouri din gips-carton',
    subcategories: []
  }
};

// Funcție pentru generare slug în română
function slugifyRO(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimină diacriticele
    .replace(/[^a-z0-9]+/g, '-') // Înlocuiește caracterele non-alfanumerice cu -
    .replace(/^-+|-+$/g, ''); // Elimină - de la început și sfârșit
}

function fixCategoryStructure() {
  console.log('Fixez structura categoriilor...\n');
  
  // Citește prosista_products_processed.json (după update-products-from-json.js)
  const processedPath = path.join(__dirname, '..', 'prosista_products_processed.json');
  
  if (!fs.existsSync(processedPath)) {
    console.error('❌ Fișierul prosista_products_processed.json nu există!');
    console.error('   Rulează mai întâi: node scripts/update-products-from-json.js');
    process.exit(1);
  }
  
  const processedData = JSON.parse(fs.readFileSync(processedPath, 'utf-8'));
  const { categories: rawCategories, products: rawProducts } = processedData;
  
  // Creează map pentru categorii (folosește datele procesate)
  const categoryMap = new Map();
  rawCategories.forEach(cat => {
    categoryMap.set(cat.id, {
      ...cat,
      name_ro: cat.name || cat.name_ro,
      slug: cat.slug || cat.slug_en
    });
  });
  
  // Construiește structura corectă
  const mainCategories = [];
  const processedProductIds = new Set(); // Track products already added to avoid duplicates
  
  for (const [mainId, mainConfig] of Object.entries(MAIN_CATEGORIES)) {
    const mainCat = categoryMap.get(mainId);
    if (!mainCat) {
      console.warn(`⚠ Categorie principală negăsită: ${mainId}`);
      continue;
    }
    
    // Creează categoria principală
    const mainCategory = {
      id: mainCat.id,
      name: mainCat.name_ro || mainCat.name_en,
      slug: mainCat.slug,
      name_en: mainCat.name_en,
      slug_en: mainCat.slug,
      description: `${mainCat.name_ro || mainCat.name_en} - Soluții profesionale.`,
      image: `/images/products/${mainCat.slug}.jpg`,
      subcategories: [],
      products: []
    };
    
    // Adaugă subcategorii
    for (const subId of mainConfig.subcategories) {
      // Caută subcategoria în categoryMap (poate avea spații în id)
      let subCat = categoryMap.get(subId);
      if (!subCat) {
        // Încearcă să găsească cu trim (pentru spații)
        for (const [catId, cat] of categoryMap.entries()) {
          if (catId.trim() === subId || cat.id?.trim() === subId) {
            subCat = cat;
            break;
          }
        }
      }
      if (subCat) {
        mainCategory.subcategories.push({
          id: subId, // Folosește subId din MAIN_CATEGORIES, nu din categoryMap (pentru a evita spațiile)
          name: subCat.name_ro || subCat.name_en || subCat.name,
          slug: subCat.slug || subCat.slug_en,
          parent_id: mainCategory.name,
          products: []
        });
      } else {
        console.warn(`⚠ Subcategorie negăsită: ${subId} pentru categoria ${mainId}`);
      }
    }
    
    // Adaugă produse la categoria principală sau subcategorii
    rawProducts.forEach(product => {
      const productSlug = product.slug || product.slug_en || '';
      const productSlugLower = productSlug.toLowerCase();
      
      // EXCLUDE: Nu adăuga subcategoriile ca produse (verifică și slug-ul)
      const isSubcategory = mainConfig.subcategories.includes(product.id) || 
                            mainConfig.subcategories.includes(product.slug) ||
                            mainConfig.subcategories.some(subId => {
                              const subCat = categoryMap.get(subId);
                              return subCat && (subCat.slug === productSlug || subCat.slug === product.id);
                            });
      if (isSubcategory) {
        return; // Skip subcategoriile
      }
      
      // EXCLUDE: Nu adăuga categoriile principale ca produse (verifică și slug-ul și id-ul)
      // IMPORTANT: Exclude categoriile principale prin ID SAU dacă slug-ul produsului este același cu ID-ul categoriei
      // (dar permite produse cu același slug ca slug-ul categoriei, ex: vinyl-coated-gypsum-panel)
      const isMainCategory = Object.keys(MAIN_CATEGORIES).some(catId => {
        const cat = categoryMap.get(catId);
        if (!cat) return false;
        // Verifică dacă produsul este categoria principală (prin id sau dacă slug-ul produsului = ID-ul categoriei)
        const isCategoryById = cat.id === product.id || 
                               cat.slug === product.id || 
                               catId === product.id ||
                               (MAIN_CATEGORIES[catId] && MAIN_CATEGORIES[catId].id === product.id);
        // Verifică dacă slug-ul produsului este același cu ID-ul categoriei (ex: wood-wool-panels = wood-wool-panels)
        const isCategoryBySlug = productSlugLower === catId || productSlugLower === cat.id;
        return isCategoryById || isCategoryBySlug;
      });
      if (isMainCategory) {
        return; // Skip categoriile principale
      }
      
      const productCategories = product.categories || [];
      
      // Corectare automată pentru produsele de tip "carrier" / "sustinere"
      let shouldAddToThisCategory = false;
      const productNameLower = (product.name || '').toLowerCase();
      // productSlugLower este deja definit mai sus
      
      if (mainId === 'carrier-systems') {
        // Dacă produsul conține "carrier", "sustinere", "t24", "t15" în nume sau slug, îl atribuim categoriei carrier-systems
        // Prioritizează această categorie peste alte categorii
        if (productNameLower.includes('sustinere') || productNameLower.includes('carrier') || 
            productSlugLower.includes('sustinere') || productSlugLower.includes('carrier') ||
            (productSlugLower.includes('t24') && (productSlugLower.includes('sustinere') || productSlugLower.includes('sistem'))) || 
            (productSlugLower.includes('t15') && (productSlugLower.includes('sustinere') || productSlugLower.includes('sistem')))) {
          shouldAddToThisCategory = true;
        }
      } else if (mainId === 'wooden-ceiling-and-wall-systems') {
        // Produse din lemn: verifică dacă conține "lemn", "wood", "acustic" + "lemn"
        if (productNameLower.includes('lemn') || productNameLower.includes('wood') ||
            productSlugLower.includes('lemn') || productSlugLower.includes('wood') ||
            (productNameLower.includes('acustic') && productNameLower.includes('lemn')) ||
            (productNameLower.includes('acoustic') && productNameLower.includes('wood'))) {
          shouldAddToThisCategory = true;
        }
      } else if (mainId === 'fabric-covered-acoustic-panels') {
        // Produse acustice cu material textil: verifică dacă conține "acustic", "acoustic", "vata", "textil", "fabric", "glass-wool"
        // Include: acoustic-glass-wool-baffle, acoustic-glass-wool-canopy, glass-wool-wall-panels, glass-wool-ceiling-panels
        const isAcousticGlassWool = (productNameLower.includes('acustic') || productNameLower.includes('acoustic')) &&
            (productNameLower.includes('vata') || productNameLower.includes('wool') ||
             productSlugLower.includes('vata') || productSlugLower.includes('wool') ||
             productSlugLower.includes('glass-wool'));
        const isGlassWoolPanel = productSlugLower.includes('glass-wool') && 
            (productSlugLower.includes('wall-panels') || productSlugLower.includes('ceiling-panels') ||
             productNameLower.includes('panou') || productNameLower.includes('panel'));
        
        if (isAcousticGlassWool || isGlassWoolPanel) {
          // Exclude produsele din lemn sau vinil
          if (!productNameLower.includes('lemn') && !productNameLower.includes('wood') &&
              !productNameLower.includes('vinil') && !productNameLower.includes('vinyl') &&
              !productSlugLower.includes('lemn') && !productSlugLower.includes('wood') &&
              !productSlugLower.includes('vinil') && !productSlugLower.includes('vinyl')) {
            shouldAddToThisCategory = true;
          }
        }
      } else if (mainId === 'gypsum-panel-profiles') {
        // Produse pentru profile gips-carton: verifică dacă conține "profile" și "gips"/"gypsum"
        // Exclude produsele cu vinil - aparțin categoriei vinyl-coated-gypsum-panel
        // Exclude categoriile principale - nu sunt produse
        const isVinyl = productSlugLower === 'vinyl-coated-gypsum-panel' || productSlugLower === 'vinyl-acoustic-panel' ||
            (productSlugLower.includes('vinyl') && (productSlugLower.includes('gypsum') || productSlugLower.includes('acoustic'))) ||
            (productNameLower.includes('vinil') && (productNameLower.includes('gips') || productNameLower.includes('acustic'))) ||
            (productNameLower.includes('vinyl') && (productNameLower.includes('gypsum') || productNameLower.includes('acoustic')));
        
        // Exclude categoriile principale
        const isMainCategoryProduct = Object.keys(MAIN_CATEGORIES).some(catId => {
          const cat = categoryMap.get(catId);
          return cat && (cat.id === product.id || cat.slug === product.id);
        });
        
        if (!isVinyl && !isMainCategoryProduct) {
          // Verifică dacă conține "profile" și "gips"/"gypsum" sau dacă slug-ul este gypsum-board-profiles/gypsum-panel-profiles
          // Include și produse HERADESIGN cu "profile" în nume
          const hasProfile = productNameLower.includes('profile') || productNameLower.includes('profil') || productSlugLower.includes('profile') || productSlugLower.includes('profil');
          const hasGypsum = productNameLower.includes('gips') || productNameLower.includes('gypsum') || productSlugLower.includes('gips') || productSlugLower.includes('gypsum');
          const isGypsumProfile = productSlugLower === 'gypsum-board-profiles' || productSlugLower === 'gypsum-panel-profiles' ||
              (hasProfile && hasGypsum) ||
              (hasProfile && productNameLower.includes('heradesign')); // Include HERADESIGN profile products
          
          if (isGypsumProfile) {
            shouldAddToThisCategory = true;
          }
        }
      } else if (mainId === 'metal-ceiling-systems') {
        // Exclude produsele care aparțin altor categorii principale (gypsum-panel-profiles, vinyl-coated-gypsum-panel, etc.)
        if (productSlugLower === 'gypsum-board-profiles' || productSlugLower === 'gypsum-panel-profiles' ||
            productNameLower.includes('profile') && (productNameLower.includes('gips') || productNameLower.includes('gypsum'))) {
          shouldAddToThisCategory = false;
        } else if (productSlugLower === 'vinyl-coated-gypsum-panel' || productSlugLower === 'vinyl-acoustic-panel' ||
            (productSlugLower.includes('vinyl') && (productSlugLower.includes('gypsum') || productSlugLower.includes('acoustic'))) ||
            (productNameLower.includes('vinil') && (productNameLower.includes('gips') || productNameLower.includes('acustic'))) ||
            (productNameLower.includes('vinyl') && (productNameLower.includes('gypsum') || productNameLower.includes('acoustic')))) {
          // Exclude produsele cu vinil - aparțin categoriei vinyl-coated-gypsum-panel
          shouldAddToThisCategory = false;
        } else {
          // Pentru metal-ceiling-systems, verifică dacă produsul aparține categoriei SAU dacă slug-ul indică o subcategorie
          // EXCEPT: exclude produsele cu vinil chiar dacă au categoria "baffle-linear-ceiling" în JSON
          const isVinylProduct = productSlugLower === 'vinyl-coated-gypsum-panel' || productSlugLower === 'vinyl-acoustic-panel' ||
              (productSlugLower.includes('vinyl') && (productSlugLower.includes('gypsum') || productSlugLower.includes('acoustic'))) ||
              (productNameLower.includes('vinil') && (productNameLower.includes('gips') || productNameLower.includes('acustic'))) ||
              (productNameLower.includes('vinyl') && (productNameLower.includes('gypsum') || productNameLower.includes('acoustic')));
          
          if (!isVinylProduct) {
            shouldAddToThisCategory = productCategories.includes(mainId) || productCategories.includes(mainId.trim());
            
            // Dacă produsul are slug-ul unei subcategorii SAU categoria este metal-ceiling-systems, îl adaugă
            const subcategorySlugs = ['baffle-linear-ceiling', 'open-cell-ceiling', 'expanded-mesh-ceiling', 'cassette-type-ceiling', 'linear-plank-ceiling'];
            if (subcategorySlugs.some(subSlug => productSlugLower === subSlug || productSlugLower.includes(subSlug))) {
              shouldAddToThisCategory = true;
            }
            
            // Dacă produsul are categoria "baffle-linear-ceiling" sau alte subcategorii, îl adaugă la metal-ceiling-systems
            if (productCategories.some(cat => subcategorySlugs.includes(cat.trim()))) {
              shouldAddToThisCategory = true;
            }
          } else {
            shouldAddToThisCategory = false; // Exclude produsele cu vinil chiar dacă au categoria "baffle-linear-ceiling" în JSON
          }
        }
      } else if (mainId === 'mineral-wool-panels') {
        // Pentru mineral-wool-panels, verifică dacă produsul aparține categoriei SAU dacă este o subcategorie
        shouldAddToThisCategory = productCategories.includes(mainId) || productCategories.includes(mainId.trim());
        
        // Dacă produsul este o subcategorie (knauf-amf, ecophon, eurocoustic), îl adaugă
        const subcategorySlugs = ['knauf-amf', 'ecophon', 'eurocoustic'];
        if (subcategorySlugs.some(subSlug => productSlugLower === subSlug || productSlugLower.includes(subSlug))) {
          shouldAddToThisCategory = true;
        }
      } else if (mainId === 'wood-wool-panels') {
        // Pentru wood-wool-panels, verifică dacă produsul aparține categoriei SAU dacă este o subcategorie
        shouldAddToThisCategory = productCategories.includes(mainId) || productCategories.includes(mainId.trim());
        
        // Dacă produsul este o subcategorie (knauf-heradesign, ecophon-saga), îl adaugă
        const subcategorySlugs = ['knauf-heradesign', 'ecophon-saga'];
        if (subcategorySlugs.some(subSlug => productSlugLower === subSlug || productSlugLower.includes(subSlug))) {
          shouldAddToThisCategory = true;
        }
      } else if (mainId === 'vinyl-coated-gypsum-panel') {
        // Pentru vinyl-coated-gypsum-panel, verifică dacă produsul conține "vinil", "vinyl", "gips", "gypsum"
        // Include: vinyl-coated-gypsum-panel, vinyl-acoustic-panel
        const isVinylGypsum = productSlugLower === 'vinyl-coated-gypsum-panel' ||
            (productSlugLower.includes('vinyl') && productSlugLower.includes('gypsum')) ||
            (productNameLower.includes('gips') && productNameLower.includes('vinil')) ||
            (productNameLower.includes('gypsum') && productNameLower.includes('vinyl'));
        const isVinylAcoustic = productSlugLower === 'vinyl-acoustic-panel' ||
            (productSlugLower.includes('vinyl') && productSlugLower.includes('acoustic')) ||
            (productNameLower.includes('vinil') && productNameLower.includes('acustic')) ||
            (productNameLower.includes('vinyl') && productNameLower.includes('acoustic'));
        
        if (isVinylGypsum || isVinylAcoustic) {
          // Exclude produsele din alte categorii (lemn, etc.)
          if (!productNameLower.includes('lemn') && !productNameLower.includes('wood') &&
              !productSlugLower.includes('lemn') && !productSlugLower.includes('wood')) {
            shouldAddToThisCategory = true;
          }
        }
      } else {
        // Pentru alte categorii, verifică dacă produsul aparține categoriei
        shouldAddToThisCategory = productCategories.includes(mainId) || productCategories.includes(mainId.trim());
      }
      
      // Verifică mai întâi dacă aparține unei subcategorii (prioritate)
      // IMPORTANT: Nu folosim productCategories pentru că multe produse au categorii greșite în JSON
      // Folosim doar maparea bazată pe slug-uri și nume
      let addedToSubcategory = false;
      
      // Doar pentru metal-ceiling-systems, folosim maparea bazată pe slug-uri și nume
            if (mainId === 'metal-ceiling-systems' && !addedToSubcategory) {
              // Exclude produsele care aparțin altor categorii principale
              const isWoodWool = productCategories.includes('wood-wool-panels') || productCategories.includes('knauf-heradesign') || productCategories.includes('ecophon-saga');
              const isMineralWool = productCategories.includes('mineral-wool-panels') || productCategories.includes('knauf-amf') || productCategories.includes('ecophon') || productCategories.includes('eurocoustic');
              const isFabric = productCategories.includes('fabric-covered-acoustic-panels');
              const isWooden = productCategories.includes('wooden-ceiling-and-wall-systems');
              const isVinyl = productCategories.includes('vinyl-coated-gypsum-panel') ||
                  productSlugLower === 'vinyl-coated-gypsum-panel' || productSlugLower === 'vinyl-acoustic-panel' ||
                  (productSlugLower.includes('vinyl') && (productSlugLower.includes('gypsum') || productSlugLower.includes('acoustic'))) ||
                  (productNameLower.includes('vinil') && (productNameLower.includes('gips') || productNameLower.includes('acustic'))) ||
                  (productNameLower.includes('vinyl') && (productNameLower.includes('gypsum') || productNameLower.includes('acoustic')));
              const isCarrier = productCategories.includes('carrier-systems');
              const isProfile = productCategories.includes('gypsum-panel-profiles');
              
              // Dacă produsul aparține unei alte categorii principale, nu-l adăuga la metal-ceiling-systems
              if (isWoodWool || isMineralWool || isFabric || isWooden || isVinyl || isCarrier || isProfile) {
                shouldAddToThisCategory = false;
              } else {
          // Mapare subcategorii bazată pe nume/slug - MAI STRICTĂ
          const subcategoryMapping = {
            'baffle-linear-ceiling': {
              keywords: ['baffle-ceiling', 'extruded-baffle-ceiling', 'vectoral-baffle-ceiling', 'wall-baffle', 'multipanel-ceiling', 'f-linear-ceiling'],
              nameKeywords: [],
              excludeKeywords: ['heradesign', 'hygiene', 'suspended', 'suspendat', 'open-cell', 'mesh', 'glass-wool', 'vinyl', 'acoustic', 'product', 'vata', 'sticla', 'gips', 'gypsum', 'vinyl-coated-gypsum-panel', 'vinyl-acoustic-panel']
            },
          'open-cell-ceiling': {
            keywords: ['open-cell', 'self-carrying-open-cell', 't15-open-cell', 'pyramid-open-cell', 'lamina-open-cell'],
            nameKeywords: ['open cell', 'autoportant', 'piramida', 'lamina', 't15'],
            excludeKeywords: []
          },
          'expanded-mesh-ceiling': {
            keywords: ['mesh-ceiling', 'lay-in-mesh', 'lay-on-mesh', 'hook-on-mesh'],
            nameKeywords: ['plasa', 'mesh'],
            excludeKeywords: []
          },
          'cassette-type-ceiling': {
            keywords: ['suspended-ceiling', 'clip-in-suspended-ceiling', 'lay-on-suspended-ceiling', 'lay-in-suspended-ceiling'],
            nameKeywords: ['suspendat', 'caseta', 'cassette'],
            excludeKeywords: ['hook-on-corridor', 'hook-on-suspended']
          },
          'linear-plank-ceiling': {
            keywords: ['linear-plank', 'plank-ceiling', 'hook-on-suspended-ceiling', 'hook-on-corridor-ceiling'],
            nameKeywords: ['lama', 'plank', 'hook-on', 'coridor'],
            excludeKeywords: []
          }
        };
        
        for (const [subId, mapping] of Object.entries(subcategoryMapping)) {
          const subcat = mainCategory.subcategories.find(s => s.id === subId);
          if (subcat) {
            // Exclude produsele care aparțin altor categorii principale (vinyl, profile, etc.)
            const isVinyl = productSlugLower === 'vinyl-coated-gypsum-panel' || productSlugLower === 'vinyl-acoustic-panel' ||
                (productSlugLower.includes('vinyl') && (productSlugLower.includes('gypsum') || productSlugLower.includes('acoustic'))) ||
                (productNameLower.includes('vinil') && (productNameLower.includes('gips') || productNameLower.includes('acustic'))) ||
                (productNameLower.includes('vinyl') && (productNameLower.includes('gypsum') || productNameLower.includes('acoustic')));
            if (isVinyl) {
              // Skip produsele cu vinil - aparțin categoriei vinyl-coated-gypsum-panel
              // Marchează că nu ar trebui adăugat la metal-ceiling-systems
              shouldAddToThisCategory = false;
              continue;
            }
            
            // Exclude produsele care conțin cuvinte cheie de excludere
            const shouldExclude = mapping.excludeKeywords && mapping.excludeKeywords.length > 0 && mapping.excludeKeywords.some(exclude => 
              productSlugLower.includes(exclude) || productNameLower.includes(exclude)
            );
            
            if (shouldExclude) {
              continue; // Skip acest produs pentru această subcategorie
            }
            
            // Verifică mai întâi slug-urile exacte (doar potriviri exacte)
            const matchesSlug = mapping.keywords.some(keyword => 
              productSlugLower === keyword
            );
            
            // Apoi verifică cuvintele cheie din nume (doar dacă nu s-a găsit deja)
            const matchesName = !matchesSlug && mapping.nameKeywords && mapping.nameKeywords.length > 0 && mapping.nameKeywords.some(keyword => 
              productNameLower.includes(keyword)
            );
            
            if (matchesSlug || matchesName) {
              // Verifică dacă nu este deja adăugat
              if (!processedProductIds.has(product.id)) {
                subcat.products.push({
                  id: product.id,
                  name: product.name,
                  slug: productSlug
                });
                processedProductIds.add(product.id);
                addedToSubcategory = true;
                break;
              }
            }
          }
        }
        }
      }
      
      // Pentru alte categorii, verifică dacă produsul are subcategoria în categories
      // IMPORTANT: Pentru metal-ceiling-systems, nu folosim productCategories pentru că multe produse au categorii greșite
      if (!addedToSubcategory && mainId !== 'metal-ceiling-systems') {
        for (const subId of mainConfig.subcategories) {
          const subcat = mainCategory.subcategories.find(s => s.id === subId);
          if (subcat) {
            const matchesCategory = productCategories.includes(subId) || productCategories.some(cat => cat.trim() === subId);
            if (matchesCategory && !processedProductIds.has(product.id)) {
              subcat.products.push({
                id: product.id,
                name: product.name,
                slug: product.slug
              });
              processedProductIds.add(product.id);
              addedToSubcategory = true;
              break;
            }
          }
        }
      }
      
      // Logica de mapare pentru metal-ceiling-systems este deja făcută mai sus
      
      // Dacă nu a fost adăugat la o subcategorie și aparține categoriei principale, adaugă-l la categoria principală
      // IMPORTANT: Prioritizează categoriile speciale (carrier-systems, wooden, fabric, vinyl, profile) peste cele generale
      if (shouldAddToThisCategory) {
        // Verifică dacă produsul a fost deja adăugat la o altă categorie sau subcategorie
        if (!processedProductIds.has(product.id)) {
          // Nu a fost adăugat încă, adaugă-l
          if (!addedToSubcategory) {
            mainCategory.products.push({
              id: product.id,
              name: product.name,
              slug: productSlug // Folosește slug-ul generat în română
            });
            processedProductIds.add(product.id);
          }
        } else {
          // Produsul a fost deja adăugat, dar dacă această categorie are prioritate (carrier-systems, wooden, fabric, vinyl, profile), mută-l
          if (mainId === 'carrier-systems' || mainId === 'wooden-ceiling-and-wall-systems' || mainId === 'fabric-covered-acoustic-panels' || mainId === 'vinyl-coated-gypsum-panel' || mainId === 'gypsum-panel-profiles') {
            // Elimină din categoria veche (inclusiv din subcategorii)
            for (const cat of mainCategories) {
              cat.products = cat.products.filter(p => p.id !== product.id);
              if (cat.subcategories) {
                for (const sub of cat.subcategories) {
                  sub.products = sub.products.filter(p => p.id !== product.id);
                }
              }
            }
            // Elimină din processedProductIds pentru a permite re-adaugarea
            processedProductIds.delete(product.id);
            // Adaugă la categoria corectă
            mainCategory.products.push({
              id: product.id,
              name: product.name,
              slug: productSlug // Folosește slug-ul generat în română
            });
            processedProductIds.add(product.id);
          }
        }
      }
    });
    
    // Elimină duplicatele din categoria principală (după slug, nu ID)
    const seenSlugs = new Set();
    mainCategory.products = mainCategory.products.filter(p => {
      const key = p.slug || p.id;
      if (seenSlugs.has(key)) {
        return false;
      }
      seenSlugs.add(key);
      return true;
    });
    
    // Elimină duplicatele din subcategorii (după slug, nu ID)
    mainCategory.subcategories.forEach(sub => {
      const seenSubSlugs = new Set();
      sub.products = sub.products.filter(p => {
        const key = p.slug || p.id;
        if (seenSubSlugs.has(key)) {
          return false;
        }
        seenSubSlugs.add(key);
        return true;
      });
    });
    
    mainCategories.push(mainCategory);
  }
  
  // Salvează structura corectă
  const structure = {
    categories: mainCategories
  };
  
  // Actualizează prosista_products_processed.json
  const outputPath = path.join(__dirname, '..', 'prosista_products_processed.json');
  const outputData = {
    categories: rawCategories,
    products: rawProducts,
    structure,
    metadata: {
      totalCategories: mainCategories.length,
      totalProducts: rawProducts.length,
      updatedAt: new Date().toISOString()
    }
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');
  
  console.log(`✓ Structură corectată!`);
  console.log(`  - Categorii principale: ${mainCategories.length}`);
  console.log(`  - Total produse: ${rawProducts.length}`);
  console.log(`  - Salvat în: ${outputPath}\n`);
  
  // Generează navigation.json
  const navigationPath = path.join(__dirname, '..', 'src', 'data', 'navigation.json');
  const navigation = {
    products: mainCategories.map(cat => ({
      name: cat.name,
      href: `/categorii/${cat.slug}`
    }))
  };
  
  fs.writeFileSync(navigationPath, JSON.stringify(navigation, null, 2), 'utf-8');
  console.log(`✓ navigation.json actualizat: ${navigationPath}\n`);
}

fixCategoryStructure();

