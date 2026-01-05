export const CONTACT_INFO = {
  email: 'office@prosista.ro',
  phone: '+40723643578',
  phoneDisplay: '0723 643 578',
  address: 'Com Bucov, sat Pleasa, str Dimitrie Cantemir, nr.311, jud Prahova cod 107113',
  workingHours: 'Luni - Vineri: 09:00 - 18:00',
};

export const SOCIAL_LINKS = [
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/prosistatavan',
    iconPath: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/company/prosistatavan',
    iconPath: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
];

// Mapare categorii -> imagini default
export const CATEGORY_IMAGES: Record<string, string> = {
  'panouri-lana-lemn': '/images/products/panouri-lana-lemn.jpg',
  'panouri-lana-minerala': '/images/products/panouri-lana-minerala.jpg',
  'panouri-acustice-tapisate': '/images/products/panouri-acustice-tapisate.jpg',
  'tavane-metalice': '/images/products/tavane-metalice.jpg',
  'tavane-lemn': '/images/products/tavane-lemn.jpg',
  'sisteme-purtatoare': '/images/products/sisteme-purtatoare.jpg',
  'panouri-gips-vinil': '/images/products/gips-vinil.jpg',
  'profile-gips-carton': '/images/products/profile-gips.jpg',
  'sisteme-de-tavane-metalice': '/images/products/sisteme-de-tavane-metalice.jpg',
  'panouri-din-fibra-de-lemn': '/images/products/panouri-din-fibra-de-lemn.jpg',
  'panouri-din-vata-minerala': '/images/products/panouri-din-vata-minerala.jpg',
  'baffle-linear': '/images/products/tavane-metalice.jpg',
  'open-cell': '/images/products/tavane-metalice.jpg',
  'mesh-expandat': '/images/products/tavane-metalice.jpg',
  'tip-caseta': '/images/products/tavane-metalice.jpg',
  'plank-linear': '/images/products/tavane-metalice.jpg',
  'tavane-tip-baffle-si-liniare': '/images/products/tavane-tip-baffle-si-liniare.jpg',
};

// Imagine default pentru produse și categorii
export const DEFAULT_PRODUCT_IMAGE = '/images/products/tavane-metalice.jpg';
export const DEFAULT_CATEGORY_IMAGE = '/images/products/tavane-metalice.jpg';

/**
 * Returnează o imagine cu fallback pentru o categorie
 */
export function getCategoryImage(categorySlug: string | undefined | null): string {
  if (!categorySlug) return DEFAULT_CATEGORY_IMAGE;
  return CATEGORY_IMAGES[categorySlug] || DEFAULT_CATEGORY_IMAGE;
}

/**
 * Returnează o imagine cu fallback pentru un produs
 */
export function getProductImage(
  productImage: string | undefined | null,
  categorySlug: string | undefined | null
): string {
  if (productImage) return productImage;
  return getCategoryImage(categorySlug);
}

/**
 * Returnează un array de imagini cu fallback pentru un produs
 */
export function getProductImages(
  productImages: string[] | undefined | null,
  categorySlug: string | undefined | null
): string[] {
  if (productImages && productImages.length > 0) {
    return productImages;
  }
  const fallbackImage = getCategoryImage(categorySlug);
  return [fallbackImage];
}

