#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pentru extragerea datelor din catalog_prosista.pdf
"""

import pdfplumber
import json
import re
import sys
from pathlib import Path

# Setează encoding pentru output în Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def extract_text_from_pdf(pdf_path):
    """Extrage textul din PDF folosind pdfplumber"""
    pages_data = []
    
    with pdfplumber.open(pdf_path) as pdf:
        print(f"Total pagini: {len(pdf.pages)}")
        
        for i, page in enumerate(pdf.pages, 1):
            print(f"Procesez pagina {i}...")
            
            # Extrage textul
            text = page.extract_text()
            
            # Extrage tabele (dacă există)
            tables = page.extract_tables()
            
            # Extrage imagini (dacă există)
            images = page.images
            
            page_data = {
                "pageNumber": i,
                "text": text or "",
                "hasTables": len(tables) > 0,
                "tables": tables if tables else [],
                "hasImages": len(images) > 0,
                "imageCount": len(images)
            }
            
            pages_data.append(page_data)
            
            # Afișează primele 200 de caractere pentru debugging
            if text:
                preview = text[:200].replace('\n', ' ')
                print(f"  Preview: {preview}...")
            else:
                print(f"  Fără text extras (probabil imagini)")
    
    return pages_data

def analyze_structure(pages_data):
    """Analizează structura și încearcă să identifice categorii și produse"""
    categories = []
    current_category = None
    current_subcategory = None
    
    # Cuvinte cheie pentru categorii
    category_keywords = [
        "tavan", "panou", "sistem", "profil", "baffle", 
        "metalic", "lemn", "gips", "acustic", "lână"
    ]
    
    for page in pages_data:
        text = page.get("text", "").lower()
        
        # Caută titluri sau secțiuni importante
        lines = text.split('\n')
        for line in lines:
            line = line.strip()
            if len(line) > 3 and len(line) < 100:
                # Verifică dacă pare a fi un titlu de categorie
                if any(keyword in line for keyword in category_keywords):
                    if line not in [cat.get("name", "").lower() for cat in categories]:
                        categories.append({
                            "name": line.title(),
                            "page": page["pageNumber"]
                        })
    
    return categories

def save_extracted_data(pages_data, output_file="catalog_extracted_full.json"):
    """Salvează datele extrase în JSON"""
    output = {
        "metadata": {
            "totalPages": len(pages_data),
            "extractionMethod": "pdfplumber"
        },
        "pages": pages_data
    }
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"\nDatele au fost salvate în {output_file}")
    return output_file

def extract_text_summary(pages_data, output_file="catalog_text_summary.txt"):
    """Creează un rezumat text pentru analiză manuală"""
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("=" * 80 + "\n")
        f.write("REZUMAT TEXT CATALOG PROSISTA\n")
        f.write("=" * 80 + "\n\n")
        
        for page in pages_data:
            f.write(f"\n{'='*80}\n")
            f.write(f"PAGINA {page['pageNumber']}\n")
            f.write(f"{'='*80}\n\n")
            
            if page.get("text"):
                f.write(page["text"])
                f.write("\n\n")
            else:
                f.write("[Fără text - probabil imagini]\n\n")
            
            if page.get("hasTables"):
                f.write(f"[Conține {len(page['tables'])} tabele]\n")
            
            if page.get("hasImages"):
                f.write(f"[Conține {page['imageCount']} imagini]\n")
    
    print(f"Rezumatul text a fost salvat în {output_file}")

if __name__ == "__main__":
    pdf_path = "catalog_prosista.pdf"
    
    if not Path(pdf_path).exists():
        print(f"Eroare: Fișierul {pdf_path} nu există!")
        exit(1)
    
    print("Încep extragerea datelor din PDF...")
    print("-" * 80)
    
    # Extrage datele
    pages_data = extract_text_from_pdf(pdf_path)
    
    # Salvează datele complete
    json_file = save_extracted_data(pages_data)
    
    # Creează rezumat text
    extract_text_summary(pages_data)
    
    # Analizează structura
    categories = analyze_structure(pages_data)
    
    print("\n" + "=" * 80)
    print("REZUMAT EXTRAGERE")
    print("=" * 80)
    print(f"Total pagini procesate: {len(pages_data)}")
    print(f"Pagini cu text: {sum(1 for p in pages_data if p.get('text'))}")
    print(f"Pagini cu tabele: {sum(1 for p in pages_data if p.get('hasTables'))}")
    print(f"Pagini cu imagini: {sum(1 for p in pages_data if p.get('hasImages'))}")
    print(f"\nCategorii identificate: {len(categories)}")
    for cat in categories[:10]:  # Primele 10
        print(f"  - {cat['name']} (pagina {cat['page']})")
    
    print(f"\n✓ Extragere completă!")
    print(f"✓ Verifică fișierele: {json_file} și catalog_text_summary.txt")

