import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { CartProvider } from '@/context/CartContext';
import { LoadingProvider } from '@/context/LoadingContext';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import LoadingScreen from '@/components/LoadingScreen';
import CustomCursor from '@/components/CustomCursor';
import Chatbot from '@/components/Chatbot';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tiny Soul',
  description: 'Premium kids wear from Tiny Soul Pakistan',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CustomCursor />
        <LoadingProvider>
          <CartProvider>
            <LoadingScreen />
            <Navbar />
            {children}
            <CartDrawer />
            <Chatbot />

            {/* ============================================================
                FOOTER — cream gradient flowing seamlessly from content
                ============================================================ */}
            <footer
              className="relative mt-0"
              style={{
                background: 'linear-gradient(180deg, #FDF6E3 0%, #F5E6C8 100%)',
              }}
            >
              <div className="container mx-auto px-6 pt-10 md:pt-14 pb-16 md:pb-20">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">

                  {/* Brand column */}
                  <div className="md:col-span-6">
                    <Link href="/" className="inline-block mb-6">
                      <Image
                        src="/logo.png"
                        alt="Tiny Soul"
                        width={400}
                        height={140}
                        className="h-20 md:h-32 w-auto object-contain"
                      />
                    </Link>
                    <p className="text-sm text-[#6f6248] max-w-sm leading-relaxed">
                      Premium kids wear curated with love and care. Every piece is made for little souls who love to play, explore, and grow.
                    </p>

                    {/* Trust row */}
                    <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7CB342]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#6f6248]">Free Shipping</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B9D]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#6f6248]">500+ Parents</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#29ABE2]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#6f6248]">4.9★ Rated</span>
                      </div>
                    </div>
                  </div>

                  {/* Shop links */}
                  <div className="md:col-span-3">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#2b2b2b] mb-5">
                      Shop
                    </h4>
                    <ul className="space-y-3">
                      <li>
                        <Link href="/products" className="group inline-flex items-center gap-2 text-sm text-[#6f6248] hover:text-[#F4713A] transition-colors">
                          <span className="w-4 h-px bg-current opacity-0 group-hover:opacity-100 transition-opacity" />
                          All Products
                        </Link>
                      </li>
                      <li>
                        <Link href="/products/new-arrivals" className="group inline-flex items-center gap-2 text-sm text-[#6f6248] hover:text-[#F4713A] transition-colors">
                          <span className="w-4 h-px bg-current opacity-0 group-hover:opacity-100 transition-opacity" />
                          New Arrivals
                        </Link>
                      </li>
                      <li>
                        <Link href="/products/sale" className="group inline-flex items-center gap-2 text-sm text-[#6f6248] hover:text-[#F4713A] transition-colors">
                          <span className="w-4 h-px bg-current opacity-0 group-hover:opacity-100 transition-opacity" />
                          Sale
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Support links */}
                  <div className="md:col-span-3">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#2b2b2b] mb-5">
                      Support
                    </h4>
                    <ul className="space-y-3">
                      <li>
                        <Link href="/contact" className="group inline-flex items-center gap-2 text-sm text-[#6f6248] hover:text-[#F4713A] transition-colors">
                          <span className="w-4 h-px bg-current opacity-0 group-hover:opacity-100 transition-opacity" />
                          Contact
                        </Link>
                      </li>
                      <li>
                        <Link href="/cart" className="group inline-flex items-center gap-2 text-sm text-[#6f6248] hover:text-[#F4713A] transition-colors">
                          <span className="w-4 h-px bg-current opacity-0 group-hover:opacity-100 transition-opacity" />
                          Cart
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-12 pt-8 border-t border-[#1c130d]/8 flex flex-col md:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-[#948362]">
                    © {new Date().getFullYear()} Tiny Soul. All rights reserved.
                  </p>
                  <div className="flex items-center gap-6">
                    <Link href="#" className="text-xs text-[#948362] hover:text-[#F4713A] transition-colors">
                      Privacy
                    </Link>
                    <Link href="#" className="text-xs text-[#948362] hover:text-[#F4713A] transition-colors">
                      Terms
                    </Link>
                    <Link href="#" className="text-xs text-[#948362] hover:text-[#F4713A] transition-colors">
                      Shipping
                    </Link>
                  </div>
                </div>
              </div>
            </footer>
          </CartProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}