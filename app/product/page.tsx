import { fetchProducts } from '@/lib/data-source';
import ProductsClient from '@/components/ProductsClient';

export const metadata = {
  title: 'All Products',
  description: 'Browse our complete collection of premium products',
};

export default async function ProductsPage() {
  const products = await fetchProducts();

  // Count products where the first variant is sold out (availableForSale === false)
  const availableCount = products.filter((p: any) => {
    const variants = p?.variants;
    let firstVariant: any = null;

    if (Array.isArray(variants)) firstVariant = variants[0] || null;
    else if (Array.isArray(variants?.edges)) firstVariant = variants.edges[0]?.node || null;

    if (!firstVariant) return true; // no variant info => treat as available
    return firstVariant.availableForSale !== false;
  }).length;

  return (
    <main
      className="min-h-screen pt-20 md:pt-24"
      style={{ backgroundColor: '#FDF6E3' }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1
            className="text-3xl md:text-4xl font-bold tracking-tight"
            style={{ color: '#0F766E' }}
          >
            All Products
          </h1>
          <p className="mt-2" style={{ color: '#6f6248' }}>
            {availableCount} products available
            {availableCount !== products.length && (
              <span style={{ color: '#948362' }}>
                {' '}
                ({products.length - availableCount} sold out)
              </span>
            )}
          </p>
        </div>
        <ProductsClient initialProducts={products} />
      </div>
    </main>
  );
}