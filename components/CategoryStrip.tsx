// components/CategoryStrip.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Sun, Snowflake, Tag, X, LayoutGrid } from 'lucide-react';

interface Category {
  href: string;
  label: string;
  Icon: any;
  bg: string;
  text: string;
  border: string;
}

const CATEGORIES: Category[] = [
  {
    href: '/products/new-arrivals',
    label: 'New Arrivals',
    Icon: Sparkles,
    bg: 'bg-[#e6fae6]',
    text: 'text-[#0f8a0f]',
    border: 'border-[#7ee07e]',
  },
  {
    href: '/products/summer',
    label: 'Summer',
    Icon: Sun,
    bg: 'bg-[#fff3d1]',
    text: 'text-[#d97706]',
    border: 'border-[#ffc94d]',
  },
  {
    href: '/products/winter',
    label: 'Winter',
    Icon: Snowflake,
    bg: 'bg-[#dcf3ff]',
    text: 'text-[#0284c7]',
    border: 'border-[#7dd3fc]',
  },
  {
    href: '/products/sale',
    label: 'Sale',
    Icon: Tag,
    bg: 'bg-[#ffe4ee]',
    text: 'text-[#e11d6b]',
    border: 'border-[#ff8fb8]',
  },
];

const EASE = [0.16, 1, 0.3, 1] as const;

export default function CategoryStrip() {
  const [isOpen, setIsOpen] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen]);

  return (
    <>
      {/* ═══════════════════════════════════════════════════════
          SECTION WRAPPER — desktop grid + mobile trigger
          ═══════════════════════════════════════════════════════ */}
      <section className="container mx-auto px-4 pt-8 md:pt-10">
        <div className="flex items-center justify-between mb-4 md:mb-5">
          <h2 className="text-lg md:text-xl font-bold text-[#1c130d]">
            Shop by Category
          </h2>
          <Link
            href="/products"
            className="text-xs md:text-sm font-medium text-[#6f6248] hover:text-[#F4713A] transition-colors"
          >
            View all →
          </Link>
        </div>

        {/* ═══ DESKTOP — inline grid (hidden on mobile) ═══ */}
        <div className="hidden md:grid md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, i) => {
            const { Icon } = cat;
            return (
              <motion.div
                key={cat.href}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, ease: EASE, delay: i * 0.06 }}
              >
                <Link
                  href={cat.href}
                  className={`
                    group flex items-center gap-4 p-5 rounded-2xl
                    ${cat.bg} ${cat.border} border
                    hover:shadow-[0_8px_24px_-10px_rgba(43,43,43,0.15)]
                    hover:-translate-y-0.5
                    transition-all duration-300
                  `}
                >
                  <div
                    className={`
                      flex items-center justify-center
                      w-12 h-12 rounded-full
                      bg-white/80 ${cat.text}
                      group-hover:scale-110 transition-transform duration-300
                    `}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-base font-bold ${cat.text}`}>
                    {cat.label}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* ═══ MOBILE — single trigger button ═══ */}
        <button
          onClick={() => setIsOpen(true)}
          className="
            md:hidden w-full
            flex items-center justify-between
            px-5 py-4 rounded-2xl
            bg-[#fdf6e3] border border-[#f5e6c8]
            active:scale-[0.98]
            transition-transform duration-200
          "
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/70 text-[#F4713A]">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-[#1c130d]">
              Browse Categories
            </span>
          </div>
          <span className="text-xs font-medium text-[#6f6248]">
            {CATEGORIES.length} categories →
          </span>
        </button>
      </section>

      {/* ═══════════════════════════════════════════════════════
          MOBILE FULLSCREEN MODAL
          Only renders when isOpen = true. Zero cost when closed.
          ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="fixed inset-0 z-[60] bg-[#FFFCF6]/60 backdrop-blur-xl md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Sheet — slides up from bottom */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320, mass: 0.7 }}
              className="
                fixed inset-x-0 bottom-0 z-[61] md:hidden
                bg-[#FFFCF6] rounded-t-3xl
                border-t border-[#f5e6c8]
                shadow-[0_-20px_60px_-20px_rgba(43,43,43,0.25)]
                max-h-[85vh] overflow-y-auto
              "
              style={{ willChange: 'transform' }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-[#e8dcc6]" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#f5e6c8]">
                <h3 className="text-lg font-bold text-[#1c130d]">
                  Shop by Category
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 -mr-2 rounded-full text-[#2b2b2b] hover:bg-[#f5e6c8]/60 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category grid — 2 cols */}
              <div className="grid grid-cols-2 gap-3 p-5">
                {CATEGORIES.map((cat, i) => {
                  const { Icon } = cat;
                  return (
                    <motion.div
                      key={cat.href}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: EASE, delay: 0.05 + i * 0.05 }}
                    >
                      <Link
                        href={cat.href}
                        onClick={() => setIsOpen(false)}
                        className={`
                          group flex flex-col items-start gap-3 p-5 rounded-2xl
                          ${cat.bg} ${cat.border} border
                          active:scale-[0.97]
                          transition-transform duration-200
                        `}
                      >
                        <div
                          className={`
                            flex items-center justify-center
                            w-12 h-12 rounded-full
                            bg-white/80 ${cat.text}
                            group-active:scale-110 transition-transform duration-200
                          `}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className={`text-base font-bold ${cat.text}`}>
                          {cat.label}
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Browse all */}
              <div className="px-5 pb-8">
                <Link
                  href="/products"
                  onClick={() => setIsOpen(false)}
                  className="
                    block w-full text-center
                    px-6 py-3.5 rounded-2xl
                    bg-[#1c130d] text-[#fdfaf3]
                    text-sm font-bold
                    active:scale-[0.98] transition-transform duration-200
                  "
                >
                  Browse All Products
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}