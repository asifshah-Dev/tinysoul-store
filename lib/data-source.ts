// lib/data-source.ts
import productsData from '@/data/all-products.json';

export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  productType?: string;
  vendor?: string;
  price?: string;
  compareAtPrice?: string | null;
  image?: string | null;
  variants: {
    edges: Array<{
      node: {
        id: string;
        title?: string;
        price: {
          amount: string;
        };
        compareAtPrice?: string | null;
        availableForSale: boolean;
        selectedOptions?: Array<{ name: string; value: string }>;
      };
    }>;
  };
  options?: Array<{ name: string; values: string[] }>;
  images: {
    edges: Array<{
      node: {
        url: string;
        altText: string | null;
        width: number;
        height: number;
      };
    }>;
  };
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    return productsData.map((p: any) => {
      // Get images from the images array
      const imageUrls = p.images || [];

      // Get price from first variant or direct price
      const priceAmount = p.variants?.[0]?.price || p.price || '0';

      // Get compare-at price from first variant or direct field
      const compareAtAmount =
        p.variants?.[0]?.compareAtPrice ?? p.compareAtPrice ?? null;

      // Get first variant id
      const variantId = p.variants?.[0]?.id || p.id || '';

      return {
        id: p.id || '',
        title: p.title || '',
        handle: p.handle || '',
        description: p.description || '',
        productType: p.productType || 'Uncategorized',
        vendor: p.vendor || 'TinySoul',
        price: priceAmount,
        compareAtPrice: compareAtAmount,
        image: imageUrls.length > 0 ? imageUrls[0] : null,

        // ═══ NEW: pass through options (list of colors, sizes) ═══
        options: (p.options || []).map((opt: any) => ({
          name: opt.name || '',
          values: opt.values || [],
        })),

        variants: {
          edges: (p.variants || []).map((v: any) => ({
            node: {
              id: v.id || variantId || p.id || '',
              // ═══ NEW: keep variant title like "Purple / 13-14 years" ═══
              title: v.title || '',
              price: {
                amount: v.price || priceAmount,
              },
              compareAtPrice:
                v.compareAtPrice ?? p.compareAtPrice ?? null,
              availableForSale: v.availableForSale !== undefined ? v.availableForSale : true,
              // ═══ NEW: keep selectedOptions (color, size) ═══
              selectedOptions: Array.isArray(v.selectedOptions)
                ? v.selectedOptions.map((o: any) => ({
                    name: o.name || '',
                    value: o.value || '',
                  }))
                : [],
            }
          }))
        },
        images: {
          edges: imageUrls.map((img: string) => ({
            node: {
              url: img,
              altText: p.title || '',
              width: 400,
              height: 500,
            }
          }))
        }
      };
    });
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
}

export async function fetchProductByHandle(handle: string): Promise<Product | null> {
  const products = await fetchProducts();
  return products.find(p => p.handle === handle) || null;
}