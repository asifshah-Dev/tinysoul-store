// components/CartPage.tsx
'use client';

import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2, ArrowLeft } from 'lucide-react';

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
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 pt-20 md:pt-24"
        style={{ backgroundColor: PALETTE.cream }}
      >
        <ShoppingBag
          className="w-20 h-20 mb-4"
          style={{ color: PALETTE.creamDeep }}
        />
        <h2
          className="text-2xl font-bold"
          style={{ color: PALETTE.ink }}
        >
          Your cart is empty
        </h2>
        <p className="mt-2" style={{ color: PALETTE.muted }}>
          Looks like you haven&apos;t added any items yet.
        </p>
        <Link
          href="/product"
          className="mt-6 px-8 py-3 rounded-lg transition-all hover:scale-105 active:scale-95 shadow-md"
          style={{
            backgroundColor: PALETTE.ink,
            color: '#ffffff',
          }}
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pt-20 md:pt-24 py-8"
      style={{ backgroundColor: PALETTE.cream }}
    >
      <div className="container mx-auto px-4">
        <Link
          href="/product"
          className="inline-flex items-center gap-2 text-sm transition-colors mb-6 hover:opacity-80"
          style={{ color: PALETTE.muted }}
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>

        <h1
          className="text-3xl font-bold mb-8"
          style={{ color: PALETTE.ink }}
        >
          Your Cart ({cartCount})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2">
            <div
              className="rounded-2xl border divide-y"
              style={{
                backgroundColor: PALETTE.cream,
                borderColor: PALETTE.creamDeep,
              }}
            >
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4"
                  style={{ borderColor: PALETTE.creamDeep }}
                >
                  <div
                    className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden"
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
                    >
                      {item.title}
                    </Link>

                    {item.selectedOptions &&
                      (item.selectedOptions || []).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {(item.selectedOptions || [])
                            .filter((opt: any) => opt?.name && opt?.value)
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

                    <div className="flex items-center justify-between mt-3">
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
                          aria-label="Decrease quantity"
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
                          aria-label="Increase quantity"
                        >
                          <Plus
                            className="w-4 h-4"
                            style={{ color: PALETTE.muted }}
                          />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 ml-1 rounded-lg transition-colors hover:bg-red-50"
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
              className="mt-4 text-sm transition-colors hover:text-red-500"
              style={{ color: PALETTE.mutedLight }}
            >
              Clear Cart
            </button>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div
              className="rounded-2xl border p-6 lg:sticky lg:top-24"
              style={{
                backgroundColor: PALETTE.cream,
                borderColor: PALETTE.creamDeep,
              }}
            >
              <h2
                className="text-lg font-bold mb-6"
                style={{ color: PALETTE.ink }}
              >
                Order Summary
              </h2>

              <div className="space-y-3">
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
                className="flex justify-between text-lg font-bold pt-4 mt-4 border-t"
                style={{ borderColor: PALETTE.creamDeep }}
              >
                <span style={{ color: PALETTE.ink }}>Total</span>
                <span style={{ color: PALETTE.ink }}>
                  {formatPrice(cartTotal)}
                </span>
              </div>

              <Link
                href="/checkout"
                className="block w-full mt-6 px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md text-center"
                style={{
                  backgroundColor: PALETTE.teal,
                  color: '#ffffff',
                }}
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