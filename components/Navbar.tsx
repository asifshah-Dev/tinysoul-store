'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Search, ShoppingBag, CreditCard, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { fetchProducts } from '@/lib/data-source';

interface SearchProduct {
  id: string;
  title: string;
  handle: string;
  image?: string | null;
  productType?: string;
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { cartCount } = useCart();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);

  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetchProducts()
      .then((data: any[]) => {
        if (!isMounted) return;
        setProducts(
          data.map((p) => ({
            id: p.id,
            title: p.title,
            handle: p.handle,
            image: p.images?.edges?.[0]?.node?.url || p.image || null,
            productType: p.productType,
          }))
        );
        setProductsLoaded(true);
      })
      .catch((err) => {
        console.error('Failed to load products for search:', err);
        setProductsLoaded(true);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    return products
      .filter((p) => {
        const title = (p.title || '').toLowerCase();
        const type = (p.productType || '').toLowerCase();
        return title.includes(q) || type.includes(q);
      })
      .slice(0, 6);
  }, [searchQuery, products]);

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
    const q = searchQuery.trim();
    if (!q) return;

    if (searchResults.length > 0) {
      window.location.href = `/product/${searchResults[0].handle}`;
      return;
    }

    window.location.href = `/products?q=${encodeURIComponent(q)}`;
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleResultClick = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
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
    { href: '/contact', label: 'Contact', color: '#9B59B6' },
  ];

  return (
    <>
      {/* ============ HEADER — taller, bigger logo ============ */}
      <header
        className="fixed top-0 left-0 right-0 z-50 border-0 shadow-none"
        style={{
          backgroundColor: '#FDF6E3',
          borderBottom: 'none',
          boxShadow: 'none',
        }}
      >
        <div className="container mx-auto max-w-7xl">
          <div className="relative flex items-center justify-between h-20 md:h-28 px-4 md:px-6">

            {/* LEFT: Menu + Search */}
            <div className="flex items-center gap-1 md:gap-2 z-10">
              <button
                ref={menuButtonRef}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-full text-[#1c130d] hover:bg-[#F5E6C8]/60 hover:text-[#F4713A] transition-all"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-6 h-6 md:w-7 md:h-7" /> : <Menu className="w-6 h-6 md:w-7 md:h-7" />}
              </button>

              <button
                ref={searchButtonRef}
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 rounded-full text-[#1c130d] hover:bg-[#F5E6C8]/60 hover:text-[#29ABE2] transition-all"
                aria-label="Search"
              >
                <Search className="w-6 h-6 md:w-7 md:h-7" />
              </button>
            </div>

            {/* CENTER: Logo — bigger now */}
            <Link
              href="/"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
            >
              <Image
  src="/logo.png"
  alt="Tiny Soul"
  width={500}
  height={150}
  className="h-24 md:h-32 lg:h-36 w-auto object-contain"
  priority
/>
            </Link>

            {/* RIGHT: Cart + Checkout icons */}
            <div className="flex items-center gap-1 md:gap-2 z-10">
              <Link
                href="/cart"
                className="relative p-2 rounded-full text-[#1c130d] hover:bg-[#F5E6C8]/60 hover:text-[#FF6B9D] transition-all"
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

              <Link
                href="/checkout"
                className="p-2 rounded-full text-[#1c130d] hover:bg-[#F5E6C8]/60 hover:text-[#7CB342] transition-all"
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
            className="fixed top-24 md:top-32 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-3xl"
          >
            <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(43,43,43,0.25)] overflow-hidden">
              <form onSubmit={handleSearch} className="flex items-center gap-3 px-4 py-2">
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
                  autoComplete="off"
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

              {searchQuery.trim().length >= 2 && (
                <div className="border-t border-[#f5e6c8] max-h-[60vh] overflow-y-auto">
                  {searchResults.length === 0 ? (
                    <div className="px-5 py-8 text-center">
                      {!productsLoaded ? (
                        <p className="text-sm text-[#948362]">Loading products…</p>
                      ) : (
                        <>
                          <p className="text-sm text-[#6f6248]">
                            No products found for "<span className="font-semibold">{searchQuery}</span>"
                          </p>
                          <Link
                            href="/products"
                            onClick={handleResultClick}
                            className="mt-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#F4713A] hover:text-[#d9531f]"
                          >
                            Browse all products
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </>
                      )}
                    </div>
                  ) : (
                    <ul className="py-2">
                      {searchResults.map((product) => (
                        <li key={product.id}>
                          <Link
                            href={`/product/${product.handle}`}
                            onClick={handleResultClick}
                            className="flex items-center gap-4 px-5 py-3 hover:bg-[#FFF6E5] transition-colors"
                          >
                            <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-[#f5e6c8]">
                              {product.image ? (
                                <Image
                                  src={product.image}
                                  alt={product.title}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ShoppingBag className="w-5 h-5 text-[#b8a67e]" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[#2b2b2b] line-clamp-1">
                                {product.title}
                              </p>
                              {product.productType && (
                                <p className="text-xs text-[#948362] mt-0.5">
                                  {product.productType}
                                </p>
                              )}
                            </div>

                            <ArrowRight className="w-4 h-4 text-[#b8a67e] flex-shrink-0" />
                          </Link>
                        </li>
                      ))}

                      <li className="border-t border-[#f5e6c8]">
                        <Link
                          href={`/products?q=${encodeURIComponent(searchQuery)}`}
                          onClick={handleResultClick}
                          className="flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-widest text-[#F4713A] hover:bg-[#FFF6E5] transition-colors"
                        >
                          See all results
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </li>
                    </ul>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}