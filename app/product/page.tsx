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
    <main className="pt-24 md:pt-28">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-teal-700 tracking-tight">
            All Products
          </h1>
          <p className="mt-2 text-gray-500">
            {availableCount} products available
            {availableCount !== products.length && (
              <span className="text-gray-400">
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