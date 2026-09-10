import { use } from 'react';
import ProductClientPage from '@/components/ProductClientPage';

interface PageProps {
  params: Promise<{
    handle: string;
  }>;
}

export default function Page({ params }: PageProps) {
  const resolvedParams = use(params);
  return <ProductClientPage handle={resolvedParams.handle} />;
}