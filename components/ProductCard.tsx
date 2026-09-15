'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    handle: string;
    description?: string;
    price?: string;
    image?: string | null;
    variants?: any;
    images: {
      edges: Array<{
        node: {
          url: string;
          altText: string | null;
          width: number;
          height: number;
        };
      }>;
    };
  };
  currencySymbol?: string;
  currencyRate?: number;
}

// ============================================================
// PRICE HELPERS
// ============================================================
function getFirstVariant(product: any): any {
  if (!product?.variants) return null;
  if (Array.isArray(product.variants)) return product.variants[0] || null;
  if (Array.isArray(product.variants.edges)) return product.variants.edges[0]?.node || null;
  return null;
}

function getPrice(product: any): number {
  const variant = getFirstVariant(product);
  const raw =
    (typeof variant?.price === 'string' && variant.price) ||
    variant?.price?.amount ||
    product?.price ||
    '0';
  const n = parseFloat(raw);
  return isNaN(n) ? 0 : n;
}

function getCompareAtPrice(product: any): number {
  const variant = getFirstVariant(product);
  const raw =
    (typeof variant?.compareAtPrice === 'string' && variant.compareAtPrice) ||
    variant?.compareAtPrice?.amount ||
    '0';
  const n = parseFloat(raw);
  return isNaN(n) ? 0 : n;
}

// ============================================================
// AVAILABILITY — sold out only if first variant is explicitly false
// ============================================================
function isSoldOut(product: any): boolean {
  const variant = getFirstVariant(product);
  if (!variant) return false;
  return variant.availableForSale === false;
}

// ============================================================

export default function ProductCard({ product, currencySymbol = 'Rs', currencyRate = 1 }: ProductCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isSecondImageLoaded, setIsSecondImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { addToCart } = useCart();

  // ═══ Grab up to 2 images ═══
  const images = product.images?.edges?.map((e) => e.node.url) || [];
  const primaryImage = images[0] || product.image || null;
  const secondaryImage = images[1] || null;
  const hasSecondary = !!secondaryImage;

  const variant = getFirstVariant(product);

  const price = getPrice(product);
  const compareAt = getCompareAtPrice(product);

  const soldOut = isSoldOut(product);

  const onSale = !soldOut && compareAt > price && price > 0;
  const discountPercent = onSale
    ? Math.round(((compareAt - price) / compareAt) * 100)
    : 0;

  const cleanTitle = (product.title || '').split('|')[0]?.trim() || product.title;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAdding || soldOut) return;

    setIsAdding(true);

    const result = addToCart({
      variantId: variant?.id || product.id,
      title: product.title,
      handle: product.handle,
      price: price,
      quantity: 1,
      image: primaryImage || '',
      selectedOptions: [],
    });

    if (!result.success) {
      setErrorMsg(result.message || 'Cannot add to cart');
      setTimeout(() => setErrorMsg(''), 2000);
    }

    setTimeout(() => setIsAdding(false), 500);
  };

  return (
    <Link
      href={`/product/${product.handle}`}
      className="group relative block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden rounded-xl bg-zinc-100">
        <div className="aspect-[3/4] relative">
          {primaryImage ? (
            <>
              {/* ═══ Loading skeleton ═══ */}
              {(!isImageLoaded || (isHovered && hasSecondary && !isSecondImageLoaded)) && (
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 animate-pulse" />
              )}

              {/* ═══ Primary image ═══ */}
              <Image
                src={primaryImage}
                alt={cleanTitle}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`
                  object-cover transition-all duration-700 ease-out
                  group-hover:scale-105
                  ${isImageLoaded ? 'opacity-100' : 'opacity-0'}
                  ${isHovered && hasSecondary ? 'opacity-0' : ''}
                `}
                onLoad={() => setIsImageLoaded(true)}
                priority={false}
                quality={85}
              />

              {/* ═══ Secondary image (fades in on hover) ═══ */}
              {hasSecondary && (
                <Image
                  src={secondaryImage!}
                  alt={`${cleanTitle} — alternate view`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className={`
                    object-cover absolute inset-0 transition-all duration-700 ease-out
                    group-hover:scale-105
                    ${isHovered && isSecondImageLoaded ? 'opacity-100' : 'opacity-0'}
                  `}
                  onLoad={() => setIsSecondImageLoaded(true)}
                  priority={false}
                  quality={85}
                />
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-100">
              <svg
                className="w-12 h-12 text-zinc-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {/* Sale badge — top-left (hidden when sold out) */}
          {onSale && !soldOut && (
            <div className="absolute top-2 left-2 md:top-3 md:left-3 z-10 px-2 py-0.5 md:px-2.5 md:py-1 rounded text-[9px] md:text-[10px] font-semibold uppercase tracking-[0.15em] text-[#2b2b2b] bg-[#f5e6c8]">
              -{discountPercent}%
            </div>
          )}

          {/* Sold Out — red label, top-left */}
          {soldOut && (
            <div className="absolute top-2 left-2 md:top-3 md:left-3 z-10 px-2 py-0.5 md:px-2.5 md:py-1 rounded text-[9px] md:text-[10px] font-semibold uppercase tracking-[0.15em] text-white bg-red-600">
              Sold Out
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 md:mt-4 space-y-1 md:space-y-1.5">
        {/* Title */}
        <h3 className="text-sm md:text-base font-medium text-zinc-800 leading-snug group-hover:text-zinc-600 transition-colors duration-300 line-clamp-2">
          {cleanTitle}
        </h3>

        {/* Price row */}
        <div className="flex items-baseline gap-1.5 md:gap-2 flex-wrap">
          <span className="text-sm md:text-lg font-semibold text-zinc-900 tracking-tight">
            {currencySymbol} {price.toLocaleString()}
          </span>
          {onSale && (
            <>
              <span className="text-xs md:text-sm text-zinc-400 line-through">
                {compareAt.toLocaleString()}
              </span>
              <span className="text-[10px] md:text-xs font-medium tracking-wide text-[#6f6248] bg-[#fdf6e3] px-2 py-0.5 md:px-2.5 md:py-1 rounded-full whitespace-nowrap">
                Sale
              </span>
            </>
          )}
        </div>

        {errorMsg && (
          <div className="mt-1 text-xs text-red-500 font-medium">
            {errorMsg}
          </div>
        )}

        <button
          onClick={handleAddToCart}
          disabled={isAdding || soldOut}
          className={`w-full mt-2 py-1.5 md:py-2 text-xs md:text-sm font-medium rounded-lg transition-all duration-200 ${
            soldOut
              ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200'
              : !isAdding
              ? 'bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98]'
              : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
          }`}
        >
          {soldOut ? 'Sold Out' : isAdding ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
}