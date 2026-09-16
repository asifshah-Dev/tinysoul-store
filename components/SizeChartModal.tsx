'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Which chart to show */
  category?: 'girls' | 'boys';
}

const CHART_IMAGES: Record<'girls' | 'boys', string> = {
  girls: '/images/size-chart-girls.jpg',
  boys: '/images/size-chart-boys.jpg',
};

export default function SizeChartModal({
  isOpen,
  onClose,
  category = 'girls',
}: SizeChartModalProps) {
  // Lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-zinc-200">
                <h3 className="text-base md:text-lg font-semibold text-zinc-900">
                  Size Chart — {category === 'girls' ? 'Girls' : 'Boys'}
                </h3>
                <button
                  onClick={onClose}
                  aria-label="Close size chart"
                  className="p-2 -mr-2 rounded-lg hover:bg-zinc-100 transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-600" />
                </button>
              </div>

              {/* Image */}
              <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-zinc-50">
                <img
                  src={CHART_IMAGES[category]}
                  alt={`Tiny Soul ${category} size chart`}
                  className="w-full h-auto rounded-lg shadow-sm"
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}