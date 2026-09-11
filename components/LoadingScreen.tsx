// components/LoadingScreen.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoading } from '@/context/LoadingContext';

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const { setLoadingComplete } = useLoading();

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      setIsLoading(false);
      document.body.style.overflow = '';
      // Signal the rest of the app that loading is done
      setLoadingComplete();
    }, 2000);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, [setLoadingComplete]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-cream-50"
        >
          {/* ...the rest of your existing loading screen JSX stays the same... */}
          
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="mb-16"
          >
            <Image
              src="/logo.png"
              alt="Tiny Soul"
              width={600}
              height={180}
              className="h-40 md:h-56 lg:h-64 w-auto object-contain"
              priority
            />
          </motion.div>

          {/* Progress track */}
          <div className="w-[320px] md:w-[440px] relative">
            <div className="relative h-2 rounded-full bg-[#2b2b2b]/10">
              <div className="absolute inset-y-0 left-0 w-full rounded-full origin-left progress-bar-fill" />
              <div className="absolute -top-[24px] left-0 w-full pointer-events-none progress-bar-icon">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full shadow-lg -translate-x-1/2"
                  style={{
                    background: 'linear-gradient(135deg, #F4713A 0%, #FF6B9D 100%)',
                  }}
                >
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            <p className="text-center text-xs font-semibold tracking-widest text-[#6f6248] mt-8 uppercase">
              Loading…
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}