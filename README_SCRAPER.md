# Prosista Scraper v2.1 - Ghid Utilizare

## ✅ Fix Implementat

Scriptul **`scrape_prosista.py`** a fost reparat pentru a filtra corect produsele după categorie/subcategorie.

**Problema rezolvată:** Categoria "Cassette Type Ceiling" returna 31 produse în loc de 3.  
**Soluție:** Verificare strictă de apartenență la categorie prin analiza breadcrumb-urilor din pagina produsului.

---

## 🚀 Utilizare

### 1. Instalare dependențe

```bash
pip install requests beautifulsoup4 deep-translator lxml
```

### 2. Scraping complet (recomandat pentru producție)

```bash
python scrape_prosista.py --output catalog_final.json
```

**Caracteristici:**
- ✅ Traducere automată RO
- ✅ Verificare strictă apartenență la categorie
- ⏱️ Durată: ~2-3 ore (depinde de numărul de produse)

### 3. Scraping rapid fără traducere (pentru testare)

```bash
python scrape_prosista.py --no-translate --output test.json
```

**Caracteristici:**
- ⏩ Mai rapid (fără API traducere)
- ✅ Verificare strictă activată
- ⏱️ Durată: ~30-60 minute

### 4. Scraping fără verificare strictă (NU recomandat)

```bash
python scrape_prosista.py --no-strict-check --output fast_but_inaccurate.json
```

**⚠️ ATENȚIE:** Va include produse din alte categorii! Folosiți doar pentru teste rapide.

### 5. Debug cu limită de produse

```bash
python scrape_prosista.py --no-translate --limit 5 --output debug.json
```

**Caracteristici:**
- Preia maxim 5 produse per categorie
- Util pentru debugging sau preview

---

## 📊 Output

### Structură fișier JSON

```json
{
  "metadata": {
    "source_url": "https://www.prosista.com/en",
    "limba_sursa": "en",
    "limba_destinatie": "ro",
    "data_scraping": "2026-01-05 14:30:00",
    "traducere_automata": true,
    "verificare_stricta_categorii": true,
    "total_categorii": 8,
    "total_subcategorii": 10,
    "total_produse": 180,
    "duplicate_eliminate": 5,
    "produse_filtrate": 28,
    "erori": 0
  },
  "arbore_categorii": [
    {
      "nume_en": "Metal Ceiling Systems",
      "nume_ro": "Sisteme de Tavane Metalice",
      "url": "https://www.prosista.com/en/category/metal-ceiling-systems",
      "subcategorii": [
        {
          "nume_en": "Cassette Type Ceiling",
          "nume_ro": "Tavan Tip Casetă",
          "url": "https://www.prosista.com/en/category/cassette-type-ceiling"
        }
      ]
    }
  ],
  "produse": [
    {
      "nume_en": "Clip In Suspended Ceiling",
      "nume_ro": "Tavan Suspendat Clip In",
      "url": "https://www.prosista.com/en/product/clip-in-suspended-ceiling",
      "categorie_en": "Metal Ceiling Systems",
      "categorie_ro": "Sisteme de Tavane Metalice",
      "subcategorie_en": "Cassette Type Ceiling",
      "subcategorie_ro": "Tavan Tip Casetă",
      "descriere_en": "Features of Clip-In Suspended Ceiling System...",
      "descriere_ro": "",
      "imagine_principala": "https://...",
      "galerie_imagini": ["https://...", "https://..."],
      "documente_pdf": [
        {
          "url": "https://...",
          "nume": "Technical Datasheet",
          "tip": "Fișă Tehnică"
        }
      ]
    }
  ]
}
```

### Statistici afișate

La finalul scraping-ului, vei vedea:

```
============================================================
✅ SCRAPING FINALIZAT
============================================================
📁 Fișier: catalog_final.json
📊 Statistici:
   - Categorii: 8
   - Subcategorii: 10
   - Produse unice: 180
   - Duplicate eliminate: 5
   - Produse filtrate (categorie greșită): 28
   - Erori: 0
============================================================
```

