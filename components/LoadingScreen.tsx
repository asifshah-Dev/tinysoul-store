// components/LoadingScreen.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Prevent body scroll while loading
    document.body.style.overflow = 'hidden';

    // Animate progress from 0 to 100 over ~1.6s
    const duration = 1600;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);

      if (pct < 100) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setIsLoading(false);
          document.body.style.overflow = '';
        }, 300);
      }
    };

    requestAnimationFrame(tick);

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-cream-50"
        >
          {/* Big logo — fades in and settles */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="mb-14"
          >
           <Image
  src="/logo.png"
  alt="Tiny Soul"
  width={900}
  height={270}
  className="h-56 md:h-72 lg:h-80 w-auto object-contain"
  priority
/>
          </motion.div>

          {/* Progress track with sliding cart icon */}
          <div className="w-[280px] md:w-[380px] relative">
            {/* Base track */}
            <div className="relative h-2 rounded-full bg-[#2b2b2b]/10">
              {/* Filled portion */}
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #F4713A 0%, #FF6B9D 100%)',
                }}
                transition={{ duration: 0.1, ease: 'linear' }}
              />

              {/* Cart icon sliding along the track — no rotation */}
              <motion.div
                className="absolute -top-[24px] flex items-center justify-center"
                style={{ left: `calc(${progress}% - 20px)` }}
                transition={{ duration: 0.1, ease: 'linear' }}
              >
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #F4713A 0%, #FF6B9D 100%)',
                  }}
                >
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
              </motion.div>
            </div>

            {/* Percentage below */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-center text-xs font-semibold tracking-widest text-[#6f6248] mt-8 uppercase"
            >
              Loading — {Math.round(progress)}%
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}