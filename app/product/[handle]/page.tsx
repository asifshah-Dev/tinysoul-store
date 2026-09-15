import { use } from 'react';
import { notFound } from 'next/navigation';
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

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;

  // Optional: verify the product exists before rendering.
  // If you want to skip this check for performance, just remove it.
  const products = await fetchProducts();
  const exists = products.some((p: any) => p.handle === resolvedParams.handle);
  if (!exists) notFound();

  return <ProductClientPage handle={resolvedParams.handle} />;
}