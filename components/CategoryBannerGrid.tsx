// components/CategoryBannerGrid.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface CategoryBanner {
  href: string;
  title: string;
  subtitle?: string;
  image: string;
  color: string; // gradient bottom color
}

interface CategoryBannerGridProps {
  banners: CategoryBanner[];
  heading?: string;
}

const EASE = [0.16, 1, 0.3, 1] as const;

// ═══ Swapped gradient colors ═══
const SUMMER_COLOR = '#aa4e36'; // Winter's original color
const WINTER_COLOR = '#5fb9e6'; // Summer's original color

export default function CategoryBannerGrid({
  banners,
  heading = 'Shop by Collection',
}: CategoryBannerGridProps) {
  return (
    <section className="container mx-auto px-4 md:px-6 py-12 md:py-16">
      {heading && (
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-xl md:text-2xl font-bold text-[#1c130d] mb-6 md:mb-8"
        >
          {heading}
        </motion.h2>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {banners.map((banner, i) => {
          // ═══ Flip gradient color between Summer and Winter ═══
          const key = `${banner.href} ${banner.title}`.toLowerCase();
          let resolvedColor = banner.color;

          if (key.includes('summer')) {
            resolvedColor = SUMMER_COLOR;
          } else if (key.includes('winter')) {
            resolvedColor = WINTER_COLOR;
          }

          return (
            <motion.div
              key={banner.href}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.7, ease: EASE, delay: i * 0.1 }}
            >
              <Link
                href={banner.href}
                className="group relative block aspect-[4/5] rounded-3xl overflow-hidden bg-[#f3ecdf]"
              >
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                />

                {/* Colored gradient fade at bottom */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `linear-gradient(180deg, transparent 45%, ${resolvedColor}dd 90%, ${resolvedColor} 100%)`,
                  }}
                />

                {/* Text */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-7">
                  {banner.subtitle && (
                    <span className="block text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-white/85 mb-2">
                      {banner.subtitle}
                    </span>
                  )}
                  <h3 className="text-2xl md:text-3xl font-black text-white leading-tight">
                    {banner.title}
                  </h3>
                  <span className="inline-flex items-center gap-2 mt-3 text-xs font-bold uppercase tracking-widest text-white/95">
                    Shop now
                    <span className="w-5 h-px bg-current transition-all duration-300 group-hover:w-8" />
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}