'use client';

import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1] as const;

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
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
              mass: 0.8,
            }}
            className="fixed top-0 right-0 z-50 h-full w-full sm:w-96 bg-white shadow-2xl flex flex-col"
            style={{ willChange: 'transform' }}
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15, ease: EASE }}
              className="flex items-center justify-between p-4 border-b border-gray-200"
            >
              <div className="flex items-center gap-2">
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 18,
                    delay: 0.25,
                  }}
                >
                  <ShoppingBag className="w-5 h-5 text-gray-700" />
                </motion.div>
                <h2 className="text-lg font-bold text-gray-900">Your Cart</h2>
                <motion.span
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35, duration: 0.35, ease: EASE }}
                  className="text-sm text-gray-500"
                >
                  ({cartCount})
                </motion.span>
              </div>
              <motion.button
                onClick={closeCart}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-700" />
              </motion.button>
            </motion.div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {cart.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
                  className="flex flex-col items-center justify-center h-full text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 260,
                      damping: 20,
                      delay: 0.3,
                    }}
                  >
                    <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-800">Your cart is empty</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Looks like you haven't added any items yet.
                  </p>
                  <motion.button
                    onClick={closeCart}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                    className="mt-6 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Start Shopping
                  </motion.button>
                </motion.div>
              ) : (
                <AnimatePresence initial={false}>
                  {cart.map((item, index) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 60, height: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0 }}
                      transition={{
                        duration: 0.4,
                        ease: EASE,
                        delay: 0.05 + index * 0.04,
                        layout: { duration: 0.3, ease: EASE },
                      }}
                      className="flex gap-4 py-4 border-b border-gray-100"
                      style={{ willChange: 'transform, opacity' }}
                    >
                      {/* Image */}
                      <motion.div
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          duration: 0.45,
                          delay: 0.1 + index * 0.04,
                          ease: EASE,
                        }}
                        className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden"
                      >
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            <ShoppingBag className="w-8 h-8" />
                          </div>
                        )}
                      </motion.div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/product/${item.handle}`}
                          className="font-medium text-gray-800 hover:text-black transition-colors line-clamp-1"
                          onClick={closeCart}
                        >
                          {item.title}
                        </Link>
                        {item.selectedOptions && (item.selectedOptions || []).length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {(item.selectedOptions || []).map((opt, i) => (
                              <span key={i}>
                                {opt.name}: {opt.value}
                                {i < (item.selectedOptions || []).length - 1 && ', '}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-bold text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                          <div className="flex items-center gap-2">
                            <motion.button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              whileHover={{ scale: 1.12 }}
                              whileTap={{ scale: 0.88 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-4 h-4 text-gray-600" />
                            </motion.button>

                            <motion.span
                              key={item.quantity}
                              initial={{ opacity: 0, y: -6, scale: 0.85 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ duration: 0.25, ease: EASE }}
                              className="w-8 text-center text-sm font-medium text-gray-700"
                            >
                              {item.quantity}
                            </motion.span>

                            <motion.button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              whileHover={{ scale: 1.12 }}
                              whileTap={{ scale: 0.88 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-4 h-4 text-gray-600" />
                            </motion.button>

                            <motion.button
                              onClick={() => removeFromCart(item.id)}
                              whileHover={{ scale: 1.12 }}
                              whileTap={{ scale: 0.88 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                              className="p-1 ml-1 rounded-lg hover:bg-red-50 transition-colors"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </motion.button>
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
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25, ease: EASE }}
                className="border-t border-gray-200 p-4 space-y-4"
                style={{ willChange: 'transform, opacity' }}
              >
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <motion.span
                      key={cartTotal}
                      initial={{ opacity: 0.5, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.25, ease: EASE }}
                      className="font-semibold text-gray-900"
                    >
                      {formatPrice(cartTotal)}
                    </motion.span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-500">Calculated at checkout</span>
                  </div>
                </div>

                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                  <span className="text-gray-800">Total</span>
                  <motion.span
                    key={`total-${cartTotal}`}
                    initial={{ opacity: 0.5, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="text-black"
                  >
                    {formatPrice(cartTotal)}
                  </motion.span>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    onClick={closeCart}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                    className="flex-1 px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                  >
                    Continue Shopping
                  </motion.button>
                  <motion.div
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                    className="flex-1"
                  >
                    <Link
                      href="/checkout"
                      onClick={closeCart}
                      className="block px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors text-center"
                    >
                      Checkout
                    </Link>
                  </motion.div>
                </div>

                <motion.button
                  onClick={clearCart}
                  whileHover={{ scale: 1.02, color: '#ef4444' }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="w-full text-sm text-gray-400 hover:text-red-500 transition-colors"
                >
                  Clear Cart
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}