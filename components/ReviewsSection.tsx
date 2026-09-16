'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

interface Review {
  id: number;
  name: string;
  location: string;
  rating: number;
  text: string;
  product?: string;
  initial: string;
  avatarBg: string;
}

const REVIEWS: Review[] = [
  {
    id: 1,
    name: 'Ayesha Khan',
    location: 'Lahore',
    rating: 5,
    text: 'Absolutely in love with the quality! The fabric is so soft and my daughter looked adorable at her cousin\'s wedding. Delivery was super fast too. Tiny Soul never disappoints.',
    product: 'Green Embroidered 2 Piece Suit',
    initial: 'A',
    avatarBg: '#7CB342',
  },
  {
    id: 2,
    name: 'Fatima Ahmed',
    location: 'Karachi',
    rating: 5,
    text: 'The embroidery work is stunning — even better than the pictures. My little one wore it for Eid and got so many compliments. Will definitely order again!',
    product: 'Purple Kurti with Golden Sharara',
    initial: 'F',
    avatarBg: '#9B59B6',
  },
  {
    id: 3,
    name: 'Sana Malik',
    location: 'Islamabad',
    rating: 5,
    text: 'Great fit, beautiful colors, and the stitching is perfect. You can tell the attention to detail is real. Worth every rupee — highly recommended for moms!',
    product: 'Yellow Embroidered Co-Ord Set',
    initial: 'S',
    avatarBg: '#F4713A',
  },
  {
    id: 4,
    name: 'Hira Yousaf',
    location: 'Rawalpindi',
    rating: 5,
    text: 'Ordered three suits for my nieces and every single one was a hit. The packaging was lovely and the customer service was so helpful. 10/10 experience.',
    product: 'Peach Printed 2 Piece Suit',
    initial: 'H',
    avatarBg: '#29ABE2',
  },
  {
    id: 5,
    name: 'Mariam Siddiqui',
    location: 'Faisalabad',
    rating: 5,
    text: 'My go-to store for kids\' festive wear now. The cotton is breathable so my daughter stays comfortable all day. Truly premium quality at a fair price.',
    product: 'Pink Floral Embroidered Frock',
    initial: 'M',
    avatarBg: '#FF6B9D',
  },
];

const EASE = [0.16, 1, 0.3, 1] as const;
const AUTOPLAY_MS = 6000;

export default function ReviewsSection() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [perView, setPerView] = useState(1);
  const touchStartX = useRef<number | null>(null);

  // Responsive perView
  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1024) setPerView(3);
      else if (window.innerWidth >= 640) setPerView(2);
      else setPerView(1);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const maxIndex = Math.max(0, REVIEWS.length - perView);

  // Autoplay
  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => {
      setDirection(1);
      setIndex((i) => (i >= maxIndex ? 0 : i + 1));
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [isPaused, maxIndex]);

  const go = (dir: 1 | -1) => {
    setDirection(dir);
    setIndex((i) => {
      if (dir === 1) return i >= maxIndex ? 0 : i + 1;
      return i <= 0 ? maxIndex : i - 1;
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) go(delta < 0 ? 1 : -1);
    touchStartX.current = null;
  };

  return (
    <section className="container mx-auto px-4 py-14 md:py-20">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="text-center mb-10 md:mb-12"
      >
        <span className="inline-flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-[#F4713A] mb-3">
          <span className="w-6 h-px bg-[#F4713A]" />
          Real Moms, Real Love
          <span className="w-6 h-px bg-[#F4713A]" />
        </span>
        <h2 className="text-2xl md:text-4xl font-bold text-[#1c130d] tracking-tight">
          Loved by Parents Across Pakistan
        </h2>
        <p className="text-sm md:text-base text-[#6f6248] mt-3 max-w-xl mx-auto">
          Over 5,000 happy families trust Tiny Soul for premium quality kids wear.
        </p>

        {/* Aggregate rating */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="flex items-center gap-0.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star
                key={i}
                className="w-4 h-4 md:w-5 md:h-5 fill-[#FFC93C] text-[#FFC93C]"
              />
            ))}
          </div>
          <span className="text-sm md:text-base font-bold text-[#1c130d]">4.9</span>
          <span className="text-xs md:text-sm text-[#6f6248]">· 2,340 reviews</span>
        </div>
      </motion.div>

      {/* Carousel */}
      <div
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="overflow-hidden">
          <motion.div
            className="flex"
            animate={{ x: `-${index * (100 / perView)}%` }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            {REVIEWS.map((review) => (
              <div
                key={review.id}
                className="flex-shrink-0 px-2 md:px-3"
                style={{ width: `${100 / perView}%` }}
              >
                <ReviewCard review={review} />
              </div>
            ))}
          </motion.div>
        </div>

        {/* Arrows */}
        <button
          onClick={() => go(-1)}
          aria-label="Previous review"
          className="hidden md:flex absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 items-center justify-center rounded-full bg-white border border-[#f0e6d4] shadow-md hover:bg-[#FFFCF6] hover:shadow-lg transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-[#1c130d]" />
        </button>
        <button
          onClick={() => go(1)}
          aria-label="Next review"
          className="hidden md:flex absolute -right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 items-center justify-center rounded-full bg-white border border-[#f0e6d4] shadow-md hover:bg-[#FFFCF6] hover:shadow-lg transition-all"
        >
          <ChevronRight className="w-5 h-5 text-[#1c130d]" />
        </button>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > index ? 1 : -1);
              setIndex(i);
            }}
            aria-label={`Go to review group ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index
                ? 'w-8 bg-[#F4713A]'
                : 'w-2 bg-[#e8dcc6] hover:bg-[#d4c4a0]'
            }`}
          />
        ))}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// Individual card
// ═══════════════════════════════════════════════════════════
function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="h-full flex flex-col p-6 md:p-7 rounded-3xl bg-white border border-[#f0e6d4] shadow-[0_8px_30px_-12px_rgba(43,43,43,0.08)] hover:shadow-[0_12px_40px_-12px_rgba(43,43,43,0.14)] hover:-translate-y-1 transition-all duration-400">
      {/* Quote icon */}
      <Quote className="w-8 h-8 text-[#FFC93C] fill-[#FFC93C]/30 mb-4 rotate-180" />

      {/* Stars */}
      <div className="flex items-center gap-0.5 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < review.rating
                ? 'fill-[#FFC93C] text-[#FFC93C]'
                : 'fill-[#f0e6d4] text-[#f0e6d4]'
            }`}
          />
        ))}
      </div>

      {/* Text */}
      <p className="text-sm md:text-[15px] text-[#2b2b2b] leading-relaxed flex-1 mb-6">
        "{review.text}"
      </p>

      {/* Product tag */}
      {review.product && (
        <div className="mb-5 inline-flex">
          <span className="text-[10px] md:text-[11px] font-medium text-[#6f6248] bg-[#fdf6e3] px-3 py-1 rounded-full">
            {review.product}
          </span>
        </div>
      )}

      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-[#f5e6c8]">
        <div
          className="flex items-center justify-center w-11 h-11 rounded-full text-white font-bold text-lg"
          style={{ backgroundColor: review.avatarBg }}
        >
          {review.initial}
        </div>
        <div>
          <div className="text-sm font-bold text-[#1c130d]">{review.name}</div>
          <div className="text-xs text-[#6f6248]">{review.location}</div>
        </div>
        {/* Verified check */}
        <div className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-[#0f8a0f] bg-[#e6fae6] px-2 py-1 rounded-full">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Verified
        </div>
      </div>
    </div>
  );
}