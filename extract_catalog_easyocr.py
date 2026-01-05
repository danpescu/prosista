#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pentru extragerea datelor din catalog_prosista.pdf folosind EasyOCR
"""

import sys
import json
from pathlib import Path
import io

# Setează encoding pentru output în Windows
if sys.platform == 'win32':
    import io as io_module
    sys.stdout = io_module.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io_module.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def extract_with_easyocr(pdf_path, max_pages=None):
    """Extrage textul din PDF folosind EasyOCR"""
    try:
        import easyocr
        import fitz  # PyMuPDF
    except ImportError as e:
        print(f"Eroare: Bibliotecă lipsă: {e}")
        print("Instalează cu: pip install easyocr PyMuPDF")
        return None
    
    # Inițializează EasyOCR (prima dată va descărca modelele)
    print("Inițializez EasyOCR (prima dată poate dura câteva minute pentru descărcarea modelelor)...")
    try:
        reader = easyocr.Reader(['ro', 'en'], gpu=False)  # Română + Engleză
    except Exception as e:
        print(f"Eroare la inițializarea EasyOCR: {e}")
        print("Încearcă doar cu engleza...")
        reader = easyocr.Reader(['en'], gpu=False)
    
    # Deschide PDF-ul
    try:
        doc = fitz.open(pdf_path)
        total_pages = len(doc)
    except Exception as e:
        print(f"Eroare la deschiderea PDF: {e}")
        return None
    
    pages_to_process = total_pages if max_pages is None else min(max_pages, total_pages)
    
    print(f"\nTotal pagini: {total_pages}")
    print(f"Voi procesa primele {pages_to_process} pagini cu EasyOCR...")
    print("(Procesarea poate dura 1-2 minute per pagină)")
    print("-" * 80)
    
    pages_data = []
    
    for i in range(pages_to_process):
        page_num = i + 1
        print(f"Procesez pagina {page_num}/{pages_to_process}...", end=" ", flush=True)
        
        try:
            # Convertește pagina în imagine
            page = doc[i]
            zoom = 2.0  # Zoom pentru calitate mai bună
            mat = fitz.Matrix(zoom, zoom)
            pix = page.get_pixmap(matrix=mat)
            img_data = pix.tobytes("png")
            
            # Convertește imaginea pentru OCR
            from PIL import Image
            import numpy as np
            img = Image.open(io.BytesIO(img_data))
            img_array = np.array(img)
            
            # Aplică OCR
            results = reader.readtext(img_array)
            
            # Extrage textul
            text_lines = []
            for (bbox, text, confidence) in results:
                if confidence > 0.3:  # Filtrează rezultatele cu încredere mică
                    text_lines.append(text)
            
            text = "\n".join(text_lines)
            text = text.strip()
            
            page_data = {
                "pageNumber": page_num,
                "text": text,
                "textLength": len(text),
                "hasText": len(text) > 50,
                "ocrConfidence": sum(conf for _, _, conf in results) / len(results) if results else 0
            }
            
            pages_data.append(page_data)
            
            if text:
                preview = text[:80].replace('\n', ' ')
                print(f"✓ Text extras ({len(text)} caractere): {preview}...")
            else:
                print("✗ Fără text extras")
                
        except Exception as e:
            print(f"✗ Eroare: {str(e)}")
            pages_data.append({
                "pageNumber": page_num,
                "text": "",
                "textLength": 0,
                "hasText": False,
                "error": str(e)
            })
    
    doc.close()
    return pages_data

def analyze_structure(pages_data):
    """Analizează textul și identifică categorii și produse"""
    import re
    
    structured = {
        "categories": [],
        "products": [],
        "pages": []
    }
    
    # Pattern-uri pentru categorii
    category_keywords = [
        r'tavan\s+metalic',
        r'tavan\s+din\s+lemn',
        r'panou\s+acustic',
        r'panou\s+lână',
        r'sistem\s+purtător',
        r'profil\s+gips',
        r'baffle',
        r'mesh',
        r'open\s+cell',
        r'plank',
        r'casetă'
    ]
    
    for page in pages_data:
        if not page.get("hasText"):
            continue
        
        text = page["text"]
        text_lower = text.lower()
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        page_info = {
            "pageNumber": page["pageNumber"],
            "category": None,
            "subcategory": None,
            "product": None,
            "description": "",
            "specs": []
        }
        
        # Caută categorii în primele linii
        for i, line in enumerate(lines[:15]):
            line_lower = line.lower()
            for keyword in category_keywords:
                if re.search(keyword, line_lower):
                    category_name = line.strip()
                    if category_name and len(category_name) < 100:
                        if category_name not in [c["name"] for c in structured["categories"]]:
                            structured["categories"].append({
                                "name": category_name,
                                "page": page["pageNumber"]
                            })
                        page_info["category"] = category_name
                        break
        
        # Caută nume de produse (linii scurte, poate cu numere sau majuscule)
        for line in lines[:20]:
            line_clean = line.strip()
            if (5 < len(line_clean) < 100 and 
                (line_clean.isupper() or 
                 any(c.isdigit() for c in line_clean) or
                 any(kw in line_clean.lower() for kw in ['tavan', 'panou', 'sistem', 'baffle', 'mesh', 'profil']))):
                if line_clean not in [p["name"] for p in structured["products"]]:
                    structured["products"].append({
                        "name": line_clean,
                        "page": page["pageNumber"],
                        "category": page_info["category"]
                    })
                page_info["product"] = line_clean
                break
        
        # Extrage descrierea (paragrafe mai lungi)
        desc_lines = []
        for line in lines:
            if 50 < len(line) < 500 and not line.isupper():
                desc_lines.append(line)
        page_info["description"] = " ".join(desc_lines[:3])
        
        structured["pages"].append(page_info)
    
    return structured

if __name__ == "__main__":
    pdf_path = "catalog_prosista.pdf"
    
    if not Path(pdf_path).exists():
        print(f"Eroare: Fișierul {pdf_path} nu există!")
        sys.exit(1)
    
    print("=" * 80)
    print("EXTRAGERE CATALOG CU EASYOCR")
    print("=" * 80)
    print("\nNotă: Prima dată, EasyOCR va descărca modelele (poate dura câteva minute).")
    print("Procesarea fiecărei pagini durează 1-2 minute.\n")
    
    # Test cu primele 5 pagini
    print("TEST: Procesez primele 5 pagini pentru a verifica funcționarea...")
    test_pages = extract_with_easyocr(pdf_path, max_pages=5)
    
    if test_pages:
        pages_with_text = sum(1 for p in test_pages if p.get("hasText"))
        print(f"\n{'='*80}")
        print(f"Rezultat test: {pages_with_text}/5 pagini au text extras")
        
        if pages_with_text > 0:
            # Salvează testul
            with open("catalog_test_ocr.json", 'w', encoding='utf-8') as f:
                json.dump(test_pages, f, ensure_ascii=False, indent=2)
            
            # Creează rezumat text pentru test
            with open("catalog_test_text.txt", 'w', encoding='utf-8') as f:
                for page in test_pages:
                    f.write(f"\n{'='*80}\n")
                    f.write(f"PAGINA {page['pageNumber']}\n")
                    f.write(f"{'='*80}\n\n")
                    f.write(page.get('text', '[Fără text]'))
                    f.write("\n\n")
            
            print("\n✓ OCR funcționează!")
            print("\nContinuă automat cu toate paginile...")
            print("(Aceasta va dura aproximativ 1-2 ore)")
            
            # Procesează automat toate paginile
            if True:  # Auto-continue
                print("\n" + "="*80)
                print("Procesez toate paginile...")
                print("="*80 + "\n")
                
                all_pages = extract_with_easyocr(pdf_path, max_pages=None)
                
                if all_pages:
                    # Salvează datele complete
                    output_file = "catalog_extracted_easyocr.json"
                    with open(output_file, 'w', encoding='utf-8') as f:
                        json.dump({
                            "metadata": {
                                "totalPages": len(all_pages),
                                "extractionMethod": "EasyOCR",
                                "languages": ["ro", "en"]
                            },
                            "pages": all_pages
                        }, f, ensure_ascii=False, indent=2)
                    
                    # Creează rezumat text
                    with open("catalog_text_easyocr.txt", 'w', encoding='utf-8') as f:
                        f.write("=" * 80 + "\n")
                        f.write("TEXT EXTRAS CU EASYOCR - CATALOG PROSISTA\n")
                        f.write("=" * 80 + "\n\n")
                        
                        for page in all_pages:
                            f.write(f"\n{'='*80}\n")
                            f.write(f"PAGINA {page['pageNumber']}\n")
                            f.write(f"{'='*80}\n\n")
                            f.write(page.get('text', '[Fără text]'))
                            f.write("\n\n")
                    
                    # Analizează structura
                    print("\nAnalizează structura datelor...")
                    structured = analyze_structure(all_pages)
                    
                    with open("catalog_structured_easyocr.json", 'w', encoding='utf-8') as f:
                        json.dump(structured, f, ensure_ascii=False, indent=2)
                    
                    print("\n" + "=" * 80)
                    print("EXTRAGERE COMPLETĂ!")
                    print("=" * 80)
                    print(f"✓ Text extras: {sum(1 for p in all_pages if p.get('hasText'))}/{len(all_pages)} pagini")
                    print(f"✓ Categorii identificate: {len(structured['categories'])}")
                    print(f"✓ Produse identificate: {len(structured['products'])}")
                    print(f"\nFișiere create:")
                    print(f"  - {output_file} (date complete)")
                    print(f"  - catalog_text_easyocr.txt (text simplu)")
                    print(f"  - catalog_structured_easyocr.json (structură analizată)")
            else:
                print("\nProcesare oprită. Datele test sunt salvate în:")
                print("  - catalog_test_ocr.json")
                print("  - catalog_test_text.txt")
        else:
            print("\n✗ OCR nu a extras text util. Verifică calitatea PDF-ului.")
    else:
        print("\n✗ Eroare la extragere. Verifică instalarea bibliotecilor.")

