import { use } from 'react';
import ProductClientPage from '@/components/ProductClientPage';
import { fetchProducts } from '@/lib/data-source';

interface PageProps {
  params: Promise<{
    handle: string;
  }>;
}

export async function generateStaticParams() {
  const products = await fetchProducts();
  return products.map((product: any) => ({
    handle: product.handle,
  }));
}

export default function Page({ params }: PageProps) {
  const resolvedParams = use(params);
  return <ProductClientPage handle={resolvedParams.handle} />;
}