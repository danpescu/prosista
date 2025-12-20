# Prosista România - Site Web Astro

Site web modern pentru Prosista România - producător de sisteme de tavane suspendate metalice și acustice.

## 🚀 Tehnologii

- **Astro 4.x** - Framework static site generator
- **Tailwind CSS 3.x** - Styling
- **TypeScript** - Type safety
- **Node.js 18+** - Runtime

## 📦 Instalare

```bash
npm install
```

## 🛠️ Development

```bash
npm run dev
```

Site-ul va fi disponibil la `http://localhost:4321`

## 🏗️ Build pentru Production

```bash
npm run build
```

Fișierele statice vor fi generate în folderul `dist/` și pot fi uploadate direct pe cPanel.

## 📁 Structură Proiect

```
prosista-ro/
├── public/              # Static assets
├── src/
│   ├── components/      # Componente Astro
│   ├── layouts/         # Layout-uri
│   ├── pages/           # Pagini
│   ├── data/            # Date JSON
│   ├── styles/          # Stiluri globale
│   └── utils/           # Utilitare
└── dist/                # Build output (generat)
```

## 🖼️ Imagini

În faza de dezvoltare, site-ul folosește placeholder-e pentru imagini. 
Pentru a adăuga imagini reale:

1. Plasează imaginile în `public/images/`
2. Înlocuiește URL-urile placeholder cu path-urile reale

## 📧 Contact Form

Formularul de contact folosește PHP (`public/send-email.php`). 
Asigură-te că:
- PHP este activat pe server
- Email-ul destinatar este configurat în `send-email.php`

## 📄 Licență

© 2024 Prosista România. Toate drepturile rezervate.

