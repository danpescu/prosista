# Ghid pentru Imagini - Prosista.ro

## ✅ Imagini Descărcate

Următoarele imagini au fost descărcate cu succes de pe prosista.com:

### Logo-uri
- ✅ `public/images/logo.png` - Logo principal
- ✅ `public/images/logo-white.png` - Logo alb pentru navbar transparent

### Hero
- ✅ `public/images/hero/hero-bg.jpg` - Background hero section

### Categorii Produse (8 imagini)
- ✅ `public/images/products/tavane-metalice.jpg`
- ✅ `public/images/products/tavane-lemn.jpg`
- ✅ `public/images/products/panouri-acustice-tapisate.jpg`
- ✅ `public/images/products/panouri-lana-minerala.jpg`
- ✅ `public/images/products/panouri-lana-lemn.jpg`
- ✅ `public/images/products/sisteme-purtatoare.jpg`
- ✅ `public/images/products/gips-vinil.jpg`
- ✅ `public/images/products/profile-gips.jpg`

## 📥 Descărcare Imagini Produse Individuale

Pentru a descărca imaginile produselor individuale:

### Metoda 1: Script Automat (Recomandat)

1. Navighează pe paginile produselor de pe prosista.com:
   - https://www.prosista.com/en/products/metal-suspended-ceilings/baffle-linear-ceilings/baffle-ceiling
   - https://www.prosista.com/en/products/metal-suspended-ceilings/baffle-linear-ceilings/baffle-extruded-ceiling
   - etc.

2. Deschide DevTools (F12) → Network tab

3. Filtrează după "image"

4. Identifică URL-urile imaginilor produselor

5. Adaugă URL-urile în `scripts/download-all-images.js`:

```javascript
const productImages = [
  {
    url: 'https://www.prosista.com/u/i/urunler/baffle-tavan/baffle-tavan-01.jpg',
    path: 'public/images/products-detail/baffle/tavan-baffle-1.jpg'
  },
  // ... adaugă mai multe
];
```

6. Rulează scriptul:
```bash
node scripts/download-all-images.js
```

### Metoda 2: Descărcare Manuală

1. Navighează pe fiecare pagină de produs de pe prosista.com
2. Click dreapta pe imagine → "Save image as..."
3. Salvează în folderul corespunzător:
   - `public/images/products-detail/baffle/` - pentru produse baffle
   - `public/images/products-detail/open-cell/` - pentru produse open cell
   - `public/images/products-detail/mesh/` - pentru produse mesh
   - etc.

### Structura Directoarelor

```
public/images/
├── logo.png
├── logo-white.png
├── hero/
│   └── hero-bg.jpg
├── products/
│   ├── tavane-metalice.jpg
│   ├── tavane-lemn.jpg
│   └── ... (8 imagini categorii)
├── products-detail/
│   ├── baffle/
│   │   ├── tavan-baffle-1.jpg
│   │   ├── tavan-baffle-2.jpg
│   │   └── ...
│   ├── open-cell/
│   ├── mesh/
│   ├── tip-caseta/
│   └── plank-linear/
└── references/
    ├── velux-residence.jpg
    └── ... (6 referințe)
```

## 🔍 Găsirea URL-urilor Imaginilor

### Pe prosista.com:

1. **Pagina produsului**: Navighează la produsul dorit
2. **DevTools**: Deschide F12 → Network tab
3. **Filtrare**: Filtrează după "Img" sau "image"
4. **URL-uri**: Caută URL-uri de tipul:
   - `https://www.prosista.com/u/i/urunler/[categorie]/[produs]-[nr].jpg`
   - `https://www.prosista.com/u/i/urunler/[categorie]/[produs].jpg`

### Exemple de URL-uri probabile:

```
https://www.prosista.com/u/i/urunler/baffle-tavan/baffle-tavan-01.jpg
https://www.prosista.com/u/i/urunler/baffle-tavan/baffle-tavan-02.jpg
https://www.prosista.com/u/i/urunler/open-cell/open-cell-01.jpg
https://www.prosista.com/u/i/urunler/mesh/mesh-01.jpg
```

## 📝 Referințe

Pentru imagini referințe, navighează pe:
- https://www.prosista.com/en/references

Și descarcă imaginile în `public/images/references/`

## ✅ Verificare

După descărcare, verifică că:
- [ ] Toate imaginile au fost salvate corect
- [ ] Dimensiunile sunt rezonabile (nu prea mari)
- [ ] Formatul este corect (JPG/PNG)
- [ ] Path-urile din cod corespund cu locațiile reale

## 🛠️ Optimizare (Opțional)

După descărcare, poți optimiza imaginile:

```bash
# Folosind ImageMagick (dacă este instalat)
find public/images -name "*.jpg" -exec mogrify -quality 85 -resize '1920x1920>' {} \;

# Sau folosește tool-uri online:
# - https://tinypng.com/
# - https://squoosh.app/
```

