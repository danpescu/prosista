#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pentru extragerea datelor din catalog_prosista.pdf folosind OCR
"""

import pdfplumber
import pytesseract
from PIL import Image
import json
import sys
from pathlib import Path
import io

# Setează encoding pentru output în Windows
if sys.platform == 'win32':
    import io as io_module
    sys.stdout = io_module.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io_module.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def pdf_page_to_image(pdf_path, page_num):
    """Convertește o pagină PDF în imagine"""
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(pdf_path)
        page = doc[page_num - 1]  # 0-indexed
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom pentru calitate mai bună
        img_data = pix.tobytes("png")
        img = Image.open(io.BytesIO(img_data))
        doc.close()
        return img
    except ImportError:
        # Fallback: folosește pdfplumber cu PIL
        with pdfplumber.open(pdf_path) as pdf:
            page = pdf.pages[page_num - 1]
            # Extrage imaginea paginii
            img = page.to_image(resolution=300)
            return img.original

def extract_text_with_ocr(pdf_path, max_pages=None):
    """Extrage textul din PDF folosind OCR"""
    pages_data = []
    
    try:
        import fitz
        doc = fitz.open(pdf_path)
        total_pages = len(doc)
        doc.close()
    except:
        with pdfplumber.open(pdf_path) as pdf:
            total_pages = len(pdf.pages)
    
    pages_to_process = total_pages if max_pages is None else min(max_pages, total_pages)
    
    print(f"Total pagini: {total_pages}")
    print(f"Voi procesa primele {pages_to_process} pagini cu OCR (poate dura câteva minute)...")
    print("-" * 80)
    
    for i in range(1, pages_to_process + 1):
        print(f"Procesez pagina {i}/{pages_to_process}...", end=" ", flush=True)
        
        try:
            # Convertește pagina în imagine
            img = pdf_page_to_image(pdf_path, i)
            
            # Aplică OCR
            # Folosește limba română + engleză pentru OCR mai bun
            try:
                text = pytesseract.image_to_string(img, lang='ron+eng')
            except:
                # Dacă limba română nu e disponibilă, folosește doar engleza
                text = pytesseract.image_to_string(img, lang='eng')
            
            # Curăță textul
            text = text.strip()
            
            page_data = {
                "pageNumber": i,
                "text": text,
                "textLength": len(text),
                "hasText": len(text) > 50  # Consideră că are text dacă are mai mult de 50 caractere
            }
            
            pages_data.append(page_data)
            
            if text:
                preview = text[:100].replace('\n', ' ')
                print(f"✓ Text extras ({len(text)} caractere): {preview}...")
            else:
                print("✗ Fără text extras")
                
        except Exception as e:
            print(f"✗ Eroare: {str(e)}")
            pages_data.append({
                "pageNumber": i,
                "text": "",
                "textLength": 0,
                "hasText": False,
                "error": str(e)
            })
    
    return pages_data

def analyze_and_structure_data(pages_data):
    """Analizează textul extras și încearcă să identifice structura"""
    structured_data = {
        "categories": [],
        "products": [],
        "pages": []
    }
    
    # Cuvinte cheie pentru categorii
    category_patterns = [
        r'tavan\s+metalic',
        r'tavan\s+lemn',
        r'panou\s+acustic',
        r'panou\s+lână',
        r'sistem\s+purtător',
        r'profil\s+gips',
        r'baffle',
        r'mesh',
        r'open\s+cell'
    ]
    
    current_category = None
    current_product = None
    
    for page in pages_data:
        if not page.get("hasText"):
            continue
            
        text = page["text"].lower()
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        page_info = {
            "pageNumber": page["pageNumber"],
            "category": None,
            "product": None,
            "description": "",
            "specs": []
        }
        
        # Caută categorii
        for line in lines[:20]:  # Verifică primele 20 de linii
            for pattern in category_patterns:
                if re.search(pattern, line, re.IGNORECASE):
                    category_name = line.title()
                    if category_name not in [c["name"] for c in structured_data["categories"]]:
                        structured_data["categories"].append({
                            "name": category_name,
                            "page": page["pageNumber"]
                        })
                    page_info["category"] = category_name
                    current_category = category_name
                    break
        
        # Caută nume de produse (linii scurte, majuscule sau cu numere)
        for line in lines[:30]:
            if len(line) > 5 and len(line) < 80:
                # Verifică dacă pare a fi un nume de produs
                if (line.isupper() or 
                    any(char.isdigit() for char in line) or
                    any(keyword in line for keyword in ['tavan', 'panou', 'sistem', 'baffle', 'mesh'])):
                    if line not in [p["name"] for p in structured_data["products"]]:
                        structured_data["products"].append({
                            "name": line,
                            "page": page["pageNumber"],
                            "category": current_category
                        })
                    page_info["product"] = line
                    current_product = line
                    break
        
        # Extrage descrierea (paragrafe mai lungi)
        description_lines = []
        for line in lines:
            if len(line) > 50 and not line.isupper():
                description_lines.append(line)
        page_info["description"] = " ".join(description_lines[:5])  # Primele 5 paragrafe
        
        structured_data["pages"].append(page_info)
    
    return structured_data

if __name__ == "__main__":
    import re
    
    pdf_path = "catalog_prosista.pdf"
    
    if not Path(pdf_path).exists():
        print(f"Eroare: Fișierul {pdf_path} nu există!")
        sys.exit(1)
    
    print("=" * 80)
    print("EXTRAGERE CATALOG CU OCR")
    print("=" * 80)
    print("\nNotă: Procesarea tuturor paginilor poate dura 10-20 minute.")
    print("Voi procesa primele 10 pagini pentru test, apoi toate dacă funcționează.")
    print("\n")
    
    # Test cu primele 10 pagini
    print("TEST: Procesez primele 10 pagini...")
    test_pages = extract_text_with_ocr(pdf_path, max_pages=10)
    
    pages_with_text = sum(1 for p in test_pages if p.get("hasText"))
    print(f"\nRezultat test: {pages_with_text}/10 pagini au text extras")
    
    if pages_with_text > 0:
        print("\n✓ OCR funcționează! Continuă cu toate paginile...")
        response = input("\nVrei să procesez toate cele 70 de pagini? (da/nu): ")
        
        if response.lower() in ['da', 'd', 'y', 'yes']:
            print("\nProcesez toate paginile (poate dura 15-20 minute)...")
            all_pages = extract_text_with_ocr(pdf_path, max_pages=None)
            
            # Salvează datele
            output_file = "catalog_extracted_ocr.json"
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump({
                    "metadata": {
                        "totalPages": len(all_pages),
                        "extractionMethod": "OCR (Tesseract)",
                        "language": "ron+eng"
                    },
                    "pages": all_pages
                }, f, ensure_ascii=False, indent=2)
            
            # Creează rezumat text
            with open("catalog_text_ocr.txt", 'w', encoding='utf-8') as f:
                f.write("=" * 80 + "\n")
                f.write("TEXT EXTRAS CU OCR - CATALOG PROSISTA\n")
                f.write("=" * 80 + "\n\n")
                
                for page in all_pages:
                    f.write(f"\n{'='*80}\n")
                    f.write(f"PAGINA {page['pageNumber']}\n")
                    f.write(f"{'='*80}\n\n")
                    f.write(page.get('text', '[Fără text]'))
                    f.write("\n\n")
            
            # Analizează structura
            print("\nAnalizez structura datelor...")
            structured = analyze_and_structure_data(all_pages)
            
            with open("catalog_structured.json", 'w', encoding='utf-8') as f:
                json.dump(structured, f, ensure_ascii=False, indent=2)
            
            print("\n" + "=" * 80)
            print("EXTRAGERE COMPLETĂ!")
            print("=" * 80)
            print(f"✓ Text extras: {sum(1 for p in all_pages if p.get('hasText'))}/{len(all_pages)} pagini")
            print(f"✓ Categorii identificate: {len(structured['categories'])}")
            print(f"✓ Produse identificate: {len(structured['products'])}")
            print(f"\nFișiere create:")
            print(f"  - {output_file} (date complete)")
            print(f"  - catalog_text_ocr.txt (text simplu)")
            print(f"  - catalog_structured.json (structură analizată)")
        else:
            print("\nProcesare oprită. Datele test sunt salvate.")
    else:
        print("\n✗ OCR nu a extras text. Verifică instalarea Tesseract.")
        print("  Instalează Tesseract: https://github.com/UB-Mannheim/tesseract/wiki")
        print("  Și pachetul de limba română pentru Tesseract")

