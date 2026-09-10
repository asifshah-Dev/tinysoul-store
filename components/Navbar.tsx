'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Search, ShoppingBag, CreditCard } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { cartCount } = useCart();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 300);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (isMenuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSearchOpen &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node) &&
        searchButtonRef.current &&
        !searchButtonRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isMenuOpen) setIsMenuOpen(false);
        if (isSearchOpen) { setIsSearchOpen(false); setSearchQuery(''); }
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen, isSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const menuVariants: Variants = {
    hidden: { opacity: 0, x: -80 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeInOut' } },
    exit: { opacity: 0, x: -80, transition: { duration: 0.3, ease: 'easeInOut' } },
  };
  const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };
  const searchVariants: Variants = {
    hidden: { opacity: 0, y: -30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35 } },
    exit: { opacity: 0, y: -30, scale: 0.95, transition: { duration: 0.25 } },
  };
  const menuItemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1, x: 0,
      transition: { delay: i * 0.06, duration: 0.3 },
    }),
    exit: (i: number) => ({
      opacity: 0, x: -20,
      transition: { delay: i * 0.04, duration: 0.2 },
    }),
  };

  const menuItems = [
    { href: '/', label: 'Home', color: '#F4713A' },
    { href: '/cart', label: 'Cart', color: '#FF6B9D' },
    { href: '/products/new-arrivals', label: 'New arrivals', color: '#7CB342' },
    { href: '/products/summer', label: 'Summer', color: '#FFC93C' },
    { href: '/products/winter', label: 'Winter', color: '#29ABE2' },
    { href: '/products/sale', label: 'Sale', color: '#F4713A' },
    { href: '/products/girls-summer', label: 'Girls summer', color: '#FF6B9D' },
    { href: '/products/boys-winter', label: 'Boys winter', color: '#29ABE2' },
    { href: '/contact', label: 'Contact', color: '#9B59B6' },
  ];

  return (
    <>
      {/* ============ HEADER — fixed, subtle frosted glass ============ */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 bg-white/20 backdrop-blur-md border-b border-white/30">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between h-16 md:h-20 px-4 md:px-6">

            {/* LEFT: Menu + Search */}
            <div className="flex items-center gap-1 md:gap-2">
              <button
                ref={menuButtonRef}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-full text-[#2b2b2b] hover:bg-white/70 hover:text-[#F4713A] transition-all"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-6 h-6 md:w-7 md:h-7" /> : <Menu className="w-6 h-6 md:w-7 md:h-7" />}
              </button>

              <button
                ref={searchButtonRef}
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 rounded-full text-[#2b2b2b] hover:bg-white/70 hover:text-[#29ABE2] transition-all"
                aria-label="Search"
              >
                <Search className="w-6 h-6 md:w-7 md:h-7" />
              </button>
            </div>

            {/* CENTER: Logo */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2">
             <Image
  src="/logo.png"
  alt="Tiny Soul"
  width={500}
  height={150}
  className="h-20 md:h-32 w-auto object-contain"
  priority
/>
            </Link>

            {/* RIGHT: Cart + Checkout icons */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Cart icon → /cart */}
              <Link
                href="/cart"
                className="relative p-2 rounded-full text-[#2b2b2b] hover:bg-white/70 hover:text-[#FF6B9D] transition-all"
                aria-label="Cart"
              >
                <ShoppingBag className="w-6 h-6 md:w-7 md:h-7" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    className="absolute -top-0.5 -right-0.5 text-white text-xs font-bold rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #FF6B9D 0%, #F4713A 100%)' }}
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
                )}
              </Link>

              {/* Checkout icon → /checkout */}
              <Link
                href="/checkout"
                className="p-2 rounded-full text-[#2b2b2b] hover:bg-white/70 hover:text-[#7CB342] transition-all"
                aria-label="Checkout"
              >
                <CreditCard className="w-6 h-6 md:w-7 md:h-7" />
              </Link>
            </div>

          </div>
        </div>
      </header>

      {/* ============ MOBILE MENU ============ */}
      <AnimatePresence mode="wait">
        {isMenuOpen && (
          <>
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
            />

            <motion.div
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 left-0 z-50 h-full w-80 md:w-96
                         bg-white/60 backdrop-blur-2xl
                         border-r border-white/70"
            >
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/50">
                <Image
                  src="/logo.png"
                  alt="Tiny Soul"
                  width={240}
                  height={75}
                  className="h-14 w-auto object-contain"
                />
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-full text-[#2b2b2b] hover:bg-white/70 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="p-4 md:p-6 overflow-y-auto h-[calc(100%-110px)]">
                <ul className="space-y-2">
                  {menuItems.map((item, index) => (
                    <motion.li
                      key={item.href}
                      variants={menuItemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      custom={index}
                    >
                      <Link
                        href={item.href}
                        className="group flex items-center gap-3 px-4 py-3 text-base md:text-lg rounded-2xl
                                   text-[#2b2b2b] font-bold
                                   bg-white/40 hover:bg-white/90
                                   border border-white/50 hover:border-white
                                   transition-all"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full transition-transform group-hover:scale-125"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="group-hover:text-[#F4713A] transition-colors">
                          {item.label}
                        </span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ============ SEARCH BAR ============ */}
      <AnimatePresence mode="wait">
        {isSearchOpen && (
          <motion.div
            ref={searchContainerRef}
            variants={searchVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-3xl"
          >
            <div className="bg-white/55 backdrop-blur-2xl rounded-full px-4 py-2">
              <form onSubmit={handleSearch} className="flex items-center gap-3">
                <button
                  type="submit"
                  className="p-2 text-[#2b2b2b] hover:text-[#29ABE2] transition-colors"
                  aria-label="Submit search"
                >
                  <Search className="w-6 h-6" />
                </button>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 py-2 text-lg bg-transparent text-[#2b2b2b] placeholder:text-[#6f6248]/60 outline-none"
                />
                <button
                  type="button"
                  onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                  className="p-2 text-[#2b2b2b] hover:text-[#F4713A] transition-colors"
                  aria-label="Close search"
                >
                  <X className="w-6 h-6" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}