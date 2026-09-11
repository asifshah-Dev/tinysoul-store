// components/Hero.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';

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
  const [processedSrc, setProcessedSrc] = useState<string>(src);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
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
        if (!ctx) { setIsProcessing(false); return; }

        ctx.drawImage(img, 0, 0, w, h);
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          if (data[i] >= tolerance && data[i + 1] >= tolerance && data[i + 2] >= tolerance) {
            data[i + 3] = 0;
          }
        }
        ctx.putImageData(imageData, 0, 0);
        if (isMounted) {
          setProcessedSrc(canvas.toDataURL('image/png'));
          setIsProcessing(false);
        }
      } catch {
        if (isMounted) { setProcessedSrc(src); setIsProcessing(false); }
      }
    };
    img.onerror = () => { if (isMounted) { setProcessedSrc(src); setIsProcessing(false); } };
    img.src = src;
    return () => { isMounted = false; };
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
        className={`w-auto h-[75%] object-contain transition-opacity duration-300 ${isProcessing ? 'opacity-0' : 'opacity-100'}`}
        style={{ filter: 'drop-shadow(0 30px 60px rgba(43,43,43,0.2))' }}
      />
    </div>
  );
}

const EASE = [0.16, 1, 0.3, 1] as const;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export default function Hero({ slides = [], autoPlay = true, interval = 5500 }: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const prefersReducedMotion = useReducedMotion();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;

    let ticking = false;
    let lastProgress = -1;

    const update = () => {
      const wrapper = wrapperRef.current;
      const section = sectionRef.current;
      const content = contentRef.current;
      const image = imageRef.current;

      if (!wrapper || !section) { ticking = false; return; }

      const rect = wrapper.getBoundingClientRect();
      const heroHeight = Math.max(1, rect.height);

      const raw = Math.min(1, Math.max(0, -rect.top / heroHeight));

      if (Math.abs(raw - lastProgress) < 0.0008) {
        ticking = false;
        return;
      }
      lastProgress = raw;

      const rotateX = -18 * raw;
      const liftY = -20 * raw;
      const scale = 1 - 0.045 * raw;
      const opacity = 1 - 0.55 * raw;

      section.style.transform =
        `rotateX(${rotateX}deg) translateY(${liftY}px) scale(${scale})`;
      section.style.opacity = String(opacity);

      if (content) {
        content.style.transform = `translateY(${-40 * raw}px)`;
      }
      if (image) {
        image.style.transform = `translateY(${-80 * raw}px)`;
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!autoPlay || isHovering || slides.length === 0) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, isHovering, interval, slides.length]);

  const goToSlide = useCallback((index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }, [currentIndex]);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [prevSlide, nextSlide]);

  if (!slides || slides.length === 0) return null;

  const currentSlide = slides[currentIndex];
  const reduce = !!prefersReducedMotion;

  const titleWords = (currentSlide.title || '').trim().split(' ');
  const firstWord = titleWords.shift() || '';
  const restOfTitle = titleWords.join(' ');
  const headlineWords = (restOfTitle || currentSlide.title || '').trim().split(' ');

  const imageVariants = {
    enter: (dir: 1 | -1) => ({
      opacity: 0,
      scale: reduce ? 1 : 1.08,
      rotate: reduce ? 0 : dir > 0 ? 3 : -3,
      x: reduce ? 0 : dir > 0 ? 40 : -40,
    }),
    center: { opacity: 1, scale: 1, rotate: 0, x: 0, transition: { duration: 1.1, ease: EASE } },
    exit: (dir: 1 | -1) => ({
      opacity: 0,
      scale: reduce ? 1 : 1.02,
      rotate: reduce ? 0 : dir > 0 ? -2 : 2,
      x: reduce ? 0 : dir > 0 ? -30 : 30,
      transition: { duration: 0.5, ease: EASE },
    }),
  };

  const contentContainer = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.08, delayChildren: reduce ? 0 : 0.15 } },
    exit: { transition: { staggerChildren: reduce ? 0 : 0.03, staggerDirection: -1 } },
  };

  const contentItem = {
    hidden: { opacity: 0, y: reduce ? 0 : 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_OUT } },
    exit: { opacity: 0, y: reduce ? 0 : -10, transition: { duration: 0.25, ease: EASE_OUT } },
  };

  const wordVariant = {
    hidden: {
      opacity: 0,
      y: reduce ? 0 : '0.6em',
      filter: reduce ? 'blur(0px)' : 'blur(8px)',
    },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: EASE } },
  };

  const eyebrowLineVariant = {
    hidden: { scaleX: 0 },
    show: { scaleX: 1, transition: { duration: 0.7, ease: EASE, delay: 0.15 } },
  };

  const pillVariant = {
    hidden: { opacity: 0, x: 20, scale: 0.9 },
    show: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.6, ease: EASE, delay: 0.7 } },
  };

  const labelVariant = {
    hidden: { opacity: 0, x: -20, scale: 0.9 },
    show: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.6, ease: EASE, delay: 0.85 } },
  };

  return (
    <div
      ref={wrapperRef}
      style={{
        perspective: '1600px',
        perspectiveOrigin: 'center bottom',
      }}
    >
      <div
        ref={sectionRef}
        style={{
          transformOrigin: 'center bottom',
          willChange: 'transform, opacity',
          transformStyle: 'preserve-3d',
        }}
      >
        <section
          className="relative w-full overflow-hidden bg-[#FFFCF6]"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, #FFFDF7 0%, #FFF6E5 40%, #FFE9DC 100%)',
              }}
            />
            <div
              className="absolute top-1/2 right-[8%] -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-70 hidden md:block"
              style={{
                background: 'radial-gradient(circle, rgba(255,201,60,0.35) 0%, rgba(255,107,157,0.2) 45%, transparent 75%)',
                filter: 'blur(50px)',
              }}
            />
            <div
              className="absolute -bottom-40 -left-32 w-[500px] h-[500px] rounded-full opacity-40"
              style={{
                background: 'radial-gradient(circle, #6EC4EC 0%, transparent 70%)',
                filter: 'blur(70px)',
              }}
            />
          </div>

          <div className="relative min-h-[560px] md:min-h-[640px] lg:min-h-[700px] flex items-center pt-28 pb-6 md:pt-32 md:pb-10">
            <div className="container mx-auto px-6 md:px-12 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 items-center">

                {/* LEFT — Text column */}
                <div
                  ref={contentRef}
                  className="md:col-span-5 order-2 md:order-1 pb-6 md:pb-0"
                  style={{ willChange: 'transform' }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`text-${currentIndex}`}
                      variants={contentContainer}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      className="text-center md:text-left"
                    >
                      {firstWord && (
                        <motion.div
                          variants={contentItem}
                          className="flex items-center gap-3 justify-center md:justify-start mb-6"
                        >
                          <Sparkles className="w-4 h-4 text-[#F4713A]" />
                          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#F4713A]">
                            {firstWord}
                          </span>
                          <motion.span
                            variants={eyebrowLineVariant}
                            className="w-12 h-px bg-[#F4713A]/30 origin-left inline-block"
                          />
                        </motion.div>
                      )}

                      <motion.h1
                        variants={contentItem}
                        className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.02] tracking-[-0.02em] text-[#2b2b2b]"
                      >
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={`headline-${currentIndex}`}
                            className="inline-block"
                            initial="hidden"
                            animate="show"
                            exit="hidden"
                            variants={{
                              hidden: {},
                              show: {
                                transition: {
                                  staggerChildren: reduce ? 0 : 0.07,
                                  delayChildren: reduce ? 0 : 0.15,
                                },
                              },
                            }}
                          >
                            {headlineWords.map((word, i) => (
                              <motion.span
                                key={`${word}-${i}`}
                                variants={wordVariant}
                                className="inline-block mr-[0.25em]"
                              >
                                {word}
                              </motion.span>
                            ))}
                          </motion.span>
                        </AnimatePresence>
                      </motion.h1>

                      {currentSlide.description && (
                        <motion.p
                          variants={contentItem}
                          className="mt-6 text-base md:text-lg text-[#6f6248] max-w-md mx-auto md:mx-0 leading-relaxed"
                        >
                          {currentSlide.description}
                        </motion.p>
                      )}

                      {currentSlide.link && (
                        <motion.div
                          variants={contentItem}
                          className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start"
                        >
                          <motion.div
                            whileHover={reduce ? {} : { scale: 1.03, y: -2 }}
                            whileTap={reduce ? {} : { scale: 0.97 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                          >
                            <Link
                              href={currentSlide.link}
                              className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full overflow-hidden bg-[#2b2b2b] text-[#FFFCF6] font-bold text-sm md:text-base"
                              style={{ boxShadow: '0 14px 32px -10px rgba(43,43,43,0.4)' }}
                            >
                              <span
                                aria-hidden
                                className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"
                                style={{ background: 'linear-gradient(135deg, #F4713A 0%, #FF6B9D 100%)' }}
                              />
                              <span className="relative z-10 flex items-center gap-3">
                                {currentSlide.buttonText || 'Shop Now'}
                                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                              </span>
                            </Link>
                          </motion.div>

                          <Link
                            href="/products"
                            className="group inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#2b2b2b] hover:text-[#F4713A] transition-colors"
                          >
                            Browse All
                            <span className="w-6 h-px bg-current transition-all duration-300 group-hover:w-10" />
                          </Link>
                        </motion.div>
                      )}

                      <motion.div
                        variants={contentItem}
                        className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-[#2b2b2b]/10 flex flex-wrap gap-x-4 md:gap-x-8 gap-y-2 md:gap-y-3 justify-center md:justify-start"
                      >
                        {[
                          { color: '#7CB342', label: 'Free Shipping' },
                          { color: '#FF6B9D', label: '500+ Parents' },
                          { color: '#29ABE2', label: '4.9★ Rated' },
                        ].map((tag, i) => (
                          <motion.div
                            key={tag.label}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: reduce ? 0 : 0.9 + i * 0.08, duration: 0.5, ease: EASE }}
                            className="flex items-center gap-2"
                          >
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: reduce ? 0 : 0.9 + i * 0.08, duration: 0.4, ease: EASE }}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: tag.color }}
                            />
                            <span className="text-xs font-bold uppercase tracking-wider text-[#6f6248]">
                              {tag.label}
                            </span>
                          </motion.div>
                        ))}
                      </motion.div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* RIGHT — Image column */}
                <div
                  ref={imageRef}
                  className="md:col-span-7 order-1 md:order-2 relative flex items-center justify-center"
                  style={{ willChange: 'transform' }}
                >
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={`img-${currentIndex}`}
                      custom={direction}
                      variants={imageVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="relative w-full max-w-[520px] aspect-square flex items-center justify-center"
                    >
                      {currentSlide.image && (
                        <BgRemovedImage
                          src={currentSlide.image}
                          alt={currentSlide.title}
                          width={800}
                          height={800}
                          className="relative z-10"
                          tolerance={245}
                        />
                      )}

                      {/* MOBILE ARROWS — overlaid on the image */}
                      {slides.length > 1 && (
                        <>
                          <motion.button
                            onClick={prevSlide}
                            aria-label="Previous slide"
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                            className="md:hidden absolute left-0 top-1/2 -translate-y-1/2 z-30
                                       flex items-center justify-center
                                       w-10 h-10 rounded-full
                                       bg-white/80 backdrop-blur-md
                                       border border-white/70
                                       text-[#2b2b2b]
                                       shadow-md
                                       active:bg-white
                                       touch-manipulation"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </motion.button>

                          <motion.button
                            onClick={nextSlide}
                            aria-label="Next slide"
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                            className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 z-30
                                       flex items-center justify-center
                                       w-10 h-10 rounded-full
                                       bg-white/80 backdrop-blur-md
                                       border border-white/70
                                       text-[#2b2b2b]
                                       shadow-md
                                       active:bg-white
                                       touch-manipulation"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </motion.button>
                        </>
                      )}

                      <motion.div
                        variants={pillVariant}
                        initial="hidden"
                        animate="show"
                        className="absolute top-[10%] right-[6%] z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-xl"
                      >
                        <span className="relative flex w-2 h-2">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-[#7CB342] opacity-75 animate-ping" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7CB342]" />
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#2b2b2b]">
                          In Stock
                        </span>
                      </motion.div>

                      <motion.div
                        variants={labelVariant}
                        initial="hidden"
                        animate="show"
                        className="absolute bottom-[12%] left-[6%] z-20"
                      >
                        <div className="px-3 py-1.5 rounded-lg bg-[#2b2b2b]/90 backdrop-blur-md">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white">
                            Featured Drop
                          </span>
                        </div>
                      </motion.div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* DESKTOP-ONLY CONTROLS */}
            {slides.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduce ? 0 : 1.1, duration: 0.6, ease: EASE }}
                className="hidden md:flex absolute md:bottom-16 md:right-12 z-40 items-center gap-4"
              >
                <motion.button
                  onClick={prevSlide}
                  aria-label="Previous slide"
                  whileHover={reduce ? {} : { scale: 1.08, x: -2 }}
                  whileTap={reduce ? {} : { scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  className="flex items-center justify-center w-11 h-11 rounded-full border border-[#2b2b2b]/15 text-[#2b2b2b] bg-white/70 backdrop-blur-md hover:bg-[#2b2b2b] hover:text-white transition-colors duration-300"
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>

                <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/70 backdrop-blur-md border border-[#2b2b2b]/10">
                  {slides.map((_, index) => {
                    const isActive = index === currentIndex;
                    return (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                        className={`transition-all duration-500 ${
                          isActive
                            ? 'w-6 h-1.5 rounded-full bg-[#2b2b2b]'
                            : 'w-1.5 h-1.5 rounded-full bg-[#2b2b2b]/25 hover:bg-[#2b2b2b]/50'
                        }`}
                      />
                    );
                  })}
                </div>

                <motion.button
                  onClick={nextSlide}
                  aria-label="Next slide"
                  whileHover={reduce ? {} : { scale: 1.08, x: 2 }}
                  whileTap={reduce ? {} : { scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  className="flex items-center justify-center w-11 h-11 rounded-full bg-[#2b2b2b] text-white hover:bg-[#F4713A] transition-colors duration-300"
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </motion.div>
            )}
          </div>

          {/* MARQUEE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduce ? 0 : 1.2, duration: 0.7, ease: EASE }}
            className="relative z-20 w-full pb-6 md:pb-8"
          >
            <div className="container mx-auto px-6 md:px-12">
              <div className="relative rounded-full bg-[#2b2b2b] overflow-hidden py-4">
                <div
                  aria-hidden
                  className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
                  style={{ background: 'linear-gradient(90deg, #2b2b2b 0%, transparent 100%)' }}
                />
                <div
                  aria-hidden
                  className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
                  style={{ background: 'linear-gradient(270deg, #2b2b2b 0%, transparent 100%)' }}
                />

                <div className="marquee-track">
                  <div className="marquee-content">
                    {[...Array(2)].map((_, dupIdx) => (
                      <div key={dupIdx} className="flex items-center gap-3 md:gap-6 px-2 md:px-3 shrink-0">
                        {[
                          { label: 'Free Shipping Rs 5,000+', dot: '#7CB342' },
                          { label: 'New Arrivals Weekly', dot: '#FF6B9D' },
                          { label: '500+ Happy Parents', dot: '#FFC93C' },
                          { label: 'Sale Up To 50% Off', dot: '#29ABE2' },
                          { label: 'Made for Little Souls', dot: '#9B59B6' },
                          { label: 'Easy Returns', dot: '#F4713A' },
                        ].map((item, i) => (
                          <div key={`${dupIdx}-${i}`} className="flex items-center gap-3 md:gap-6">
                            <span className="text-[11px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.25em] text-white/95 whitespace-nowrap">
                              {item.label}
                            </span>
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: item.dot }}
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}