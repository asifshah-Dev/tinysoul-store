// components/PromoStrip.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface PromoStripProps {
  image: string;
  title: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  bgColor?: string;
  imageSide?: 'left' | 'right';
}

const EASE = [0.16, 1, 0.3, 1] as const;

export default function PromoStrip({
  image,
  title,
  description,
  ctaText = 'Discover',
  ctaLink = '/products',
  bgColor = '#fae7dd',
  imageSide = 'right',
}: PromoStripProps) {
  return (
    <section className="container mx-auto px-4 md:px-6 py-12 md:py-16">
      <div
        className="rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2 items-stretch"
        style={{ backgroundColor: bgColor }}
      >
        {/* Image */}
        <div
          className={`relative min-h-[260px] md:min-h-[380px] ${
            imageSide === 'left' ? 'md:order-1' : 'md:order-2'
          }`}
        >
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: EASE }}
          className={`flex flex-col justify-center p-8 md:p-12 lg:p-16 ${
            imageSide === 'left' ? 'md:order-2' : 'md:order-1'
          }`}
        >
          <h3 className="text-2xl md:text-4xl font-black text-[#1c130d] leading-tight tracking-tight">
            {title}
          </h3>
          {description && (
            <p className="mt-4 text-sm md:text-base text-[#4a3d2e] max-w-md leading-relaxed">
              {description}
            </p>
          )}
          {ctaLink && (
            <Link
              href={ctaLink}
              className="group inline-flex items-center gap-3 mt-8 self-start px-7 py-3.5 bg-[#1c130d] text-white font-bold text-sm md:text-base rounded-full hover:bg-[#a03a20] transition-colors duration-300"
            >
              {ctaText}
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          )}
        </motion.div>
      </div>
    </section>
  );
}