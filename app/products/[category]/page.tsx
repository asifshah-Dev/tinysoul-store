// app/products/[category]/page.tsx
import { notFound } from 'next/navigation';
import { fetchProducts } from '@/lib/data-source';
import ProductsClient from '@/components/ProductsClient';

const CATEGORY_LABELS: Record<string, string> = {
  'new-arrivals': 'New Arrivals',
  'summer': 'Summer Collection',
  'winter': 'Winter Collection',
  'sale': 'On Sale',
  'girls-summer': 'Girls Summer',
  'boys-winter': 'Boys Winter',
};

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

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;

  const label = CATEGORY_LABELS[category];
  if (!label) notFound();

  const allProducts = await fetchProducts();

  let filtered = allProducts;

  if (category === 'sale') {
    filtered = allProducts.filter((p: any) => {
      const title = (p.title || '').toLowerCase();
      const type = (p.productType || '').toLowerCase();
      return title.includes('sale') || type.includes('sale');
    });
    if (filtered.length === 0) filtered = allProducts;
  } else if (category === 'new-arrivals') {
    filtered = allProducts.slice(0, 12);
  } else if (category === 'summer' || category === 'girls-summer') {
    filtered = allProducts.filter((p: any) => {
      const type = (p.productType || '').toLowerCase();
      const title = (p.title || '').toLowerCase();
      return (
        type.includes('summer') ||
        title.includes('summer') ||
        type.includes('girls') ||
        title.includes('girls')
      );
    });
    if (filtered.length === 0) filtered = allProducts;
  } else if (category === 'winter' || category === 'boys-winter') {
    filtered = allProducts.filter((p: any) => {
      const type = (p.productType || '').toLowerCase();
      const title = (p.title || '').toLowerCase();
      return (
        type.includes('winter') ||
        title.includes('winter') ||
        type.includes('boys') ||
        title.includes('boys')
      );
    });
    if (filtered.length === 0) filtered = allProducts;
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