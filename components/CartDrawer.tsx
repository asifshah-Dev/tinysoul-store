'use client';

import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1] as const;

const PALETTE = {
  cream: '#FDF6E3',
  creamDeep: '#F5E6C8',
  teal: '#0F766E',
  tealSoft: '#E6F4F1',
  coral: '#F4713A',
  ink: '#1c130d',
  muted: '#6f6248',
  mutedLight: '#948362',
};

export default function CartDrawer() {
  const {
    cart,
    cartCount,
    cartTotal,
    removeFromCart,
    updateQuantity,
    clearCart,
    isCartOpen,
    closeCart,
  } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
            className="fixed top-0 right-0 z-50 h-full w-full sm:w-96 shadow-2xl flex flex-col"
            style={{
              backgroundColor: PALETTE.cream,
              willChange: 'transform',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-4 border-b"
              style={{ borderColor: PALETTE.creamDeep }}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag
                  className="w-5 h-5"
                  style={{ color: PALETTE.ink }}
                />
                <h2
                  className="text-lg font-bold"
                  style={{ color: PALETTE.ink }}
                >
                  Your Cart
                </h2>
                <span
                  className="text-sm"
                  style={{ color: PALETTE.muted }}
                >
                  ({cartCount})
                </span>
              </div>
              <button
                onClick={closeCart}
                className="p-2 rounded-lg transition-colors hover:bg-[#F5E6C8]"
              >
                <X className="w-5 h-5" style={{ color: PALETTE.ink }} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag
                    className="w-16 h-16 mb-4"
                    style={{ color: PALETTE.creamDeep }}
                  />
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: PALETTE.ink }}
                  >
                    Your cart is empty
                  </h3>
                  <p
                    className="text-sm mt-1"
                    style={{ color: PALETTE.muted }}
                  >
                    Looks like you haven&apos;t added any items yet.
                  </p>
                  <button
                    onClick={closeCart}
                    className="mt-6 px-6 py-2 rounded-lg transition-all hover:scale-105 active:scale-95 shadow-md"
                    style={{
                      backgroundColor: PALETTE.ink,
                      color: '#ffffff',
                    }}
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{
                        opacity: 0,
                        x: 60,
                        height: 0,
                        marginTop: 0,
                        paddingTop: 0,
                        paddingBottom: 0,
                      }}
                      transition={{
                        duration: 0.4,
                        ease: EASE,
                        layout: { duration: 0.3, ease: EASE },
                      }}
                      className="flex gap-4 py-4 border-b"
                      style={{ borderColor: PALETTE.creamDeep }}
                    >
                      <div
                        className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden"
                        style={{ backgroundColor: '#FAF7F2' }}
                      >
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div
                            className="flex items-center justify-center h-full"
                            style={{ color: PALETTE.muted }}
                          >
                            <ShoppingBag className="w-8 h-8" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/product/${item.handle}`}
                          className="font-medium transition-colors line-clamp-1 hover:opacity-80"
                          style={{ color: PALETTE.ink }}
                          onClick={closeCart}
                        >
                          {item.title?.split('|')[0]?.trim() || item.title}
                        </Link>

                        {/* Color + Size pills */}
                        {Array.isArray(item.selectedOptions) &&
                          item.selectedOptions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.selectedOptions
                                .filter(
                                  (opt: any) => opt?.name && opt?.value
                                )
                                .map((opt: any, i: number) => (
                                  <span
                                    key={i}
                                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                                    style={{
                                      color: PALETTE.muted,
                                      backgroundColor: PALETTE.creamDeep,
                                    }}
                                  >
                                    {opt.value}
                                  </span>
                                ))}
                            </div>
                          )}

                        <div className="flex items-center justify-between mt-2">
                          <span
                            className="font-bold"
                            style={{ color: PALETTE.ink }}
                          >
                            {formatPrice(item.price * item.quantity)}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="p-1 rounded-lg transition-colors hover:bg-[#F5E6C8]"
                            >
                              <Minus
                                className="w-4 h-4"
                                style={{ color: PALETTE.muted }}
                              />
                            </button>
                            <span
                              className="w-8 text-center text-sm font-medium"
                              style={{ color: PALETTE.ink }}
                            >
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="p-1 rounded-lg transition-colors hover:bg-[#F5E6C8]"
                            >
                              <Plus
                                className="w-4 h-4"
                                style={{ color: PALETTE.muted }}
                              />
                            </button>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="p-1 ml-1 rounded-lg transition-colors hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div
                className="border-t p-4 space-y-4"
                style={{ borderColor: PALETTE.creamDeep }}
              >
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: PALETTE.muted }}>Subtotal</span>
                    <span
                      className="font-semibold"
                      style={{ color: PALETTE.ink }}
                    >
                      {formatPrice(cartTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: PALETTE.muted }}>Shipping</span>
                    <span style={{ color: PALETTE.mutedLight }}>
                      Calculated at checkout
                    </span>
                  </div>
                </div>

                <div
                  className="flex justify-between text-lg font-bold pt-2 border-t"
                  style={{ borderColor: PALETTE.creamDeep }}
                >
                  <span style={{ color: PALETTE.ink }}>Total</span>
                  <span style={{ color: PALETTE.ink }}>
                    {formatPrice(cartTotal)}
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={closeCart}
                    className="flex-1 px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md"
                    style={{
                      backgroundColor: PALETTE.ink,
                      color: '#ffffff',
                    }}
                  >
                    Continue Shopping
                  </button>
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="flex-1 px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md text-center"
                    style={{
                      backgroundColor: PALETTE.teal,
                      color: '#ffffff',
                    }}
                  >
                    Checkout
                  </Link>
                </div>

                <button
                  onClick={clearCart}
                  className="w-full text-sm transition-colors"
                  style={{ color: PALETTE.mutedLight }}
                >
                  Clear Cart
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}