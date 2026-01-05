# CMS Admin Panel - Prosista.ro

## 📋 Prezentare

CMS-ul este un sistem simplu, hostat local, pentru gestionarea categoriilor, produselor, descrierilor, pozelor și setărilor SEO pentru site-ul Prosista.ro.

## 🚀 Accesare

După ce pornești serverul de development:

```bash
npm run dev
```

Accesează panoul de administrare la:
**http://localhost:4321/admin**

## ✨ Funcționalități

### 1. Gestionare Categorii
- ✅ Vizualizare toate categoriile
- ✅ Adăugare categorie nouă
- ✅ Editare categorie (nume, descriere, imagine)
- ✅ Ștergere categorie
- ✅ Gestionare SEO (title, description, keywords)

### 2. Gestionare Produse
- ✅ Vizualizare toate produsele
- ✅ Adăugare produs nou
- ✅ Editare produs (nume, descriere, imagini)
- ✅ Ștergere produs
- ✅ Upload imagini
- ✅ Gestionare SEO (title, description, keywords)

### 3. Upload Imagini
- ✅ Upload imagini pentru categorii
- ✅ Upload imagini pentru produse
- ✅ Imagini salvate în `public/images/products/`
- ✅ Suport pentru multiple imagini per produs

## 📁 Structură Date

Datele sunt salvate în `src/data/products.json` cu următoarea structură:

```json
{
  "categories": [
    {
      "id": "tavane-metalice",
      "name": "Tavane Metalice",
      "slug": "tavane-metalice",
      "description": "...",
      "image": "/images/products/tavane-metalice.jpg",
      "seo": {
        "title": "...",
        "description": "...",
        "keywords": ["..."]
      },
      "subcategories": [...],
      "products": [...]
    }
  ]
}
```

## 🔧 API Endpoints

### GET `/api/products`
Returnează toate categoriile și produsele.

### POST `/api/products`
Actualizează datele. Body:
```json
{
  "action": "update|create|delete",
  "type": "category|product",
  "data": {...},
  "categoryId": "...",
  "subcategoryId": "...",
  "id": "..."
}
```

### POST `/api/upload`
Upload imagine. FormData cu câmpul `file`.

## 📝 Utilizare

### Adăugare Categorie Nouă
1. Click pe butonul "+ Adaugă Categorie"
2. Completează numele categoriei
3. Adaugă descriere (opțional)
4. Adaugă URL imagine sau uploadează o imagine
5. Completează câmpurile SEO (opțional)
6. Click "Salvează"

### Adăugare Produs Nou
1. Click pe butonul "+ Adaugă Produs"
2. Selectează categoria
3. Completează numele produsului
4. Adaugă descriere (opțional)
5. Adaugă imagini (upload sau URL-uri)
6. Completează câmpurile SEO (opțional)
7. Click "Salvează"

### Editare Categorie/Produs
1. Click pe butonul "Editează" de lângă categoria/produsul dorit
2. Modifică câmpurile necesare
3. Click "Salvează"

### Upload Imagini
1. În formularul de editare, selectează un fișier imagine
2. Click pe butonul "Upload Imagine"
3. Imaginea va fi salvată automat și URL-ul va fi adăugat în câmp

## ⚠️ Note Importante

1. **Backup**: Fă backup la `src/data/products.json` înainte de modificări majore
2. **Imagini**: Imagini uploadate sunt salvate în `public/images/products/`
3. **Slug-uri**: Slug-urile sunt generate automat din nume (lowercase, fără spații)
4. **SEO**: Câmpurile SEO sunt opționale dar recomandate pentru optimizare

## 🔒 Securitate

⚠️ **IMPORTANT**: Acest CMS este destinat pentru utilizare locală în development. Pentru producție, adaugă:
- Autentificare (login)
- Validare input
- Rate limiting
- Sanitizare date

## 🛠️ Dezvoltare Viitoare

Funcționalități care pot fi adăugate:
- [ ] Autentificare cu username/password
- [ ] Editor rich text pentru descrieri
- [ ] Preview înainte de salvare
- [ ] Istoric modificări
- [ ] Export/Import date
- [ ] Gestionare subcategorii
- [ ] Drag & drop pentru reordonare

## 📞 Suport

Pentru întrebări sau probleme, consultă documentația Astro sau contactează echipa de dezvoltare.

