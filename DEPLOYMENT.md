# Ghid de Deployment - Prosista România

## 📋 Pași pentru Deployment pe cPanel

### 1. Build Local

```bash
npm install
npm run build
```

Acest pas va genera folderul `dist/` cu toate fișierele statice.

### 2. Upload pe cPanel

1. Conectează-te la cPanel
2. Deschide **File Manager**
3. Navighează la folderul `public_html` sau folderul domeniului tău
4. Upload toate fișierele din `dist/` în root-ul domeniului

**IMPORTANT**: 
- Asigură-te că fișierul `.htaccess` este inclus
- Asigură-te că folderul `images/` este inclus cu toate imaginile

### 3. Configurare PHP pentru Contact Form

1. Verifică că PHP este activat pe server
2. Editează `public/send-email.php` și schimbă email-ul destinatar:
   ```php
   $to_email = 'info@prosista.ro'; // Schimbă la adresa ta reală
   ```
3. Upload `send-email.php` în root-ul domeniului (același nivel cu `index.html`)

### 4. Configurare Imagini

Înlocuiește placeholder-ele cu imagini reale:

1. Logo: `public/images/logo.png` și `logo-white.png`
2. Hero: `public/images/hero/hero-bg.jpg`
3. Produse: `public/images/products/*.jpg` (8 imagini)
4. Referințe: `public/images/references/*.jpg` (6 imagini)
5. OG Image: `public/images/og-image.jpg` (1200x630px)

### 5. Verificare Post-Deployment

- [ ] Site-ul se încarcă corect
- [ ] Toate paginile funcționează
- [ ] Imagini se afișează corect
- [ ] Formularul de contact funcționează
- [ ] Mobile menu funcționează
- [ ] Links-urile interne funcționează

### 6. SEO Setup

1. **Google Search Console**: Adaugă site-ul
2. **Google Analytics**: Adaugă tracking code în `Layout.astro` dacă este necesar
3. **Sitemap**: Generează sitemap.xml (poate fi adăugat ulterior)

## 🔧 Troubleshooting

### Probleme comune:

**Formularul nu trimite email-uri:**
- Verifică că PHP este activat
- Verifică permisiunile fișierului `send-email.php`
- Verifică că email-ul destinatar este corect

**Imaginile nu se încarcă:**
- Verifică că folderul `images/` este uploadat corect
- Verifică path-urile în cod (trebuie să fie `/images/...`)

**404 Errors:**
- Verifică că `.htaccess` este uploadat
- Verifică configurarea serverului pentru routing

## 📞 Support

Pentru probleme tehnice, contactează echipa de dezvoltare.

