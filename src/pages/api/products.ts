import type { APIRoute } from 'astro';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const PRODUCTS_FILE = join(process.cwd(), 'src/data/products.json');

export const GET: APIRoute = async () => {
  try {
    const data = await readFile(PRODUCTS_FILE, 'utf-8');
    const products = JSON.parse(data);
    return new Response(JSON.stringify(products), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to read products' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const data = await readFile(PRODUCTS_FILE, 'utf-8');
    const products = JSON.parse(data);
    
    // Update products data
    if (body.action === 'update') {
      // Update category
      if (body.type === 'category') {
        const index = products.categories.findIndex((c: any) => c.id === body.data.id);
        if (index !== -1) {
          products.categories[index] = { ...products.categories[index], ...body.data };
        }
      }
      // Update product
      else if (body.type === 'product') {
        // Find and update product in nested structure
        for (const category of products.categories) {
          // Check direct products
          const productIndex = category.products?.findIndex((p: any) => p.id === body.data.id);
          if (productIndex !== -1) {
            category.products[productIndex] = { ...category.products[productIndex], ...body.data };
            break;
          }
          // Check subcategory products
          for (const subcategory of category.subcategories || []) {
            const subProductIndex = subcategory.products?.findIndex((p: any) => p.id === body.data.id);
            if (subProductIndex !== -1) {
              subcategory.products[subProductIndex] = { ...subcategory.products[subProductIndex], ...body.data };
              break;
            }
          }
        }
      }
    }
    // Add new category
    else if (body.action === 'create' && body.type === 'category') {
      products.categories.push(body.data);
    }
    // Add new product
    else if (body.action === 'create' && body.type === 'product') {
      const category = products.categories.find((c: any) => c.id === body.categoryId);
      if (category) {
        if (body.subcategoryId) {
          const subcategory = category.subcategories?.find((s: any) => s.id === body.subcategoryId);
          if (subcategory) {
            if (!subcategory.products) subcategory.products = [];
            subcategory.products.push(body.data);
          }
        } else {
          if (!category.products) category.products = [];
          category.products.push(body.data);
        }
      }
    }
    // Delete
    else if (body.action === 'delete') {
      if (body.type === 'category') {
        products.categories = products.categories.filter((c: any) => c.id !== body.id);
      } else if (body.type === 'product') {
        for (const category of products.categories) {
          if (category.products) {
            category.products = category.products.filter((p: any) => p.id !== body.id);
          }
          if (category.subcategories) {
            for (const subcategory of category.subcategories) {
              if (subcategory.products) {
                subcategory.products = subcategory.products.filter((p: any) => p.id !== body.id);
              }
            }
          }
        }
      }
    }
    
    await writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
    return new Response(JSON.stringify({ success: true, data: products }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

