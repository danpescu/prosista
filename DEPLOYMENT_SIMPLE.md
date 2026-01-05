# Deployment Simplu - prosista.infora.agency

## 🚀 Procedura Cea Mai Simplă

### Pasul 1: Build Local

Rulează în terminal:

```bash
npm install
npm run build
```

Aceasta va genera folderul `dist/` cu toate fișierele statice gata de upload.

### Pasul 2: Upload pe Server

Ai două opțiuni:

#### Opțiunea A: Via cPanel File Manager (Recomandat)

1. **Conectează-te la cPanel** pentru `prosista.infora.agency`
2. **Deschide File Manager**
3. **Navighează la folderul root** al domeniului (de obicei `public_html` sau `prosista.infora.agency`)
4. **Șterge conținutul vechi** (dacă există)
5. **Upload toate fișierele** din folderul `dist/` local:
   - Selectează toate fișierele din `dist/`
   - Upload în root-ul domeniului
   - **IMPORTANT**: Include și folderul `images/` și fișierul `.htaccess`

#### Opțiunea B: Via FTP (FileZilla sau similar)

1. **Conectează-te la FTP** cu datele de la hosting
2. **Navighează la folderul root** al domeniului
3. **Upload toate fișierele** din `dist/` local în root-ul serverului
4. **Asigură-te că `.htaccess` este inclus**

### Pasul 3: Verificare

1. Deschide `https://prosista.infora.agency` în browser
2. Verifică:
   - ✅ Site-ul se încarcă
   - ✅ Toate paginile funcționează
   - ✅ Imagini se afișează
   - ✅ Mobile menu funcționează
   - ✅ Formularul de contact funcționează (dacă este configurat PHP)

### Pasul 4: Configurare PHP (Dacă este necesar)

Dacă formularul de contact nu funcționează:

1. Editează `send-email.php` în root-ul serverului
2. Schimbă email-ul destinatar:
   ```php
   $to_email = 'email@domeniu.ro'; // Email-ul tău real
   ```

## 📋 Checklist Pre-Deployment

- [ ] `npm run build` rulează fără erori
- [ ] Folderul `dist/` conține toate fișierele
- [ ] Fișierul `.htaccess` este în `dist/`
- [ ] Folderul `images/` este în `dist/`
- [ ] Configurația `astro.config.mjs` are domeniul corect

## 🔄 Pentru Actualizări Viitoare

Când vrei să actualizezi site-ul:

1. `npm run build` (local)
2. Upload doar fișierele modificate din `dist/` (sau toate dacă preferi)
3. Gata! 🎉

## ⚠️ Note Importante

- **Nu uploada** folderul `node_modules/` sau fișierele sursă (`src/`)
- **Doar** conținutul din `dist/` trebuie uploadat
- Asigură-te că `.htaccess` este inclus pentru routing corect
- Dacă ai probleme cu routing-ul, verifică că `.htaccess` este activat pe server




