// components/CartPage.tsx
'use client';

import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2, ArrowLeft } from 'lucide-react';

export default function CartPage() {
  const {
    cart,
    cartCount,
    cartTotal,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-24 md:pt-28">
        <ShoppingBag className="w-20 h-20 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Your cart is empty</h2>
        <p className="text-gray-500 mt-2">Looks like you haven't added any items yet.</p>
        <Link
          href="/product"
          className="mt-6 px-8 py-3 bg-black rounded-lg transition-colors"
          style={{ color: 'white' }}
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 md:pt-28 py-8">
      <div className="container mx-auto px-4">
        <Link
          href="/product"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Your Cart ({cartCount})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 p-4">
                  <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
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
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.handle}`}
                      className="font-medium text-gray-800 hover:text-black transition-colors line-clamp-1"
                    >
                      {item.title}
                    </Link>

                    {item.selectedOptions && (item.selectedOptions || []).length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {(item.selectedOptions || []).map((opt: any, i: number) => (
                          <span key={i}>
                            {opt.name}: {opt.value}
                            {i < (item.selectedOptions || []).length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <span className="font-bold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-gray-700">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 ml-1 rounded-lg hover:bg-red-50 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={clearCart}
              className="mt-4 text-sm text-gray-400 hover:text-red-500 transition-colors"
            >
              Clear Cart
            </button>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:sticky lg:top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-500">Calculated at checkout</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold pt-4 mt-4 border-t border-gray-200">
                <span className="text-gray-800">Total</span>
                <span className="text-black">{formatPrice(cartTotal)}</span>
              </div>

              <Link
                href="/checkout"
                className="block w-full mt-6 px-6 py-3 bg-black rounded-xl font-medium hover:bg-gray-800 transition-colors text-center"
                style={{ color: 'white' }}
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}