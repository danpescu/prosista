# Ghid Deployment pe cPanel - Prosista România

## ✅ Build Completat

Site-ul a fost compilat cu succes în folderul `dist/`.

**Statistici:**
- **Dimensiune totală**: ~38 MB
- **Număr fișiere**: 427
- **Status**: ✅ Gata pentru upload

---

## 📋 Pași pentru Upload pe cPanel

### 1. Pregătire Locală

✅ Build-ul este deja generat în folderul `dist/`

### 2. Conectare la cPanel

1. Accesează cPanel-ul tău (de obicei: `https://domeniul-tau.ro:2083` sau `https://cpanel.domeniul-tau.ro`)
2. Loghează-te cu credențialele tale

### 3. Backup (Recomandat)

1. În **File Manager**, navighează la `public_html` (sau folderul domeniului tău)
2. Selectează toate fișierele existente
3. Click **Compress** → alege **Zip Archive**
4. Redenumește arhiva: `backup-$(date +%Y%m%d).zip`
5. Mută backup-ul într-un folder `backups/` (opțional)

### 4. Upload Fișiere

#### Opțiunea A: Upload prin File Manager (Recomandat pentru fișiere mici)

1. În **File Manager**, navighează la `public_html`
2. Șterge toate fișierele vechi (sau mută-le într-un folder `old/`)
3. Click **Upload**
4. Selectează **toate fișierele** din folderul `dist/` de pe computer
5. Așteaptă finalizarea upload-ului

#### Opțiunea B: Upload prin FTP (Recomandat pentru fișiere mari)

1. Folosește un client FTP (FileZilla, WinSCP, etc.)
2. Conectează-te la server cu credențialele FTP
3. Navighează la `public_html`
4. Upload toate fișierele din `dist/` păstrând structura de directoare

**Structura de directoare care trebuie păstrată:**
```
public_html/
├── index.html
├── robots.txt
├── favicon.ico
├── favicon.svg
├── send-email.php
├── .htaccess
├── _astro/
├── admin/
├── api/
├── catalog/
├── categorii/
├── contact/
├── images/
├── politica-confidentialitate/
├── produse/
├── referinte/                    # Pagini referințe (1 listare + 6 detalii)
├── termeni-conditii/
└── toate-produsele/
```

### 5. Verificare Fișiere Critice

Asigură-te că următoarele fișiere există în root-ul `public_html`:

- ✅ `index.html` (pagină principală)
- ✅ `.htaccess` (pentru routing și configurare)
- ✅ `robots.txt` (pentru SEO)
- ✅ `send-email.php` (pentru formularul de contact)
- ✅ `favicon.ico` și `favicon.svg`
- ✅ Folderul `images/` cu toate imaginile

### 6. Configurare PHP pentru Contact Form

1. Deschide `send-email.php` în **File Manager**
2. Click **Edit**
3. Verifică linia 17:
   ```php
   $to_email = 'office@prosista.ro'; // Schimbă la adresa ta reală
   ```
4. Salvează modificările

### 7. Verificare Permisiuni

Asigură-te că permisiunile sunt corecte:

- **Fișiere**: `644` (rw-r--r--)
- **Directoare**: `755` (rwxr-xr-x)
- **send-email.php**: `644` sau `755` (în funcție de server)

Pentru a seta permisiunile în File Manager:
1. Selectează fișierul/directorul
2. Click **Change Permissions**
3. Setează permisiunile corespunzătoare

### 8. Testare Site

După upload, testează:

- [ ] **Homepage**: `https://domeniul-tau.ro/`
- [ ] **Pagini categorii**: `https://domeniul-tau.ro/categorii/sisteme-de-tavane-metalice`
- [ ] **Pagini produse**: `https://domeniul-tau.ro/produse/...`
- [ ] **Pagina referințe**: `https://domeniul-tau.ro/referinte`
- [ ] **Pagini detalii referințe**: `https://domeniul-tau.ro/referinte/velux-residence`
- [ ] **Imagini**: Verifică că toate imaginile se încarcă (inclusiv imagini referințe)
- [ ] **Formular contact**: Testează trimiterea unui mesaj
- [ ] **404 Page**: `https://domeniul-tau.ro/pagina-inexistenta`

### 9. Configurare .htaccess (Dacă este necesar)

Fișierul `.htaccess` ar trebui să fie deja inclus în `dist/`. Dacă nu funcționează routing-ul, verifică că:

1. `.htaccess` este prezent în root
2. Mod_rewrite este activat pe server
3. Permisiunile sunt corecte (644)

### 10. Verificare Finală

**Checklist post-deployment:**

- [ ] Site-ul se încarcă corect
- [ ] Toate paginile funcționează (fără 404)
- [ ] Pagina de referințe se încarcă: `/referinte`
- [ ] Paginile de detalii referințe funcționează: `/referinte/velux-residence`, etc.
- [ ] Imagini se afișează corect (inclusiv galeriile de referințe)
- [ ] Formularul de contact funcționează
- [ ] Mobile menu funcționează
- [ ] Links-urile interne funcționează (inclusiv link-urile către referințe)
- [ ] SEO meta tags sunt corecte
- [ ] Robots.txt este accesibil

