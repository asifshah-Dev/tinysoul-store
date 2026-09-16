// app/page.tsx
import Link from 'next/link';
import { fetchProducts } from '@/lib/data-source';
import ProductCard from '@/components/ProductCard';
import ProductsClient from '@/components/ProductsClient';
import CategoryStrip from '@/components/CategoryStrip';
import CategoryBannerGrid from '@/components/CategoryBannerGrid';
import SaleBanners from '@/components/SaleBanners';
import PromoStrip from '@/components/PromoStrip';

export default async function Home() {
  const products = await fetchProducts();

  return (
    <main
      className="relative min-h-screen isolate"
      style={{ backgroundColor: '#FDF6E3' }}
    >
      {/* Blob layer */}
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

      {/* Content */}
      <div className="relative z-10">
        <SaleBanners />

        <CategoryBannerGrid
          heading="Shop by Collection"
          banners={[
            {
              href: '/products/summer',
              title: 'Summer',
              subtitle: 'Cool & bright',
              image: '/images/banner/cat-summer.jpg',
              color: '#3ba9e0',
            },
            {
              href: '/products/winter',
              title: 'Winter',
              subtitle: 'Warm & cozy',
              image: '/images/banner/cat-winter.jpg',
              color: '#a03a20',
            },
            {
              href: '/products/new-arrivals',
              title: 'New In',
              subtitle: 'Fresh drops',
              image: '/images/banner/cat-new.jpg',
              color: '#5cb85c',
            },
          ]}
        />

        <CategoryStrip />

        {/* Featured Products — flows straight into the footer now */}
        <section className="container mx-auto px-4 pt-10 md:pt-12 pb-4">
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