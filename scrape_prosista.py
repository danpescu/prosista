#!/usr/bin/env python3
"""
Scraper îmbunătățit pentru https://www.prosista.com/en
V2.0 - Cu structură corectă de categorii și subcategorii

INSTALARE:
    pip install requests beautifulsoup4 lxml

UTILIZARE:
    python prosista_scraper_v2.py
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import argparse
from urllib.parse import urljoin
import re
from datetime import datetime

class ProsistaScraper:
    def __init__(self, limit=None, strict_category_check=True):
        self.base_url = "https://www.prosista.com"
        self.start_url = "https://www.prosista.com/en"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
        })
        self.limit = limit
        self.strict_category_check = strict_category_check
        
        # Stocare date
        self.category_tree = []
        self.all_products = []
        self.processed_product_urls = set()  # Pentru a evita duplicate
        
        self.stats = {
            "categorii": 0,
            "subcategorii": 0,
            "produse": 0,
            "duplicate_evitate": 0,
            "produse_filtrate": 0,
            "erori": 0
        }
        
    def clean_text(self, text):
        """Curăță textul"""
        if not text:
            return ""
        text = re.sub(r'\s+', ' ', text)
        return text.strip()
    
    def get_page(self, url, retries=3):
        """Preia pagina cu retry logic"""
        for attempt in range(retries):
            try:
                response = self.session.get(url, timeout=30)
                response.raise_for_status()
                return BeautifulSoup(response.content, 'html.parser')
            except Exception as e:
                if attempt < retries - 1:
                    time.sleep(2)
                else:
                    print(f"  ❌ Eroare: {url}")
                    self.stats["erori"] += 1
                    return None
    
    def build_category_tree(self):
        """Construiește arborele complet de categorii și subcategorii"""
        print("🌳 Construire arbore categorii...")
        
        soup = self.get_page(self.start_url)
        if not soup:
            return
        
        # Găsește link-ul PRODUCTS în navigație
        nav_links = soup.find_all('a')
        products_link = None
        
        for link in nav_links:
            link_text = self.clean_text(link.get_text())
            if link_text == 'PRODUCTS':
                products_link = link
                break
        
        if not products_link:
            print("❌ Nu găsesc link-ul PRODUCTS")
            return
        
        # Găsește ul-ul imediat după link (submeniul de produse)
        products_submenu = products_link.find_next_sibling('ul')
        if not products_submenu:
            parent_li = products_link.find_parent('li')
            if parent_li:
                products_submenu = parent_li.find('ul', recursive=False)
        
        if not products_submenu:
            print("❌ Nu găsesc submeniul de produse")
            return
        
        # IMPORTANT: Ia DOAR <li>-urile directe (primul nivel)
        main_category_items = []
        for li in products_submenu.find_all('li', recursive=False):
            main_category_items.append(li)
        
        print(f"  Găsite {len(main_category_items)} categorii principale (nivel 1)\n")
        
        # Procesează fiecare categorie principală
        for main_li in main_category_items:
            # Primul link din acest <li> = categoria principală
            category_link = main_li.find('a', href=re.compile(r'/en/category/'), recursive=False)
            
            if not category_link:
                continue
            
            cat_name_en = self.clean_text(category_link.get_text())
            cat_url = urljoin(self.base_url, category_link.get('href'))
            
            # Validare
            if not cat_name_en or len(cat_name_en) < 2:
                continue
            
            print(f"  📁 {cat_name_en}")
            
            category_data = {
                "nume": cat_name_en,
                "url": cat_url,
                "subcategorii": []
            }
            
            # Metodă 1: Caută <ul> direct sub acest <li> (subcategorii clasice din navigație)
            subcategories_ul = main_li.find('ul', recursive=False)
            
            if subcategories_ul:
                # Ia DOAR <li>-urile directe din acest <ul>
                subcategory_items = subcategories_ul.find_all('li', recursive=False)
                
                for sub_li in subcategory_items:
                    # Link către subcategorie
                    subcat_link = sub_li.find('a', href=re.compile(r'/en/category/'))
                    
                    if subcat_link:
                        sub_name_en = self.clean_text(subcat_link.get_text())
                        sub_url = urljoin(self.base_url, subcat_link.get('href'))
                        
                        if sub_name_en and len(sub_name_en) > 2:
                            print(f"    📂 {sub_name_en} (din nav)")
                            
                            subcategory_data = {
                                "nume": sub_name_en,
                                "url": sub_url
                            }
                            
                            category_data["subcategorii"].append(subcategory_data)
                            self.stats["subcategorii"] += 1
            
            # Metodă 2: Caută subcategorii inline în navigație
            # Format: - [Knauf AMF] - [Ecophon] - [Eurocoustic]
            # Acestea apar ca link-uri separate în main_li, după categoria principală
            if not subcategories_ul:  # Doar dacă nu a găsit ul clasic
                # Găsește toate link-urile către categorii din acest li
                all_cat_links = main_li.find_all('a', href=re.compile(r'/en/category/'))
                
                # Primul e categoria principală, restul sunt subcategorii inline
                if len(all_cat_links) > 1:
                    print(f"    Detectate {len(all_cat_links) - 1} subcategorii inline în nav:")
                    
                    for subcat_link in all_cat_links[1:]:  # Skip primul (categoria principală)
                        sub_name_en = self.clean_text(subcat_link.get_text())
                        sub_url = urljoin(self.base_url, subcat_link.get('href'))
                        
                        if sub_name_en and len(sub_name_en) > 2:
                            print(f"    📂 {sub_name_en} (inline nav)")
                            
                            subcategory_data = {
                                "nume": sub_name_en,
                                "url": sub_url
                            }
                            
                            category_data["subcategorii"].append(subcategory_data)
                            self.stats["subcategorii"] += 1
            
            # Metodă 3: Verifică pe pagina categoriei dacă există subcategorii
            # Unele categorii au subcategorii doar pe pagina lor, nu în navigație
            # Verificăm MEREU pentru a nu pierde subcategorii
            subcats_from_page = self.get_subcategories_from_page(cat_url, cat_name_en)
            if subcats_from_page:
                added_count = 0
                for subcat in subcats_from_page:
                    # Evită duplicate - verifică atât URL cât și nume
                    is_duplicate = any(
                        s['url'] == subcat['url'] or s['nume'].lower() == subcat['nume'].lower() 
                        for s in category_data["subcategorii"]
                    )
                    if not is_duplicate:
                        subcategory_data = {
                            "nume": subcat['nume'],
                            "url": subcat['url']
                        }
                        category_data["subcategorii"].append(subcategory_data)
                        self.stats["subcategorii"] += 1
                        added_count += 1
                
                if added_count > 0:
                    print(f"    Detectate {added_count} subcategorii noi pe pagina categoriei:")
                    for subcat in category_data["subcategorii"][-added_count:]:
                        print(f"    📂 {subcat['nume']} (din pagină)")
            
            self.category_tree.append(category_data)
            self.stats["categorii"] += 1
            print()
        
        print(f"✅ Arbore construit: {self.stats['categorii']} categorii principale, {self.stats['subcategorii']} subcategorii\n")
    
    def get_subcategories_from_page(self, category_url, category_name):
        """Extrage subcategoriile direct de pe pagina categoriei"""
        soup = self.get_page(category_url)
        if not soup:
            return []
        
        subcategories = []
        
        # Caută în zona de conținut principal
        main = soup.find('main')
        if not main:
            return []
        
        # Exclude sidebar
        for sidebar in main.find_all(['div', 'aside'], class_=re.compile(r'sidebar', re.I)):
            sidebar.decompose()
        
        # Caută card-uri care conțin link-uri către categorii
        # Acestea sunt subcategorii dacă:
        # 1. Link-ul e către /en/category/
        # 2. NU e link către categoria curentă
        # 3. Are imagine de categorie (/u/i/kategoriler/)
        # 4. NU e o categorie principală din lista de nivel 1
        
        # Lista categoriilor principale (pentru excludere)
        main_categories = [
            'metal-ceiling-systems', 'wooden-ceiling-and-wall', 'fabric-covered-acoustic-panels',
            'carrier-systems', 'wood-wool-panels', 'mineral-wool-panels', 
            'vinyl-coated-gypsum-panel', 'gypsum-board-profiles', 'gypsum-panel-profiles'
        ]
        
        category_cards = main.find_all('div', class_=re.compile(r'card', re.I))
        
        for card in category_cards:
            # Caută link către categorie în card
            cat_link = card.find('a', href=re.compile(r'/en/category/'))
            if not cat_link:
                continue
            
            # Verifică că nu e link către categoria curentă
            cat_href = cat_link.get('href', '')
            if category_url.endswith(cat_href) or cat_href in category_url:
                continue
            
            # Verifică că nu e o categorie principală
            is_main_category = any(main_cat in cat_href for main_cat in main_categories)
            if is_main_category:
                continue
            
            # Verifică dacă are imagine de categorie
            img = card.find('img')
            if img:
                img_src = img.get('src', '')
                # Imaginile de categorii sunt în /u/i/kategoriler/
                if '/u/i/kategoriler/' in img_src:
                    # E o subcategorie!
                    sub_name = self.clean_text(cat_link.get_text())
                    
                    # Dacă link-ul nu are text, caută în heading
                    if not sub_name or len(sub_name) < 2:
                        heading = card.find(['h6', 'h5', 'h4', 'h3', 'h2'])
                        if heading:
                            sub_name = self.clean_text(heading.get_text())
                    
                    # Sau ia alt-ul imaginii
                    if not sub_name or len(sub_name) < 2:
                        sub_name = img.get('alt', '')
                    
                    sub_url = urljoin(self.base_url, cat_href)
                    
                    if sub_name and len(sub_name) > 2:
                        subcategories.append({
                            'nume': sub_name,
                            'url': sub_url
                        })
        
        time.sleep(1)  # Rate limiting
        return subcategories
    
    def extract_images(self, soup):
        """Extrage imaginea principală și galeria"""
        result = {
            "imagine_principala": "",
            "galerie_slider": []
        }
        
        # Caută imaginea principală
        main_img_selectors = [
            soup.find('div', class_=re.compile(r'main.*image|product.*image', re.I)),
            soup.find('div', id=re.compile(r'main.*image|product.*image', re.I)),
        ]
        
        for container in main_img_selectors:
            if container:
                img = container.find('img')
                if img:
                    src = img.get('src', '') or img.get('data-src', '')
                    if src and not any(x in src.lower() for x in ['logo', 'icon']):
                        result["imagine_principala"] = urljoin(self.base_url, src)
                        break
        
        # Caută galeria
        gallery_containers = soup.find_all(['div', 'ul'], class_=re.compile(r'gallery|slider|carousel', re.I))
        
        for gallery in gallery_containers:
            gallery_imgs = gallery.find_all('img')
            for img in gallery_imgs:
                src = img.get('src', '') or img.get('data-src', '')
                if src and not any(x in src.lower() for x in ['logo', 'icon', 'button']):
                    full_url = urljoin(self.base_url, src)
                    if full_url != result["imagine_principala"] and full_url not in result["galerie_slider"]:
                        result["galerie_slider"].append(full_url)
        
        # Backup: toate imaginile relevante
        if not result["imagine_principala"]:
            all_imgs = soup.find_all('img')
            for img in all_imgs:
                src = img.get('src', '') or img.get('data-src', '')
                if src and '/u/i/' in src and not any(x in src.lower() for x in ['logo', 'banner']):
                    result["imagine_principala"] = urljoin(self.base_url, src)
                    break
        
        return result
    
    def extract_pdfs(self, soup):
        """Extrage link-urile PDF (exclude katalog.pdf general)"""
        pdfs = []
        pdf_links = soup.find_all('a', href=re.compile(r'\.pdf$', re.I))
        
        for link in pdf_links:
            pdf_url = urljoin(self.base_url, link.get('href'))
            
            # IGNORĂ katalog.pdf general
            if 'katalog.pdf' in pdf_url.lower():
                continue
            
            pdf_text = self.clean_text(link.get_text())
            
            pdf_type = "Catalog"
            if any(word in pdf_text.lower() for word in ['technical', 'tehnic', 'specification']):
                pdf_type = "Fișă Tehnică"
            elif any(word in pdf_text.lower() for word in ['installation', 'montaj']):
                pdf_type = "Ghid Montaj"
            elif any(word in pdf_text.lower() for word in ['certificate', 'certificat']):
                pdf_type = "Certificat"
            
            pdf_info = {
                "url": pdf_url,
                "nume": pdf_text or "Document PDF",
                "tip": pdf_type
            }
            
            if pdf_info not in pdfs:
                pdfs.append(pdf_info)
        
        return pdfs
    
    def extract_description(self, soup):
        """Extrage descrierea din div#genelBakis"""
        # Caută div-ul cu id="genelBakis"
        genel_bakis = soup.find('div', id='genelBakis')
        
        if genel_bakis:
            # Extrage tot textul din acest div
            text = self.clean_text(genel_bakis.get_text())
            return text if text else ""
        
        # Fallback: caută alte zone de descriere
        desc_containers = soup.find_all(['div', 'section'], class_=re.compile(r'description|content|detail', re.I))
        descriptions = []
        
        for container in desc_containers:
            if container.find_parent(['header', 'footer', 'nav']):
                continue
            
            paragraphs = container.find_all(['p'], recursive=False)
            for p in paragraphs:
                text = self.clean_text(p.get_text())
                if len(text) > 50 and text not in descriptions:
                    descriptions.append(text)
        
        return " ".join(descriptions[:2]) if descriptions else ""
    
    def verify_product_belongs_to_category(self, product_url, category_url, subcategory_url=None):
        """Verifică dacă un produs aparține efectiv categoriei/subcategoriei date
        
        Args:
            product_url: URL-ul paginii produsului
            category_url: URL-ul categoriei principale
            subcategory_url: URL-ul subcategoriei (opțional)
        
        Returns:
            bool: True dacă produsul aparține categoriei/subcategoriei
        """
        if not self.strict_category_check:
            return True  # Skip verification dacă nu e activat
        
        # DEBUG: print URLs
        # print(f"    [DEBUG] Verificare produs: {product_url}")
        # print(f"    [DEBUG] Category URL: '{category_url}'")
        # print(f"    [DEBUG] Subcategory URL: '{subcategory_url}'")
        
        soup = self.get_page(product_url)
        if not soup:
            return False
        
        # Extrage slug-urile pentru comparație (ex: "cassette-type-ceiling" din URL)
        def get_category_slug(url):
            """Extrage slug-ul categoriei din URL"""
            if not url:
                return None
            # Curăță URL-ul de trailing whitespace
            url = url.strip()
            # Ex: /en/category/cassette-type-ceiling-64 → cassette-type-ceiling
            # Ex: /en/category/cassette-type-ceiling → cassette-type-ceiling
            match = re.search(r'/en/category/([^/?&#\s]+)', url)
            if match:
                slug = match.group(1)
                # Remove trailing numbers (ex: -64)
                slug = re.sub(r'-\d+$', '', slug)
                return slug
            return None
        
        category_slug = get_category_slug(category_url)
        subcategory_slug = get_category_slug(subcategory_url) if subcategory_url else None
        
        # METODA PRINCIPALĂ: Caută breadcrumb în main content
        # Breadcrumb-ul real e în <main> și conține 2-3 link-uri către categorii (calea reală)
        main = soup.find('main')
        if not main:
            main = soup.find(['div', 'section'], class_=re.compile(r'content|main', re.I))
        
        if main:
            # Exclude sidebar pentru a nu găsi navigația globală
            main_copy = BeautifulSoup(str(main), 'html.parser')
            for sidebar in main_copy.find_all(['div', 'aside'], class_=re.compile(r'sidebar|side-bar', re.I)):
                sidebar.decompose()
            
            # Caută containere cu link-uri către categorii (breadcrumb-ul real)
            for container in main_copy.find_all(['div', 'span', 'p', 'nav', 'ul', 'ol'], recursive=True):
                cat_links = container.find_all('a', href=re.compile(r'/en/category/'))
                
                # Breadcrumb poate avea:
                # - 1 link (categorii fără subcategorii)
                # - 2-5 link-uri (categorii cu subcategorii)
                if subcategory_slug:
                    # Dacă căutăm subcategorie, breadcrumb-ul trebuie să aibă 2-5 link-uri
                    min_links = 2
                else:
                    # Dacă căutăm doar categorie, breadcrumb-ul poate avea 1+ link-uri
                    min_links = 1
                
                if min_links <= len(cat_links) <= 5:
                    # Verifică că nu e în navigație globală
                    parent_classes = ' '.join(container.get('class', []))
                    if any(word in parent_classes.lower() for word in ['nav', 'menu', 'header']):
                        continue
                    
                    # Extrage slug-urile din breadcrumb
                    breadcrumb_slugs = []
                    for link in cat_links:
                        href = link.get('href', '')
                        slug = get_category_slug(urljoin(self.base_url, href))
                        if slug:
                            breadcrumb_slugs.append(slug)
                    
                    # Verifică apartenență la categorie/subcategorie
                    if subcategory_slug:
                        # Dacă căutăm o subcategorie, TREBUIE să apară exact subcategoria
                        if subcategory_slug in breadcrumb_slugs:
                            return True
                    else:
                        # Dacă căutăm doar categoria principală (fără subcategorii)
                        if category_slug in breadcrumb_slugs:
                            return True
        
        # METODA 2: Verifică meta tags
        for meta_property in ['og:section', 'og:category']:
            meta = soup.find('meta', property=meta_property)
            if meta:
                content = meta.get('content', '').lower()
                if subcategory_slug and subcategory_slug in content:
                    return True
                if category_slug and category_slug in content:
                    return True
        
        for meta_name in ['category', 'section', 'article:section']:
            meta = soup.find('meta', attrs={'name': meta_name})
            if meta:
                content = meta.get('content', '').lower()
                if subcategory_slug and subcategory_slug in content:
                    return True
                if category_slug and category_slug in content:
                    return True
        
        # METODA 3: Caută link "Back to category" sau "View all"
        for link in soup.find_all('a', href=re.compile(r'/en/category/')):
            text = link.get_text(strip=True).lower()
            if any(keyword in text for keyword in ['back', 'return', 'view all', 'more products']):
                href = link.get('href', '')
                slug = get_category_slug(href)
                if subcategory_slug and slug == subcategory_slug:
                    return True
                if category_slug and slug == category_slug and not subcategory_slug:
                    return True
        
        return False
    
    def scrape_product(self, product_url, product_name, categoria, subcategoria=""):
        """Preia detaliile unui produs"""
        
        # NU mai verificăm duplicate global - lăsăm fiecare subcategorie să-și preia produsele
        # Verificarea de duplicate se face mai târziu în post-processing
        
        print(f"    📄 {product_name}...", end=" ", flush=True)
        
        soup = self.get_page(product_url)
        if not soup:
            print("❌")
            return None
        
        # Extrage date
        images_data = self.extract_images(soup)
        pdfs = self.extract_pdfs(soup)
        desc = self.extract_description(soup)
        
        product_data = {
            "nume": product_name,
            "url": product_url,
            
            # Categorie și subcategorie
            "categorie": categoria,
            "subcategorie": subcategoria,
            
            # Descriere
            "descriere": desc,
            
            # Imagini
            "imagine_principala": images_data["imagine_principala"],
            "galerie_imagini": images_data["galerie_slider"],
            
            # PDF-uri
            "documente_pdf": pdfs
        }
        
        self.stats["produse"] += 1
        
        # Info despre ce s-a găsit
        info = []
        if images_data["imagine_principala"]:
            info.append("🖼️")
        if images_data["galerie_slider"]:
            info.append(f"📸x{len(images_data['galerie_slider'])}")
        if pdfs:
            info.append(f"📄x{len(pdfs)}")
        
        print(f"✅ {' '.join(info)}" if info else "✅")
        
        time.sleep(1)
        return product_data
    
    def scrape_products_from_url(self, url, categoria, subcategoria=""):
        """Preia produsele dintr-o categorie/subcategorie"""
        
        soup = self.get_page(url)
        if not soup:
            return []
        
        products = []
        
        # IMPORTANT: Găsește zona de conținut principală (nu navigația)
        # Caută explicit <main> tag-ul (zona de conținut principal)
        content_area = soup.find('main')
        
        # Dacă nu există <main>, caută zone specifice de conținut
        if not content_area:
            content_area = soup.find(['div', 'section'], class_=re.compile(r'content|main|products|category', re.I))
        
        # Ultimă variantă: folosește body, dar exclude header/nav/footer
        if not content_area:
            content_area = soup.find('body')
            # Exclude explicit header, nav, footer
            for unwanted in content_area.find_all(['header', 'nav', 'footer']):
                unwanted.decompose()
        
        # Exclude sidebar-ul (conține link-uri către categorii, nu produse din această categorie)
        for sidebar in content_area.find_all(['div', 'aside'], class_=re.compile(r'sidebar|side-bar', re.I)):
            sidebar.decompose()
        
        # Tip 1: Produse cu pagină de produs (link către /en/product/)
        # Caută doar în zona de conținut, NU în sidebar
        all_product_links = content_area.find_all('a', href=re.compile(r'/en/product/'))
        
        seen_urls = set()
        count = 0
        
        # Construiește URL-ul categoriei și subcategoriei pentru verificare
        # Găsește URL-ul categoriei din arborele de categorii
        category_url = None
        subcategory_url = None
        
        for cat in self.category_tree:
            if cat["nume"] == categoria:
                category_url = cat["url"]
                if subcategoria:
                    for subcat in cat.get("subcategorii", []):
                        if subcat["nume"] == subcategoria:
                            subcategory_url = subcat["url"]
                            break
                break
        
        # Fallback: folosește URL-ul paginii curente
        if not category_url:
            category_url = url
        if subcategoria and not subcategory_url:
            subcategory_url = url
        
        for link in all_product_links:
            if self.limit and count >= self.limit:
                break
            
            product_url = urljoin(self.base_url, link.get('href'))
            
            # Verificăm duplicate pe ACEASTĂ pagină
            if product_url in seen_urls:
                continue
            
            # Extrage numele produsului din link
            product_name = self.clean_text(link.get_text())
            
            # Dacă link-ul nu are text (e pe imagine), caută text în card-ul părinte
            if not product_name or len(product_name) < 2:
                card = link.find_parent(['div'], class_=re.compile(r'card', re.I))
                if card:
                    # Caută h6/h5/h4 în card pentru numele produsului
                    heading = card.find(['h6', 'h5', 'h4', 'h3'])
                    if heading:
                        product_name = self.clean_text(heading.get_text())
            
            # Verifică dacă este un link valid cu nume
            if not product_name or len(product_name) < 2:
                continue
            
            seen_urls.add(product_url)
            
            # VERIFICARE: Confirmă că produsul aparține categoriei/subcategoriei curente
            if self.strict_category_check:
                belongs = self.verify_product_belongs_to_category(
                    product_url, 
                    category_url, 
                    subcategory_url
                )
                if not belongs:
                    print(f"    ⏭️  {product_name} (filtrat - nu aparține categoriei)")
                    self.stats["produse_filtrate"] += 1
                    continue
            
            # Scrape produsul
            product = self.scrape_product(
                product_url, 
                product_name, 
                categoria,
                subcategoria
            )
            if product:
                products.append(product)
                count += 1
        
        # Tip 2: Produse cu doar PDF și imagine (fără pagină de produs)
        # Varianta A: Containere cu link către PDF
        # NOTĂ: Folosim dict pentru a grupa PDF-uri multiple pentru același produs
        pdf_products_by_name = {}  # key = nume produs, value = product_data
        
        product_containers = content_area.find_all(['div', 'li'], class_=re.compile(r'product|item|card', re.I))
        
        for container in product_containers:
            # Caută link către PDF
            pdf_link = container.find('a', href=re.compile(r'\.pdf$', re.I))
            if not pdf_link:
                continue
            
            pdf_url = urljoin(self.base_url, pdf_link.get('href'))
            
            # Ignoră katalog.pdf
            if 'katalog.pdf' in pdf_url.lower():
                continue
            
            # Verifică dacă deja am procesat acest PDF URL
            if pdf_url in self.processed_product_urls:
                continue
            
            self.processed_product_urls.add(pdf_url)
            
            # Extrage numele produsului
            product_name_en = ""
            
            # Încearcă să găsești numele din heading
            heading = container.find(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
            if heading:
                product_name_en = self.clean_text(heading.get_text())
            
            # Sau din textul link-ului PDF
            if not product_name_en:
                product_name_en = self.clean_text(pdf_link.get_text())
            
            # Sau din title/alt al imaginii
            if not product_name_en:
                img = container.find('img')
                if img:
                    product_name_en = img.get('alt', '') or img.get('title', '')
            
            if not product_name_en or len(product_name_en) < 2:
                continue
            
            # Verifică dacă deja avem un produs cu același nume
            if product_name_en in pdf_products_by_name:
                # Adaugă PDF-ul la produsul existent
                pdf_products_by_name[product_name_en]["documente_pdf"].append({
                    "url": pdf_url,
                    "nume": product_name_en,
                    "tip": "Catalog"
                })
                print(f"    📄 {product_name_en} (PDF suplimentar)... ✅ 📄+1")
                continue
            
            print(f"    📄 {product_name_en} (PDF direct)...", end=" ", flush=True)
            
            # Extrage imaginea
            img_url = ""
            img = container.find('img')
            if img:
                src = img.get('src', '') or img.get('data-src', '')
                if src:
                    img_url = urljoin(self.base_url, src)
            
            # Creează produsul NOU
            product_data = {
                "nume": product_name_en,
                "url": pdf_url,  # URL-ul e către primul PDF
                
                "categorie": categoria,
                "subcategorie": subcategoria,
                
                # Descriere
                "descriere": "",  # Produse PDF nu au pagină cu descriere
                
                "imagine_principala": img_url,
                "galerie_imagini": [],
                
                "documente_pdf": [{
                    "url": pdf_url,
                    "nume": product_name_en,
                    "tip": "Catalog"
                }]
            }
            
            pdf_products_by_name[product_name_en] = product_data
            
            print(f"✅ 🖼️ 📄x1")
            time.sleep(0.5)
        
        # Varianta B: Link-uri directe către PDF cu imagine și heading (structura Ecophon)
        # Caută toate link-urile către PDF în zona de conținut
        all_pdf_links = content_area.find_all('a', href=re.compile(r'\.pdf$', re.I))
        
        for pdf_link in all_pdf_links:
            pdf_url = urljoin(self.base_url, pdf_link.get('href'))
            
            # Ignoră katalog.pdf
            if 'katalog.pdf' in pdf_url.lower():
                continue
            
            # Verifică dacă deja am procesat acest PDF URL
            if pdf_url in self.processed_product_urls:
                continue
            
            self.processed_product_urls.add(pdf_url)
            
            # Extrage numele - caută heading în interiorul link-ului
            product_name_en = ""
            heading = pdf_link.find(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
            if heading:
                product_name_en = self.clean_text(heading.get_text())
            
            # Sau din alt/title al imaginii
            if not product_name_en:
                img = pdf_link.find('img')
                if img:
                    product_name_en = img.get('alt', '') or img.get('title', '')
                    product_name_en = self.clean_text(product_name_en)
            
            # Sau din textul link-ului
            if not product_name_en:
                # Elimină textul "imgPdf" dacă există
                text = self.clean_text(pdf_link.get_text())
                if text and text.lower() != 'imgpdf':
                    product_name_en = text
            
            if not product_name_en or len(product_name_en) < 2 or product_name_en.lower() == 'imgpdf':
                continue
            
            # Verifică dacă deja avem un produs cu același nume
            if product_name_en in pdf_products_by_name:
                # Adaugă PDF-ul la produsul existent
                pdf_products_by_name[product_name_en]["documente_pdf"].append({
                    "url": pdf_url,
                    "nume": product_name_en,
                    "tip": "Catalog"
                })
                print(f"    📄 {product_name_en} (PDF suplimentar)... ✅ 📄+1")
                continue
            
            print(f"    📄 {product_name_en} (PDF direct)...", end=" ", flush=True)
            
            # Extrage imaginea
            img_url = ""
            img = pdf_link.find('img')
            if img:
                src = img.get('src', '') or img.get('data-src', '')
                if src:
                    img_url = urljoin(self.base_url, src)
            
            # Creează produsul NOU
            product_data = {
                "nume": product_name_en,
                "url": pdf_url,
                
                "categorie": categoria,
                "subcategorie": subcategoria,
                
                # Descriere
                "descriere": "",  # Produse PDF nu au pagină cu descriere
                
                "imagine_principala": img_url,
                "galerie_imagini": [],
                
                "documente_pdf": [{
                    "url": pdf_url,
                    "nume": product_name_en,
                    "tip": "Catalog"
                }]
            }
            
            pdf_products_by_name[product_name_en] = product_data
            
            print(f"✅ 🖼️ 📄x1")
            time.sleep(0.5)
        
        # Adaugă produsele PDF grupate la lista finală
        for pdf_product in pdf_products_by_name.values():
            if self.limit and count >= self.limit:
                break
            products.append(pdf_product)
            self.stats["produse"] += 1
            count += 1
        
        return products
    
    def scrape_all_products(self):
        """Preia toate produsele bazat pe arborele de categorii"""
        print("📦 Preluare produse...\n")
        
        for categoria in self.category_tree:
            cat_name = categoria["nume"]
            cat_url = categoria["url"]
            
            print(f"[{self.category_tree.index(categoria) + 1}/{len(self.category_tree)}] 📁 {cat_name}")
            
            # Dacă are subcategorii, preia produse DOAR din subcategorii
            if categoria["subcategorii"]:
                print(f"  ℹ️  Categoria principală IGNORATĂ (are {len(categoria['subcategorii'])} subcategorii)")
                print(f"  ℹ️  Se preiau produse DOAR din subcategorii:\n")
                
                for subcategoria in categoria["subcategorii"]:
                    sub_name = subcategoria["nume"]
                    sub_url = subcategoria["url"]
                    
                    print(f"  📂 {sub_name}")
                    
                    products = self.scrape_products_from_url(
                        sub_url,
                        cat_name,
                        sub_name
                    )
                    
                    self.all_products.extend(products)
                    print(f"  ✅ {len(products)} produse din {sub_name}\n")
                    time.sleep(2)
            
            # Dacă NU are subcategorii, preia produse direct din categoria principală
            else:
                print(f"  ℹ️  Fără subcategorii - se preiau produse direct din categoria principală\n")
                
                products = self.scrape_products_from_url(
                    cat_url,
                    cat_name
                )
                
                self.all_products.extend(products)
                print(f"  ✅ {len(products)} produse\n")
                time.sleep(2)
    
    def save_json(self, filename):
        """Salvează rezultatele în JSON"""
        
        # Deduplicare finală - păstrează doar prima apariție a fiecărui produs
        seen_urls = set()
        unique_products = []
        duplicates_removed = 0
        
        for product in self.all_products:
            product_url = product.get('url', '')
            if product_url not in seen_urls:
                seen_urls.add(product_url)
                unique_products.append(product)
            else:
                duplicates_removed += 1
        
        if duplicates_removed > 0:
            print(f"\n🔧 Deduplicare: eliminat {duplicates_removed} duplicate")
            self.stats["duplicate_evitate"] = duplicates_removed
            self.stats["produse"] = len(unique_products)
        
        data = {
            "metadata": {
                "source_url": self.start_url,
                "limba": "en",
                "data_scraping": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "verificare_stricta_categorii": self.strict_category_check,
                "total_categorii": self.stats["categorii"],
                "total_subcategorii": self.stats["subcategorii"],
                "total_produse": self.stats["produse"],
                "duplicate_eliminate": self.stats["duplicate_evitate"],
                "produse_filtrate": self.stats["produse_filtrate"],
                "erori": self.stats["erori"]
            },
            "arbore_categorii": self.category_tree,
            "produse": unique_products
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print("\n" + "="*60)
        print("✅ SCRAPING FINALIZAT")
        print("="*60)
        print(f"📁 Fișier: {filename}")
        print(f"📊 Statistici:")
        print(f"   - Categorii: {self.stats['categorii']}")
        print(f"   - Subcategorii: {self.stats['subcategorii']}")
        print(f"   - Produse unice: {self.stats['produse']}")
        print(f"   - Duplicate eliminate: {self.stats['duplicate_evitate']}")
        print(f"   - Produse filtrate (categorie greșită): {self.stats['produse_filtrate']}")
        print(f"   - Erori: {self.stats['erori']}")
        print("="*60)

def main():
    parser = argparse.ArgumentParser(description='Prosista Scraper v2.0')
    parser.add_argument('--limit', type=int, help='Limită produse per categorie')
    parser.add_argument('--output', type=str, default='prosista_catalog_v2.json', help='Fișier output')
    parser.add_argument('--no-strict-check', action='store_true', 
                        help='Dezactivează verificarea strictă a apartenenței la categorie (mai rapid dar mai puțin precis)')
    
    args = parser.parse_args()
    
    scraper = ProsistaScraper(
        limit=args.limit,
        strict_category_check=not args.no_strict_check
    )
    
    try:
        print("🚀 PROSISTA SCRAPER v2.0")
        print("="*60)
        print(f"Verificare strictă categorii: {'DA' if not args.no_strict_check else 'NU'}")
        if args.limit:
            print(f"Limită: {args.limit} produse/categorie")
        print("="*60 + "\n")
        
        # Pasul 1: Construiește arborele de categorii
        scraper.build_category_tree()
        
        # Pasul 2: Preia toate produsele
        scraper.scrape_all_products()
        
        # Pasul 3: Salvează
        scraper.save_json(args.output)
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Întrerupt de utilizator")
        print("💾 Salvare date parțiale...")
        scraper.save_json(args.output.replace('.json', '_partial.json'))

if __name__ == "__main__":
    main()