---

## 🔧 Troubleshooting

### Problema: 404 Errors pentru pagini

**Soluție:**
- Verifică că `.htaccess` este uploadat
- Verifică că mod_rewrite este activat pe server
- Contactează suportul hosting pentru activare

### Problema: Imagini nu se încarcă

**Soluție:**
- Verifică că folderul `images/` este uploadat complet
- Verifică că folderul `images/references/` conține toate imaginile (16 imagini)
- Verifică path-urile în browser console (F12)
- Asigură-te că permisiunile sunt corecte (755 pentru directoare)

### Problema: Formularul nu trimite email-uri

**Soluție:**
- Verifică că PHP este activat pe server
- Verifică că `send-email.php` este în root
- Verifică permisiunile fișierului (644 sau 755)
- Verifică că email-ul destinatar este corect
- Verifică log-urile serverului pentru erori

### Problema: Site-ul este lent

**Soluție:**
- Activează compresia GZIP în `.htaccess` (dacă nu este deja)
- Verifică dimensiunea imaginilor (optimizează dacă este necesar)
- Contactează suportul hosting pentru optimizări

---

## 📦 Structura Fișierelor Uploadate

```
public_html/
├── index.html                    # Homepage
├── robots.txt                    # SEO
├── favicon.ico                   # Icon
├── favicon.svg                   # Icon SVG
├── send-email.php                # Contact form handler
├── .htaccess                     # Server config
├── _astro/                        # Assets Astro
│   └── catalog.qtcgPfvZ.css
├── admin/                        # Admin page
├── api/                          # API endpoints
├── catalog/                      # Catalog page
├── categorii/                    # Category pages (14 pagini)
├── contact/                      # Contact page
├── images/                       # Toate imaginile
│   ├── hero/
│   ├── logo.png
│   ├── products/
│   ├── products-detail/
│   └── references/              # Imagini referințe (16 imagini)
│       ├── velux-residence.jpg
│       ├── velux-residence-2.jpg
│       ├── velux-residence-4.jpg
│       ├── antalya-airport.jpg
│       ├── antalya-airport-2.jpg
│       ├── antalya-airport-3.jpg
│       ├── izmir-hospital.jpg
│       ├── izmir-hospital-2.jpg
│       ├── izmir-hospital-3.jpg
│       ├── yumurtalik-power.jpg
│       ├── yumurtalik-power-2.jpg
│       ├── yumurtalik-power-3.jpg
│       ├── yasar-university.jpg
│       ├── yasar-university-2.jpg
│       ├── yasar-university-3.jpg
│       └── turkey-petroleum.jpg
├── politica-confidentialitate/   # Privacy policy
├── produse/                      # Product pages (105 pagini)
├── referinte/                    # Referințe (7 pagini)
│   ├── index.html                # Listare referințe
│   ├── velux-residence/         # Detalii Velux Residence
│   ├── antalya-airport/         # Detalii Aeroportul Antalya
│   ├── izmir-hospital/          # Detalii Spitalul Izmir
│   ├── yumurtalik-power/        # Detalii Centrala Yumurtalik
│   ├── yasar-university/        # Detalii Universitatea Yaşar
│   └── turkey-petroleum/        # Detalii Petrolul Turciei
├── termeni-conditii/             # Terms & conditions
└── toate-produsele/              # All products page
```

---

## 📞 Suport

Dacă întâmpini probleme:
1. Verifică log-urile serverului în cPanel
2. Verifică console-ul browserului (F12) pentru erori
3. Contactează suportul hosting pentru probleme de server

---

## ✅ Status Deployment

- **Build**: ✅ Completat
- **Dimensiune**: ~38 MB
- **Fișiere**: 427+
- **Pagini referințe**: 7 pagini (1 listare + 6 detalii)
- **Imagini referințe**: 16 imagini
- **Status**: Gata pentru upload

**Următorul pas**: Upload toate fișierele din `dist/` în `public_html` pe cPanel.

## 📄 Pagini Referințe

Site-ul include următoarele pagini de referințe:

1. **Listare referințe**: `/referinte` - Pagină cu toate cele 6 referințe
2. **Velux Residence**: `/referinte/velux-residence` - Proiect rezidențial, București
3. **Aeroportul Antalya**: `/referinte/antalya-airport` - Aeroport comercial, Turcia
4. **Spitalul Izmir**: `/referinte/izmir-hospital` - Facilitate medicală, Turcia
5. **Centrala Yumurtalik**: `/referinte/yumurtalik-power` - Centrală industrială, Turcia
6. **Universitatea Yaşar**: `/referinte/yasar-university` - Instituție educațională, Turcia
7. **Petrolul Turciei**: `/referinte/turkey-petroleum` - Instituție guvernamentală, Turcia

Fiecare pagină de detalii include:
- Hero section cu background image
- Galerie de imagini (2-4 imagini per referință)
- Text descriptiv tradus în română
- Breadcrumbs pentru navigare
