// components/Hero.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkle } from 'lucide-react';

interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  link?: string;
  buttonText?: string;
}

interface HeroProps {
  slides: HeroSlide[];
  autoPlay?: boolean;
  interval?: number;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Hero({ slides = [], autoPlay = true, interval = 5000 }: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!autoPlay || isHovering || slides.length === 0) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, isHovering, interval, slides.length]);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };
  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };
  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length]);

  if (!slides || slides.length === 0) return null;

  const currentSlide = slides[currentIndex];
  const reduce = !!prefersReducedMotion;

  const imageVariants = {
    enter: (dir: 1 | -1) => ({ opacity: 0, x: reduce ? 0 : dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0, transition: { duration: 0.9, ease: EASE } },
    exit: (dir: 1 | -1) => ({ opacity: 0, x: reduce ? 0 : dir > 0 ? -40 : 40, transition: { duration: 0.5, ease: EASE } }),
  };

  const contentContainer = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.09, delayChildren: 0.15 } },
  };

  const contentItem = {
    hidden: { opacity: 0, y: reduce ? 0 : 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
  };

  return (
    <div
      className="relative w-full overflow-hidden bg-white"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* ============================================================
          AMBIENT LOGO-COLOR BLOBS
          ============================================================ */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Sun yellow — top-left */}
        <motion.div
          className="absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full blur-[110px] opacity-60"
          style={{ background: 'radial-gradient(circle, #FFC93C 0%, transparent 70%)' }}
          animate={reduce ? undefined : { x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Bubblegum pink — right, mid */}
        <motion.div
          className="absolute top-1/4 -right-32 h-[520px] w-[520px] rounded-full blur-[120px] opacity-55"
          style={{ background: 'radial-gradient(circle, #FF6B9D 0%, transparent 70%)' }}
          animate={reduce ? undefined : { x: [0, -40, 0], y: [0, 40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Sky blue — bottom-left */}
        <motion.div
          className="absolute -bottom-32 left-1/4 h-[500px] w-[500px] rounded-full blur-[120px] opacity-55"
          style={{ background: 'radial-gradient(circle, #29ABE2 0%, transparent 70%)' }}
          animate={reduce ? undefined : { x: [0, 30, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Grass green — top-center-right */}
        <motion.div
          className="absolute top-12 right-1/3 h-[360px] w-[360px] rounded-full blur-[110px] opacity-45"
          style={{ background: 'radial-gradient(circle, #7CB342 0%, transparent 70%)' }}
          animate={reduce ? undefined : { x: [0, -25, 0], y: [0, 25, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Coral orange — top-right */}
        <motion.div
          className="absolute -top-20 right-1/4 h-[400px] w-[400px] rounded-full blur-[110px] opacity-50"
          style={{ background: 'radial-gradient(circle, #F4713A 0%, transparent 70%)' }}
          animate={reduce ? undefined : { x: [0, 25, 0], y: [0, -25, 0] }}
          transition={{ duration: 21, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Grape purple — bottom-right (subtle) */}
        <motion.div
          className="absolute bottom-0 right-1/4 h-[320px] w-[320px] rounded-full blur-[110px] opacity-35"
          style={{ background: 'radial-gradient(circle, #9B59B6 0%, transparent 70%)' }}
          animate={reduce ? undefined : { x: [0, -20, 0], y: [0, 20, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

     <div className="relative min-h-[420px] md:min-h-[520px] lg:min-h-[560px] flex items-center pt-28 pb-10 md:pt-36 md:pb-14">
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">

            {/* LEFT: Text */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${currentIndex}`}
                variants={contentContainer}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, transition: { duration: 0.25 } }}
                className="order-2 md:order-1 text-center md:text-left"
              >
                {currentSlide.subtitle && (
                  <motion.span
                    variants={contentItem}
                    className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 text-xs font-bold text-bubble-600 bg-bubble-100 rounded-full"
                  >
                    <Sparkle className="w-3.5 h-3.5 fill-current" />
                    {currentSlide.subtitle}
                  </motion.span>
                )}

                <motion.h1
                  variants={contentItem}
                  className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight text-cream-900"
                >
                  {currentSlide.title}
                </motion.h1>

                {currentSlide.description && (
                  <motion.p
                    variants={contentItem}
                    className="mt-5 text-base md:text-lg text-cream-700 max-w-md mx-auto md:mx-0"
                  >
                    {currentSlide.description}
                  </motion.p>
                )}

                {currentSlide.link && (
                  <motion.div variants={contentItem} className="mt-8">
                    <Link
                      href={currentSlide.link}
                      className="btn-play inline-block px-8 py-3.5 text-base"
                    >
                      {currentSlide.buttonText || 'Shop Now'}
                    </Link>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* RIGHT: Image — mix-blend-multiply drops the white photo
                background out against the blobs/page behind it. Darker
                pixels of the product stay visible; only true white
                (and near-white) areas disappear. */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`img-${currentIndex}`}
                custom={direction}
                variants={imageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="order-1 md:order-2 flex items-center justify-center relative"
              >
                {currentSlide.image && (
                  <Image
                    src={currentSlide.image}
                    alt={currentSlide.title}
                    width={600}
                    height={600}
                    className="w-auto h-[240px] md:h-[380px] lg:h-[440px] object-contain drop-shadow-xl mix-blend-multiply"
                    priority
                    unoptimized={currentSlide.image.includes('?v=')}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              aria-label="Previous slide"
              className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white text-cream-900 border border-cream-200 hover:border-play-500 hover:text-play-600 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next slide"
              className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white text-cream-900 border border-cream-200 hover:border-play-500 hover:text-play-600 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {slides.map((_, index) => {
              const isActive = index === currentIndex;
              return (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`rounded-full transition-all duration-500 ${
                    isActive
                      ? 'w-8 h-2 bg-play-500'
                      : 'w-2 h-2 bg-cream-900/20 hover:bg-cream-900/40'
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}