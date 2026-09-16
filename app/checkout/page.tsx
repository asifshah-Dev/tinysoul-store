'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  Phone,
  User,
  Mail,
  MessageCircle,
  Check,
} from 'lucide-react';

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

export default function CheckoutPage() {
  const {
    cart,
    cartCount,
    cartTotal,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [submitError, setSubmitError] = useState('');

  const countryCodes = [
    { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
    { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
    { code: '+968', country: 'Oman', flag: '🇴🇲' },
    { code: '+974', country: 'Qatar', flag: '🇶🇦' },
  ];

  const [selectedCountryCode, setSelectedCountryCode] = useState('+92');

  const validatePhoneNumber = (phone: string, countryCode: string) => {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    if (countryCode === '+92') return /^3\d{9}$/.test(cleanPhone);
    if (countryCode === '+91') return /^\d{10}$/.test(cleanPhone);
    if (countryCode === '+1' || countryCode === '+44') return /^\d{10}$/.test(cleanPhone);
    if (countryCode === '+971' || countryCode === '+966') return /^\d{9}$/.test(cleanPhone);
    return cleanPhone.length >= 7;
  };

  const getPhoneError = (phone: string, countryCode: string) => {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    if (!cleanPhone) return '';
    const country = countryCodes.find((c) => c.code === countryCode);
    let requiredLength = 10;
    if (countryCode === '+971' || countryCode === '+966') requiredLength = 9;
    if (countryCode === '+92') requiredLength = 10;

    if (cleanPhone.length < requiredLength) {
      return `Please enter ${requiredLength} digits for ${country?.country || ''}`;
    }
    if (!validatePhoneNumber(cleanPhone, countryCode)) {
      return `Invalid phone number format for ${country?.country || ''}`;
    }
    return '';
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const digitsOnly = value.replace(/\D/g, '');
    setCustomerPhone(digitsOnly);
    const error = getPhoneError(digitsOnly, selectedCountryCode);
    setPhoneError(error);
  };

  const handleCountryChange = (code: string) => {
    setSelectedCountryCode(code);
    const error = getPhoneError(customerPhone, code);
    setPhoneError(error);
  };

  const generateOrderSummary = () => {
    let summary = 'New Order Received!\n\n';
    summary += 'Customer Details\n';
    summary += `Name: ${customerName}\n`;
    summary += `Phone: ${selectedCountryCode} ${customerPhone}\n`;
    summary += `Address: ${customerAddress || 'Not provided'}\n\n`;
    summary += 'Order Details\n';

    cart.forEach((item: any, index: number) => {
      summary += `\n${index + 1}. ${item.title?.split('|')[0]?.trim() || item.title}\n`;

      if (Array.isArray(item.selectedOptions) && item.selectedOptions.length > 0) {
        const optionLine = item.selectedOptions
          .filter((opt: any) => opt?.name && opt?.value)
          .map((opt: any) => `${opt.name}: ${opt.value}`)
          .join(' | ');
        if (optionLine) summary += `   ${optionLine}\n`;
      }

      summary += `   Quantity: ${item.quantity}\n`;
      summary += `   Price: Rs ${(item.price * item.quantity).toLocaleString()}\n`;
    });

    summary += `\nTotal: Rs ${cartTotal.toLocaleString()}\n`;
    summary += `Total Items: ${cartCount}\n`;
    summary += `\n${new Date().toLocaleString()}`;

    return summary;
  };

  const handleEmailCheckout = async () => {
    if (!customerName || !customerPhone) {
      alert('Please fill in your name and phone number');
      return;
    }
    if (phoneError) {
      alert(phoneError);
      return;
    }
    setIsSubmitting(true);
    setSubmitError('');
    const message = generateOrderSummary();

    try {
      const response = await fetch(
        'https://formsubmit.co/ajax/tinysoul10@gmail.com',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            _subject: `New order from ${customerName}`,
            _template: 'table',
            customer_name: customerName,
            customer_phone: `${selectedCountryCode} ${customerPhone}`,
            delivery_address: customerAddress || 'Not provided',
            order_details: message,
            total: `Rs ${cartTotal.toLocaleString()}`,
          }),
        }
      );

      if (!response.ok) throw new Error('Email service request failed');

      setOrderPlaced(true);
      clearCart();
    } catch {
      setSubmitError(
        'Unable to send your order right now. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 pt-20 md:pt-24"
        style={{ backgroundColor: PALETTE.cream }}
      >
        <ShoppingBag
          className="w-20 h-20 mb-4"
          style={{ color: PALETTE.creamDeep }}
        />
        <h2 className="text-2xl font-bold" style={{ color: PALETTE.ink }}>
          Your cart is empty
        </h2>
        <p className="mt-2" style={{ color: PALETTE.muted }}>
          Looks like you haven&apos;t added any items yet.
        </p>
        <Link
          href="/product"
          className="mt-6 px-8 py-3 rounded-lg transition-all hover:scale-105 active:scale-95 shadow-md font-medium"
          style={{
            backgroundColor: PALETTE.teal,
            color: '#ffffff',
          }}
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  const country = countryCodes.find((c) => c.code === selectedCountryCode);

  return (
    <div
      className="min-h-screen pt-20 md:pt-24 py-8"
      style={{ backgroundColor: PALETTE.cream }}
    >
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8" style={{ color: PALETTE.ink }}>
          Checkout
        </h1>

        <div className="lg:hidden mb-8">
          <OrderSummaryCard
            cart={cart}
            cartCount={cartCount}
            cartTotal={cartTotal}
            removeFromCart={removeFromCart}
            updateQuantity={updateQuantity}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="order-2 lg:order-1">
            <div
              className="rounded-2xl p-6 border"
              style={{
                backgroundColor: PALETTE.cream,
                borderColor: PALETTE.creamDeep,
              }}
            >
              <h2
                className="text-xl font-semibold mb-6"
                style={{ color: PALETTE.ink }}
              >
                Customer Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    style={{ color: PALETTE.ink }}
                  >
                    Full Name *
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                      style={{ color: PALETTE.mutedLight }}
                    />
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                      style={{
                        backgroundColor: PALETTE.cream,
                        borderWidth: '1px',
                        borderColor: PALETTE.creamDeep,
                        color: PALETTE.ink,
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = PALETTE.teal;
                        e.target.style.boxShadow = `0 0 0 3px ${PALETTE.teal}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = PALETTE.creamDeep;
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    style={{ color: PALETTE.ink }}
                  >
                    Phone Number *
                  </label>
                  <div className="flex gap-2">
                    <div className="relative w-36 flex-shrink-0">
                      <select
                        value={selectedCountryCode}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className="w-full h-full px-3 py-3 rounded-lg appearance-none text-sm focus:outline-none"
                        style={{
                          backgroundColor: PALETTE.cream,
                          borderWidth: '1px',
                          borderColor: PALETTE.creamDeep,
                          color: PALETTE.ink,
                        }}
                      >
                        {countryCodes.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex-1 relative">
                      <Phone
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                        style={{ color: PALETTE.mutedLight }}
                      />
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={handlePhoneChange}
                        placeholder={`${selectedCountryCode} 3XXXXXXXXX`}
                        className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none transition-all"
                        style={{
                          backgroundColor: PALETTE.cream,
                          borderWidth: '1px',
                          borderColor: phoneError ? '#ef4444' : PALETTE.creamDeep,
                          color: PALETTE.ink,
                        }}
                        onFocus={(e) => {
                          if (!phoneError) {
                            e.target.style.borderColor = PALETTE.teal;
                            e.target.style.boxShadow = `0 0 0 3px ${PALETTE.teal}20`;
                          }
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = phoneError
                            ? '#ef4444'
                            : PALETTE.creamDeep;
                          e.target.style.boxShadow = 'none';
                        }}
                        maxLength={15}
                        required
                      />
                    </div>
                  </div>
                  {phoneError ? (
                    <p className="text-sm text-red-500 mt-1">{phoneError}</p>
                  ) : (
                    <p
                      className="text-xs mt-1"
                      style={{ color: PALETTE.mutedLight }}
                    >
                      {country?.flag} {country?.country} - Enter{' '}
                      {selectedCountryCode === '+92'
                        ? '10'
                        : selectedCountryCode === '+971' ||
                          selectedCountryCode === '+966'
                        ? '9'
                        : '10'}{' '}
                      digits
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    style={{ color: PALETTE.ink }}
                  >
                    Delivery Address
                  </label>
                  <textarea
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Enter your complete delivery address"
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg focus:outline-none resize-none transition-all"
                    style={{
                      backgroundColor: PALETTE.cream,
                      borderWidth: '1px',
                      borderColor: PALETTE.creamDeep,
                      color: PALETTE.ink,
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = PALETTE.teal;
                      e.target.style.boxShadow = `0 0 0 3px ${PALETTE.teal}20`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = PALETTE.creamDeep;
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Info pill */}
                <div
                  className="rounded-lg p-4 border"
                  style={{
                    backgroundColor: PALETTE.tealSoft,
                    borderColor: '#B8E0D9',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <MessageCircle
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                      style={{ color: PALETTE.teal }}
                    />
                    <div>
                      <p className="text-sm" style={{ color: PALETTE.teal }}>
                        Your order will be emailed to the shop owner. They will
                        confirm your order shortly.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleEmailCheckout}
                  disabled={
                    isSubmitting ||
                    !customerName ||
                    !customerPhone ||
                    !!phoneError
                  }
                  className="w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-[0.99]"
                  style={{
                    backgroundColor:
                      !isSubmitting && customerName && customerPhone && !phoneError
                        ? '#16a34a'
                        : PALETTE.creamDeep,
                    color:
                      !isSubmitting && customerName && customerPhone && !phoneError
                        ? '#ffffff'
                        : PALETTE.mutedLight,
                    cursor:
                      !isSubmitting && customerName && customerPhone && !phoneError
                        ? 'pointer'
                        : 'not-allowed',
                  }}
                >
                  <Mail className="w-5 h-5" />
                  {isSubmitting ? 'Sending...' : 'Send Order via Email'}
                </button>
                {submitError && (
                  <p className="text-sm text-red-500 text-center">
                    {submitError}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 hidden lg:block">
            <OrderSummaryCard
              cart={cart}
              cartCount={cartCount}
              cartTotal={cartTotal}
              removeFromCart={removeFromCart}
              updateQuantity={updateQuantity}
            />
          </div>
        </div>

        {orderPlaced && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          >
            <div
              className="rounded-2xl p-8 max-w-lg w-full text-center"
              style={{ backgroundColor: PALETTE.cream }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#DCFCE7' }}
              >
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3
                className="text-2xl font-bold"
                style={{ color: PALETTE.ink }}
              >
                Order Sent! 🎉
              </h3>
              <p className="mt-2" style={{ color: PALETTE.muted }}>
                Your order has been emailed to the shop owner. They will contact
                you shortly to confirm.
              </p>
              <Link
                href="/"
                className="block mt-6 px-8 py-3 rounded-lg font-medium transition-all hover:scale-105 active:scale-95 shadow-md"
                style={{
                  backgroundColor: PALETTE.teal,
                  color: '#ffffff',
                }}
              >
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function OrderSummaryCard({
  cart,
  cartCount,
  cartTotal,
  removeFromCart,
  updateQuantity,
}: any) {
  return (
    <div
      className="rounded-2xl p-6 border sticky top-24"
      style={{
        backgroundColor: PALETTE.cream,
        borderColor: PALETTE.creamDeep,
      }}
    >
      <h2
        className="text-xl font-semibold mb-6"
        style={{ color: PALETTE.ink }}
      >
        Order Summary
      </h2>

      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {cart.map((item: any) => (
          <div
            key={item.id}
            className="flex gap-4 py-4 border-b"
            style={{ borderColor: PALETTE.creamDeep }}
          >
            <div
              className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden"
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
                  <ShoppingBag className="w-6 h-6" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4
                className="font-medium text-sm line-clamp-1"
                style={{ color: PALETTE.ink }}
              >
                {item.title?.split('|')[0]?.trim() || item.title}
              </h4>

              {Array.isArray(item.selectedOptions) &&
                item.selectedOptions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.selectedOptions
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

              <div className="flex items-center justify-between mt-2">
                <span
                  className="text-sm font-semibold"
                  style={{ color: PALETTE.teal }}
                >
                  Rs {(item.price * item.quantity).toLocaleString()}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (item.quantity > 1) {
                        updateQuantity(item.id, item.quantity - 1);
                      } else {
                        removeFromCart(item.id);
                      }
                    }}
                    className="p-1 rounded transition-colors hover:bg-[#F5E6C8]"
                  >
                    <Minus
                      className="w-4 h-4"
                      style={{ color: PALETTE.muted }}
                    />
                  </button>
                  <span
                    className="w-6 text-center text-sm font-medium"
                    style={{ color: PALETTE.ink }}
                  >
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 rounded transition-colors hover:bg-[#F5E6C8]"
                  >
                    <Plus
                      className="w-4 h-4"
                      style={{ color: PALETTE.muted }}
                    />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 rounded transition-colors hover:bg-red-50 ml-1"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="mt-6 pt-6 border-t"
        style={{ borderColor: PALETTE.creamDeep }}
      >
        <div className="flex justify-between text-lg font-bold">
          <span style={{ color: PALETTE.ink }}>Total</span>
          <span style={{ color: PALETTE.teal }}>
            Rs {cartTotal.toLocaleString()}
          </span>
        </div>
        <div
          className="flex justify-between text-sm mt-1"
          style={{ color: PALETTE.muted }}
        >
          <span>Items</span>
          <span>{cartCount}</span>
        </div>
      </div>

      <Link
        href="/cart"
        className="block text-center text-sm mt-4 transition-colors hover:opacity-80"
        style={{ color: PALETTE.teal }}
      >
        ← Back to Cart
      </Link>
    </div>
  );
}