// app/products/[category]/page.tsx
import { notFound } from 'next/navigation';
import { fetchProducts } from '@/lib/data-source';
import ProductsClient from '@/components/ProductsClient';

const CATEGORY_LABELS: Record<string, string> = {
  'new-arrivals': 'New Arrivals',
  'summer': 'Summer Collection',
  'winter': 'Winter Collection',
  'sale': 'On Sale',
};

export function generateStaticParams() {
  return Object.keys(CATEGORY_LABELS).map((category) => ({ category }));
}

type PageProps = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { category } = await params;
  const label = CATEGORY_LABELS[category];
  return {
    title: label || 'Products',
    description: `Browse our ${label || 'products'} collection`,
  };
}

// ============================================================
// PRICE HELPERS — safe for both data shapes
// ============================================================
function getFirstVariant(product: any): any {
  if (!product?.variants) return null;
  if (Array.isArray(product.variants)) return product.variants[0] || null;
  if (Array.isArray(product.variants.edges)) {
    return product.variants.edges[0]?.node || null;
  }
  return null;
}

function getPrice(product: any): number {
  const variant = getFirstVariant(product);
  const raw =
    (typeof variant?.price === 'string' && variant.price) ||
    variant?.price?.amount ||
    product?.price ||
    '0';
  const n = parseFloat(raw);
  return isNaN(n) ? 0 : n;
}

function getCompareAtPrice(product: any): number {
  const variant = getFirstVariant(product);
  const raw =
    (typeof variant?.compareAtPrice === 'string' && variant.compareAtPrice) ||
    variant?.compareAtPrice?.amount ||
    '0';
  const n = parseFloat(raw);
  return isNaN(n) ? 0 : n;
}

function isOnSale(product: any): boolean {
  const price = getPrice(product);
  const compareAt = getCompareAtPrice(product);
  return compareAt > price && price > 0;
}

// ============================================================

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;

  const label = CATEGORY_LABELS[category];
  if (!label) notFound();

  const allProducts = await fetchProducts();

  let filtered = allProducts;

  if (category === 'sale') {
    filtered = allProducts.filter((p: any) => isOnSale(p));
  } else if (category === 'new-arrivals') {
    filtered = allProducts.slice(0, 12);
  } else if (category === 'summer') {
    // Summer = all girls' items
    filtered = allProducts.filter((p: any) => {
      const title = (p.title || '').toLowerCase();
      const type = (p.productType || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      return (
        title.includes('girl') ||
        type.includes('girl') ||
        desc.includes('girl')
      );
    });
  } else if (category === 'winter') {
    // ✅ Winter = ONLY boys' track suits
    filtered = allProducts.filter((p: any) => {
      const type = (p.productType || '').toLowerCase().trim();
      const title = (p.title || '').toLowerCase();
      return type === 'track suit' && title.includes('boy');
    });
  }

  return (
    <main className="pt-24 md:pt-28">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-teal-700 tracking-tight">
            {label}
          </h1>
          <p className="mt-2 text-gray-500">
            {filtered.length} products available
          </p>
        </div>
        <ProductsClient initialProducts={filtered} />
      </div>
    </main>
  );
}