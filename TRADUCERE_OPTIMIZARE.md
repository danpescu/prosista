# Optimizare Traducere - Prosista Scraper

## Probleme Identificate

Traducerea automată poate fi slabă pentru texte tehnice din cauza:
1. Termeni tehnici specifici domeniului
2. Google Translate nu este optimizat pentru texte tehnice
3. Lipsă de context pentru termeni specializați

## Soluții Implementate

### 1. DeepL Translator (Recomandat)

DeepL oferă traduceri mai bune pentru texte tehnice. Pentru a folosi DeepL:

**Opțiunea 1: API Key gratuit (Recomandat)**
1. Obține un API key gratuit de la https://www.deepl.com/pro-api
2. Setează variabila de mediu:
   ```bash
   # Windows PowerShell
   $env:DEEPL_API_KEY="your-api-key-here"
   
   # Windows CMD
   set DEEPL_API_KEY=your-api-key-here
   
   # Linux/Mac
   export DEEPL_API_KEY=your-api-key-here
   ```
3. Rulează scriptul - va folosi automat DeepL

**Opțiunea 2: Fără API Key**
- Scriptul va încerca să folosească versiunea free web (poate funcționa sau nu, depinde de deep-translator)
- Dacă nu funcționează, va folosi automat Google Translate ca fallback

### 2. Chunking Inteligent

Scriptul împarte textele lungi în propoziții complete pentru traduceri mai precise:
- Păstrează contextul propozițiilor
- Evită traduceri fragmentate
- Limite: 4500 caractere pentru Google, 5000 pentru DeepL

### 3. Dicționar Termeni Tehnici

Am adăugat un dicționar cu termeni tehnici comuni. Poți extinde dicționarul în `scrape_prosista.py`:

```python
self.technical_terms = {
    'ceiling': 'tavan',
    'suspended ceiling': 'tavan suspendat',
    # Adaugă aici termeni noi
}
```

### 4. Post-procesare

Scriptul post-procesează traducerile pentru a corecta termeni tehnici:
- Verifică dacă termenii tehnici sunt corect traduși
- Corectează traduceri greșite comune (ex: "plafon" → "tavan")

## Cum să Îmbunătățești Traducerile

### Metoda 1: Folosește DeepL cu API Key (Cel mai bun)

1. Obține API key gratuit de la DeepL
2. Setează variabila de mediu
3. Rulează scriptul

### Metoda 2: Extinde Dicționarul

Editează `scrape_prosista.py` și adaugă termeni în `self.technical_terms`:

```python
self.technical_terms = {
    # ... termeni existenți ...
    'your-term': 'traducerea-corecta',
}
```

### Metoda 3: Review Manual (Pentru calitate maximă)

1. Rulează scriptul cu `needs_review: true` flag
2. Review manual traducerile din JSON
3. Corectează manual traducerile slabe

### Metoda 4: Traducere Hibridă

1. Rulează scriptul pentru a genera JSON cu traduceri automate
2. Review și corectează manual traducerile importante
3. Re-rulează doar pentru produsele modificate

## Verificare Calitate Traduceri

După rulare, verifică:
- `prosista_products.json` - toate traducerile
- `scraper.log` - erori și avertismente de traducere
- Caută termeni tehnici care ar putea fi traduse greșit

## Note

- DeepL oferă 500,000 caractere/lună gratuit
- Google Translate nu are limită dar calitatea este mai slabă
- Cache-ul evită retraducerea acelorași texte
- Chunking-ul asigură traduceri mai bune pentru texte lungi

