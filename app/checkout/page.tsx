'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingBag, Trash2, Minus, Plus, Phone, User, Mail, MessageCircle, Check } from 'lucide-react';

export default function CheckoutPage() {
  const { cart, cartCount, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();
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
    const country = countryCodes.find(c => c.code === countryCode);
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
      const response = await fetch('https://formsubmit.co/ajax/tinysoul10@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: `New order from ${customerName}`,
          _template: 'table',
          customer_name: customerName,
          customer_phone: `${selectedCountryCode} ${customerPhone}`,
          delivery_address: customerAddress || 'Not provided',
          order_details: message,
          total: `Rs ${cartTotal.toLocaleString()}`,
        }),
      });

      if (!response.ok) throw new Error('Email service request failed');

      setOrderPlaced(true);
      clearCart();
    } catch {
      setSubmitError('Unable to send your order right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-24 md:pt-28">
        <ShoppingBag className="w-20 h-20 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Your cart is empty</h2>
        <p className="text-gray-500 mt-2">Looks like you haven't added any items yet.</p>
        <Link
          href="/product"
          className="mt-6 px-8 py-3 bg-teal-600 text-white hover:bg-teal-700 transition-colors"
          style={{ color: 'white !important' }}
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  const country = countryCodes.find(c => c.code === selectedCountryCode);

  return (
    <div className="min-h-screen pt-24 md:pt-28 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

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
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Customer Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-800"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <div className="flex gap-2">
                    <div className="relative w-36 flex-shrink-0">
                      <select
                        value={selectedCountryCode}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className="w-full h-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none bg-white text-gray-800 text-sm"
                      >
                        {countryCodes.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex-1 relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={handlePhoneChange}
                        placeholder={`${selectedCountryCode} 3XXXXXXXXX`}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-800 ${
                          phoneError ? 'border-red-500' : 'border-gray-300'
                        }`}
                        maxLength={15}
                        required
                      />
                    </div>
                  </div>
                  {phoneError ? (
                    <p className="text-sm text-red-500 mt-1">{phoneError}</p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">
                      {country?.flag} {country?.country} - Enter {selectedCountryCode === '+92' ? '10' : selectedCountryCode === '+971' || selectedCountryCode === '+966' ? '9' : '10'} digits
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                  <textarea
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Enter your complete delivery address"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-gray-800"
                  />
                </div>

                <div className="bg-teal-50 rounded-lg p-4 border border-teal-100">
                  <div className="flex items-start gap-3">
                    <MessageCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-teal-800">
                        Your order will be emailed to the shop owner. They will confirm your order shortly.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleEmailCheckout}
                  disabled={isSubmitting || !customerName || !customerPhone || !!phoneError}
                  className={`w-full py-4 rounded-xl font-semibold text-lg text-white transition-all flex items-center justify-center gap-2 ${
                    !isSubmitting && customerName && customerPhone && !phoneError
                      ? 'bg-green-600 hover:bg-green-700 shadow-lg'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                  style={{ color: 'white !important' }}
                >
                  <Mail className="w-5 h-5" />
                  {isSubmitting ? 'Sending...' : 'Send Order via Email'}
                </button>
                {submitError && <p className="text-sm text-red-500 text-center">{submitError}</p>}
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
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Order Sent! 🎉</h3>
              <p className="text-gray-600 mt-2">
                Your order has been emailed to the shop owner.
                They will contact you shortly to confirm.
              </p>
              <Link
                href="/"
                className="block mt-6 px-8 py-3 bg-teal-600 text-white hover:bg-teal-700 transition-colors"
                style={{ color: 'white !important' }}
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

function OrderSummaryCard({ cart, cartCount, cartTotal, removeFromCart, updateQuantity }: any) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 sticky top-24">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>

      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {cart.map((item: any) => (
          <div key={item.id} className="flex gap-4 py-4 border-b border-gray-100">
            <div className="relative w-16 h-16 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
              {item.image ? (
                <Image src={item.image} alt={item.title} fill className="object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-800 text-sm line-clamp-1">
                {item.title?.split('|')[0]?.trim() || item.title}
              </h4>

              {Array.isArray(item.selectedOptions) && item.selectedOptions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {item.selectedOptions
                    .filter((opt: any) => opt?.name && opt?.value)
                    .map((opt: any, i: number) => (
                      <span
                        key={i}
                        className="text-[10px] font-bold uppercase tracking-wider text-[#6f6248] bg-[#fdf6e3] px-2 py-0.5 rounded-full"
                      >
                        {opt.value}
                      </span>
                    ))}
                </div>
              )}

              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-semibold text-teal-600">
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
                    className="p-1 rounded hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-gray-500" />
                  </button>
                  <span className="w-6 text-center text-sm font-medium text-gray-800">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 rounded hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 rounded hover:bg-red-50 transition-colors ml-1"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex justify-between text-lg font-bold">
          <span className="text-gray-800">Total</span>
          <span className="text-teal-600">Rs {cartTotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span>Items</span>
          <span>{cartCount}</span>
        </div>
      </div>

      <Link href="/cart" className="block text-center text-sm text-teal-600 hover:text-teal-700 mt-4">
        ← Back to Cart
      </Link>
    </div>
  );
}