// app/page.tsx
import Link from 'next/link';
import { fetchProducts } from '@/lib/data-source';
import ProductCard from '@/components/ProductCard';
import Hero from '@/components/Hero';
import ProductsClient from '@/components/ProductsClient';

export default async function Home() {
  const products = await fetchProducts();

  const heroSlides = products.slice(0, 5).map((product: any) => ({
    id: product.id,
    title: product.title?.split('|')[0]?.trim() || product.title || 'New Arrival',
    subtitle: 'Product',
    description: product.description?.substring(0, 120) || '',
    image: product.images?.edges?.[0]?.node?.url || product.image || '',
    link: `/product/${product.handle}`,
    buttonText: 'View Product',
  }));

  return (
    <main className="relative min-h-screen bg-cream-50 isolate">

      {/* Blob layer — z-0, sits behind content, above the cream */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden z-0"
      >
        <div
          className="absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full blur-[120px] opacity-55"
          style={{ background: 'radial-gradient(circle, #FFC93C 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-10 right-1/4 h-[420px] w-[420px] rounded-full blur-[110px] opacity-45"
          style={{ background: 'radial-gradient(circle, #F4713A 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/3 -right-32 h-[520px] w-[520px] rounded-full blur-[120px] opacity-50"
          style={{ background: 'radial-gradient(circle, #FF6B9D 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/2 -left-32 h-[520px] w-[520px] rounded-full blur-[120px] opacity-45"
          style={{ background: 'radial-gradient(circle, #29ABE2 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-10 left-1/3 h-[420px] w-[420px] rounded-full blur-[120px] opacity-40"
          style={{ background: 'radial-gradient(circle, #7CB342 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 right-1/4 h-[420px] w-[420px] rounded-full blur-[120px] opacity-40"
          style={{ background: 'radial-gradient(circle, #9B59B6 0%, transparent 70%)' }}
        />
      </div>

      {/* Content wrapper — z-10, sits above the blobs */}
      <div className="relative z-10">

        {/* Hero Section */}
        <Hero slides={heroSlides} autoPlay={true} interval={5000} />

        {/* Products Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-cream-900 tracking-tight">
                Featured Products
              </h2>
              <p className="text-cream-700 text-sm mt-1">
                Premium kids wear from TinySoul Pakistan
              </p>
            </div>
            <Link
              href="/product"
              className="text-sm font-medium text-cream-700 hover:text-[#F4713A] transition-colors duration-300 flex items-center gap-1"
            >
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <ProductsClient initialProducts={products} isFeatured={true} />
        </section>
      </div>
    </main>
  );
}
// force rebuild