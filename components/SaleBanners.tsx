'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1] as const;
const AUTOPLAY_MS = 6500;

const PALETTE = {
  cream: '#FDF6E3',
  creamDeep: '#F5E6C8',
  teal: '#0F766E',
  coral: '#F4713A',
  ink: '#1c130d',
  muted: '#6f6248',
};

// ═══════════════════════════════════════════════════════════
// Global cache for background-removed images.
// Each image is processed exactly ONCE — subsequent renders
// (including slide loops) reuse the cached PNG data URL.
// ═══════════════════════════════════════════════════════════
const bgRemovedCache = new Map<string, string>();

function BgRemovedImage({
  src,
  alt,
  width,
  height,
  className,
  tolerance = 245,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  tolerance?: number;
}) {
  const [processedSrc, setProcessedSrc] = useState<string>(
    () => bgRemovedCache.get(src) ?? src
  );
  const [isProcessing, setIsProcessing] = useState(
    () => !bgRemovedCache.has(src)
  );

  useEffect(() => {
    // Already cached → nothing to do
    if (bgRemovedCache.has(src)) {
      setProcessedSrc(bgRemovedCache.get(src)!);
      setIsProcessing(false);
      return;
    }

    let isMounted = true;
    const img = new Image();
    if (src.startsWith('http')) img.crossOrigin = 'anonymous';

    img.onload = () => {
      if (!isMounted) return;
      try {
        const canvas = document.createElement('canvas');
        const w = img.naturalWidth || width;
        const h = img.naturalHeight || height;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          setIsProcessing(false);
          return;
        }

        ctx.drawImage(img, 0, 0, w, h);
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          if (
            data[i] >= tolerance &&
            data[i + 1] >= tolerance &&
            data[i + 2] >= tolerance
          ) {
            data[i + 3] = 0;
          }
        }
        ctx.putImageData(imageData, 0, 0);
        const out = canvas.toDataURL('image/png');
        bgRemovedCache.set(src, out);
        if (isMounted) {
          setProcessedSrc(out);
          setIsProcessing(false);
        }
      } catch {
        bgRemovedCache.set(src, src);
        if (isMounted) {
          setProcessedSrc(src);
          setIsProcessing(false);
        }
      }
    };
    img.onerror = () => {
      bgRemovedCache.set(src, src);
      if (isMounted) {
        setProcessedSrc(src);
        setIsProcessing(false);
      }
    };
    img.src = src;
    return () => {
      isMounted = false;
    };
  }, [src, width, height, tolerance]);

  return (
    <div className={`${className} relative flex items-center justify-center`}>
      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="w-8 h-8 border-[3px] border-[#F4713A]/30 border-t-[#F4713A] rounded-full animate-spin" />
        </div>
      )}
      <img
        src={processedSrc}
        alt={alt}
        width={width}
        height={height}
        loading="eager"
        decoding="async"
        className={`w-auto h-[95%] object-contain transition-opacity duration-500 ${
          isProcessing ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          filter: 'drop-shadow(0 30px 60px rgba(43,43,43,0.18))',
          willChange: 'transform, opacity',
        }}
      />
    </div>
  );
}

interface Slide {
  id: string;
  href: string;
  title: string;
  subtitle: string;
  cta: string;
  image: string;
  accent: string;
}

const SLIDES: Slide[] = [
  {
    id: 'boys',
    href: '/products/winter',
    title: 'Boys\nCollection',
    subtitle: 'Bold prints, cozy fabrics, everyday comfort — made for play.',
    cta: 'Shop Boys',
    image: '/images/banner_boys.jpg',
    accent: PALETTE.teal,
  },
  {
    id: 'girls',
    href: '/products/summer',
    title: 'Girls\nCollection',
    subtitle: 'Festive frocks, embroidered suits & everyday charm.',
    cta: 'Shop Girls',
    image: '/images/banner_girls.jpg',
    accent: PALETTE.coral,
  },
  {
    id: 'new-arrivals',
    href: '/products/new-arrivals',
    title: 'New\nArrivals',
    subtitle: 'Fresh styles, just landed — be the first to wear them.',
    cta: 'Shop New In',
    image: '/images/cat-new.jpg',
    accent: '#E8B400',
  },
];

export default function SaleBanners() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isHovering, setIsHovering] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const reduce = !!prefersReducedMotion;

  // ═══ Interval ref so we don't re-create it on every index change ═══
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => {
    setDirection(1);
    setIndex((i) => (i + 1) % SLIDES.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  // ═══ Autoplay — single interval, paused on hover, torn down cleanly ═══
  useEffect(() => {
    if (isHovering || reduce) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    intervalRef.current = setInterval(next, AUTOPLAY_MS);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isHovering, next, reduce]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next]);

  const slide = SLIDES[index];

  // ═══ Memoized slide-derived values ═══
  const slideTitleLines = useMemo(
    () => slide.title.split('\n'),
    [slide.title]
  );

  // ═══ Memoized animation variants — created once, not per render ═══
  const titleContainer = useMemo(
    () => ({
      hidden: {},
      show: {
        transition: {
          staggerChildren: reduce ? 0 : 0.12,
          delayChildren: reduce ? 0 : 0.1,
        },
      },
      exit: {
        transition: {
          staggerChildren: reduce ? 0 : 0.05,
          staggerDirection: -1,
        },
      },
    }),
    [reduce]
  );

  const titleLine = useMemo(
    () => ({
      hidden: {
        opacity: 0,
        y: reduce ? 0 : 40,
        filter: reduce ? 'blur(0px)' : 'blur(12px)',
      },
      show: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.8, ease: EASE },
      },
      exit: {
        opacity: 0,
        y: reduce ? 0 : -20,
        filter: reduce ? 'blur(0px)' : 'blur(8px)',
        transition: { duration: 0.3, ease: EASE },
      },
    }),
    [reduce]
  );

  const fadeUp = useMemo(
    () => ({
      hidden: { opacity: 0, y: reduce ? 0 : 16 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: EASE, delay: 0.35 },
      },
      exit: {
        opacity: 0,
        y: reduce ? 0 : -12,
        transition: { duration: 0.25, ease: EASE },
      },
    }),
    [reduce]
  );

  const underlineVariant = useMemo(
    () => ({
      hidden: { scaleX: 0, originX: 0 },
      show: {
        scaleX: 1,
        transition: { duration: 0.7, ease: EASE, delay: 0.4 },
      },
      exit: { scaleX: 0, transition: { duration: 0.3, ease: EASE } },
    }),
    []
  );

  const buttonVariant = useMemo(
    () => ({
      hidden: {
        opacity: 0,
        y: reduce ? 0 : 20,
        scale: reduce ? 1 : 0.9,
      },
      show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: 0.6,
          ease: EASE,
          delay: 0.55,
          type: 'spring' as const,
          stiffness: 300,
          damping: 20,
        },
      },
      exit: {
        opacity: 0,
        y: reduce ? 0 : -10,
        scale: 0.95,
        transition: { duration: 0.25 },
      },
    }),
    [reduce]
  );

  const dotsStagger = useMemo(
    () => ({
      hidden: {},
      show: {
        transition: {
          staggerChildren: reduce ? 0 : 0.08,
          delayChildren: reduce ? 0 : 0.75,
        },
      },
      exit: { transition: { duration: 0.15 } },
    }),
    [reduce]
  );

  const dotItem = useMemo(
    () => ({
      hidden: { opacity: 0, y: reduce ? 0 : 8 },
      show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
      exit: { opacity: 0, transition: { duration: 0.15 } },
    }),
    [reduce]
  );

  const imageVariant = useMemo(
    () => ({
      enter: (dir: 1 | -1) => ({
        opacity: 0,
        x: reduce ? 0 : dir > 0 ? 80 : -80,
        scale: reduce ? 1 : 0.9,
        rotate: reduce ? 0 : dir > 0 ? 4 : -4,
      }),
      center: {
        opacity: 1,
        x: 0,
        scale: 1,
        rotate: 0,
        transition: { duration: 0.9, ease: EASE },
      },
      exit: (dir: 1 | -1) => ({
        opacity: 0,
        x: reduce ? 0 : dir > 0 ? -60 : 60,
        scale: reduce ? 1 : 0.95,
        rotate: reduce ? 0 : dir > 0 ? -3 : 3,
        transition: { duration: 0.4, ease: EASE },
      }),
    }),
    [reduce]
  );

  // ═══ Trust dots data — created once ═══
  const trustItems = useMemo(
    () => [
      { label: 'Free Shipping', color: PALETTE.teal },
      { label: 'Easy Returns', color: PALETTE.coral },
      { label: 'Premium Fabric', color: '#7CB342' },
    ],
    []
  );

  return (
    <section
      className="relative w-full -mt-px"
      style={{ backgroundColor: PALETTE.cream, borderTop: 'none' }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Gradient background — static, never re-renders */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, #FDF6E3 0%, #F5E6C8 100%)' }}
      />

      {/* Accent blob — animates via style updates, no remount */}
      <motion.div
        aria-hidden
        animate={{
          background: `radial-gradient(circle, ${slide.accent}33 0%, transparent 70%)`,
        }}
        transition={{ duration: 0.8, ease: EASE }}
        className="absolute top-1/2 -translate-y-1/2 -right-40 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          filter: 'blur(80px)',
          willChange: 'background',
        }}
      />

      {/* Dotted texture */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${PALETTE.ink} 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* ARROWS */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-2 md:left-4 lg:left-6 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full border shadow-lg transition-transform hover:scale-110 active:scale-95"
        style={{
          backgroundColor: PALETTE.cream,
          borderColor: PALETTE.creamDeep,
          color: PALETTE.ink,
          willChange: 'transform',
        }}
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-2 md:right-4 lg:right-6 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full border shadow-lg transition-transform hover:scale-110 active:scale-95"
        style={{
          backgroundColor: PALETTE.cream,
          borderColor: PALETTE.creamDeep,
          color: PALETTE.ink,
          willChange: 'transform',
        }}
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* Content wrapper */}
      <div className="relative w-full max-w-[1200px] mx-auto px-16 md:px-24 lg:px-28 pt-24 md:pt-28 pb-16 md:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center md:h-[520px] lg:h-[540px]">

          {/* LEFT — text */}
          <div className="text-center md:text-left order-2 md:order-1 flex items-center md:h-full">
            <div className="w-full flex flex-col justify-center">

              {/* TITLE */}
              <div className="md:h-[200px] lg:h-[220px] flex items-end md:items-center justify-center md:justify-start">
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={`title-${slide.id}`}
                    variants={titleContainer}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    className="font-black leading-[0.9] tracking-[-0.045em] text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
                    style={{ color: PALETTE.ink, willChange: 'transform, opacity, filter' }}
                  >
                    {slideTitleLines.map((line, i) => (
                      <motion.span
                        key={`${slide.id}-line-${i}`}
                        variants={titleLine}
                        className="block"
                        style={{ willChange: 'transform, opacity, filter' }}
                      >
                        {line}
                      </motion.span>
                    ))}
                  </motion.h2>
                </AnimatePresence>
              </div>

              {/* UNDERLINE */}
              <motion.div
                key={`underline-${slide.id}`}
                variants={underlineVariant}
                initial="hidden"
                animate="show"
                exit="exit"
                className="mt-4 md:mt-5 h-1 w-24 md:w-32 rounded-full mx-auto md:mx-0"
                style={{
                  backgroundColor: slide.accent,
                  originX: 0,
                  willChange: 'transform',
                }}
              />

              {/* SUBTITLE */}
              <div className="md:h-[80px] mt-4 md:mt-6 flex items-start justify-center md:justify-start">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={`sub-${slide.id}`}
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    className="text-base md:text-lg leading-relaxed max-w-md mx-auto md:mx-0"
                    style={{ color: PALETTE.muted, willChange: 'transform, opacity' }}
                  >
                    {slide.subtitle}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* BUTTONS */}
              <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-center md:justify-start">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`btn-${slide.id}`}
                    variants={buttonVariant}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    whileHover={reduce ? {} : { scale: 1.05, y: -3 }}
                    whileTap={reduce ? {} : { scale: 0.96 }}
                    style={{ willChange: 'transform, opacity' }}
                  >
                    <Link
                      href={slide.href}
                      className="group inline-flex items-center gap-3 px-8 md:px-10 py-4 rounded-full font-black text-base md:text-lg text-white shadow-[0_14px_30px_-10px_rgba(28,19,13,0.4)] transition-colors duration-300"
                      style={{ backgroundColor: slide.accent }}
                    >
                      {slide.cta}
                      <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </motion.div>
                </AnimatePresence>

                <Link
                  href="/products"
                  className="group inline-flex items-center gap-2 text-sm md:text-base font-black uppercase tracking-[0.22em] transition-colors"
                  style={{ color: PALETTE.ink }}
                >
                  Browse All
                  <span
                    className="w-6 h-px transition-all duration-300 group-hover:w-10"
                    style={{ backgroundColor: PALETTE.ink }}
                  />
                </Link>
              </div>

              {/* TRUST DOTS */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`trust-${slide.id}`}
                  variants={dotsStagger}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="mt-6 md:mt-8 flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2"
                >
                  {trustItems.map((item) => (
                    <motion.div
                      key={item.label}
                      variants={dotItem}
                      className="flex items-center gap-2"
                    >
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: reduce ? 0 : 0.9,
                          duration: 0.3,
                          ease: EASE,
                        }}
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span
                        className="text-xs font-black uppercase tracking-[0.18em]"
                        style={{ color: PALETTE.muted }}
                      >
                        {item.label}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT — image */}
          <div className="relative w-full aspect-square order-1 md:order-2 md:aspect-auto md:h-full">
            <div
              aria-hidden
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[600px] h-[400px] md:h-[600px] rounded-full pointer-events-none opacity-70"
              style={{
                background: `radial-gradient(circle, ${slide.accent}22 0%, transparent 65%)`,
                filter: 'blur(50px)',
              }}
            />

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`img-${slide.id}`}
                custom={direction}
                variants={imageVariant}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0"
                style={{ willChange: 'transform, opacity' }}
              >
                <BgRemovedImage
                  src={slide.image}
                  alt={slide.title}
                  width={1200}
                  height={1200}
                  className="w-full h-full"
                  tolerance={245}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Dots */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-2 rounded-full border shadow-md"
          style={{
            backgroundColor: PALETTE.cream,
            borderColor: PALETTE.creamDeep,
          }}
        >
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > index ? 1 : -1);
                setIndex(i);
              }}
              aria-label={`Go to slide ${i + 1}`}
            >
              <span
                className="block rounded-full transition-all duration-500"
                style={{
                  backgroundColor: i === index ? slide.accent : '#1c130d33',
                  width: i === index ? 24 : 6,
                  height: 6,
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}