**Interpretare:**
- **Produse unice:** Numărul total de produse valide
- **Duplicate eliminate:** Produse care apăreau de mai multe ori (eliminate automat)
- **Produse filtrate:** Produse care au fost excluse pentru că nu aparțin categoriei curente
- **Erori:** Pagini care nu au putut fi accesate

**Notă:** `descriere_ro` este goală în JSON - se completează manual ulterior (traducerile automate sunt dezactivate pentru descrieri).

---

## 🧪 Testare

### Test rapid pe categoria Cassette Type Ceiling

```bash
python test_cassette_fix.py
```

**Output așteptat:**

```
✅✅✅ TEST TRECUT PERFECT: Exact 3 produse găsite!

Lista produse:
  1. Clip In Suspended Ceiling
  2. Lay On Suspended Ceiling
  3. Lay In Suspended Ceiling

Produse filtrate: 28
```

---

## 🔧 Parametri CLI

| Parametru | Descriere | Valoare default |
|-----------|-----------|-----------------|
| `--output` | Fișier JSON de ieșire | `prosista_catalog_v2.json` |
| `--no-translate` | Dezactivează traducerea | Traducere activată |
| `--no-strict-check` | Dezactivează verificarea strictă | Verificare activată |
| `--limit N` | Limită produse per categorie | Fără limită |

---

## 🐛 Debugging

### Activare mod DEBUG

Editează `scrape_prosista.py` și decomentează liniile de DEBUG:

```python
# În funcția verify_product_belongs_to_category()
print(f"    [DEBUG] Verificare produs: {product_url}")
print(f"    [DEBUG] Category URL: '{category_url}'")
print(f"    [DEBUG] Subcategory URL: '{subcategory_url}'")
```

Apoi rulează:

```bash
python scrape_prosista.py --no-translate --limit 5
```

### Salvare rezultate parțiale

Dacă oprești scraping-ul cu `Ctrl+C`, datele parțiale vor fi salvate automat în:
```
prosista_catalog_v2_partial.json
```

---

## ⚙️ Cum Funcționează Verificarea Strictă

1. **Găsește produsele** vizibile pe pagina categoriei
2. **Pentru fiecare produs:**
   - Preia pagina produsului
   - Caută breadcrumb în `<main>` content
   - Extrage slug-urile categoriilor din breadcrumb
   - **Verifică** dacă subcategoria curentă apare în breadcrumb
   - Dacă DA → include produsul ✅
   - Dacă NU → filtrează produsul ❌

**Exemplu:**

```
Produs: "Clip In Suspended Ceiling"
Breadcrumb găsit: Metal Ceiling Systems → Cassette Type Ceiling
Subcategorie căutată: Cassette Type Ceiling
Rezultat: ✅ MATCH → produs inclus
```

```
Produs: "Baffle Ceiling"
Breadcrumb găsit: Metal Ceiling Systems → Baffle / Linear Ceiling
Subcategorie căutată: Cassette Type Ceiling
Rezultat: ❌ NO MATCH → produs filtrat
```

---

## 📝 Notă Importantă

**Verificarea strictă adaugă +1 request HTTP per produs**, deci scraping-ul e mai lent, dar mult mai precis.

Pentru scraping rapid de testare, folosește `--no-strict-check`, dar **verifică manual** rezultatele.

---

## 📞 Suport

Pentru probleme sau întrebări:
1. Verifică `FIX_SUMMARY.md` pentru detalii tehnice
2. Rulează testul: `python test_cassette_fix.py`
3. Activează DEBUG mode pentru diagnostic

---

**Versiune:** v2.3  
**Data:** 2026-01-05  
**Status:** ✅ Toate problemele rezolvate

## 🆕 Nou în v2.3

- ✅ **Traducere manuală:** `descriere_ro` rămâne goală (nu se traduce automat) - se completează manual ulterior
- ✅ **Descriere EN păstrată:** `descriere_en` conține textul original în engleză din pagina produsului
- ✅ **Fix categorii fără subcategorii:** Wooden Ceiling, Fabric Covered, Carrier Systems funcționează corect
- ✅ **Fix duplicate PDF:** Produse cu PDF-uri multiple (turcă + engleză) sunt grupate corect
- ✅ **Grupare inteligentă:** Același produs cu 2 PDF-uri apare o singură dată cu ambele documente
