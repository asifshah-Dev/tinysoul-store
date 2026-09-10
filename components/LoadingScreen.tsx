// components/LoadingScreen.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);

  // Motion values — update WITHOUT triggering React re-renders
  const progress = useMotionValue(0);        // 0 → 100
  const barWidth = useMotionValue('0%');     // "0%" → "100%"
  const iconLeft = useMotionValue('-20px');  // icon position

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    // Animate progress from 0 to 100 over 1.8s — no React state involved
    const controls = animate(progress, 100, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1], // smooth ease-out
      onUpdate: (latest) => {
        barWidth.set(`${latest}%`);
        iconLeft.set(`calc(${latest}% - 20px)`);
      },
      onComplete: () => {
        setTimeout(() => {
          setIsLoading(false);
          document.body.style.overflow = '';
        }, 250);
      },
    });

    return () => {
      controls.stop();
      document.body.style.overflow = '';
    };
  }, [progress, barWidth, iconLeft]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-cream-50"
        >
          {/* Logo — fades in once, no motion thrash */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="mb-16"
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

          {/* Progress track */}
          <div className="w-[320px] md:w-[440px] relative">
            {/* Base track */}
            <div className="relative h-2 rounded-full bg-[#2b2b2b]/10">
              {/* Filled bar — motion value drives width directly, no state */}
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: barWidth,
                  background: 'linear-gradient(90deg, #F4713A 0%, #FF6B9D 100%)',
                }}
              />

              {/* Cart icon riding the bar — motion value drives left position */}
              <motion.div
                className="absolute -top-[24px]"
                style={{ left: iconLeft }}
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

            {/* Label */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center text-xs font-semibold tracking-widest text-[#6f6248] mt-8 uppercase"
            >
              Loading…
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}