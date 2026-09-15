'use client';

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useState, useEffect, useMemo, useRef } from 'react';
import { ShoppingBag, Plus, Minus, ZoomIn, ZoomOut } from 'lucide-react';
import { fetchProductByHandle } from '@/lib/data-source';
import { useCart } from '@/context/CartContext';

interface ProductClientProps {
  handle: string;
}

// ============================================================
// HELPERS
// ============================================================
function getVariants(product: any): any[] {
  if (!product?.variants) return [];
  if (Array.isArray(product.variants)) return product.variants;
  if (Array.isArray(product.variants.edges)) {
    return product.variants.edges.map((e: any) => e.node);
  }
  return [];
}

function getPrice(variant: any): number {
  if (!variant) return 0;
  const raw =
    (typeof variant.price === 'string' && variant.price) ||
    variant.price?.amount ||
    '0';
  const n = parseFloat(raw);
  return isNaN(n) ? 0 : n;
}

function getCompareAtPrice(variant: any): number {
  if (!variant) return 0;
  const raw =
    (typeof variant.compareAtPrice === 'string' && variant.compareAtPrice) ||
    variant.compareAtPrice?.amount ||
    '0';
  const n = parseFloat(raw);
  return isNaN(n) ? 0 : n;
}

function getOption(variant: any, name: string): string {
  const opt = variant?.selectedOptions?.find(
    (o: any) => o.name?.toLowerCase() === name.toLowerCase()
  );
  return opt?.value || '';
}

// ═══ AVAILABILITY ═══
function isVariantAvailable(variant: any): boolean {
  if (!variant) return false;
  return variant.availableForSale !== false;
}

// ============================================================
// BgRemovedImage
// ============================================================
function BgRemovedImage({
  src,
  alt,
  className,
  tolerance = 245,
}: {
  src: string;
  alt: string;
  className?: string;
  tolerance?: number;
}) {
  const [processedSrc, setProcessedSrc] = useState<string>(src);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const img = new window.Image();
    if (src.startsWith('http')) img.crossOrigin = 'anonymous';

    img.onload = () => {
      if (!isMounted) return;
      try {
        const canvas = document.createElement('canvas');
        const w = img.naturalWidth || 800;
        const h = img.naturalHeight || 800;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) { setIsProcessing(false); return; }

        ctx.drawImage(img, 0, 0, w, h);
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          if (data[i] >= tolerance && data[i + 1] >= tolerance && data[i + 2] >= tolerance) {
            data[i + 3] = 0;
          }
        }
        ctx.putImageData(imageData, 0, 0);
        if (isMounted) {
          setProcessedSrc(canvas.toDataURL('image/png'));
          setIsProcessing(false);
        }
      } catch {
        if (isMounted) { setProcessedSrc(src); setIsProcessing(false); }
      }
    };
    img.onerror = () => { if (isMounted) { setProcessedSrc(src); setIsProcessing(false); } };
    img.src = src;
    return () => { isMounted = false; };
  }, [src, tolerance]);

  return (
    <img
      src={processedSrc}
      alt={alt}
      className={`${className} transition-opacity duration-300 ${isProcessing ? 'opacity-0' : 'opacity-100'}`}
    />
  );
}

// ============================================================

export default function ProductClientPage({ handle }: ProductClientProps) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  // ═══ Zoom state ═══
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await fetchProductByHandle(handle);
        setProduct(data);

        if (data) {
          const variants = getVariants(data);
          const first =
            variants.find((v: any) => isVariantAvailable(v)) ||
            variants[0];
          if (first) {
            setSelectedColor(getOption(first, 'color'));
            setSelectedSize(getOption(first, 'size'));
          }
        }
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [handle]);

  const variants = useMemo(() => getVariants(product), [product]);

  const colorOptions = useMemo(() => {
    const colors: string[] = [];
    variants.forEach((v: any) => {
      const c = getOption(v, 'color');
      if (c && !colors.includes(c)) colors.push(c);
    });
    return colors;
  }, [variants]);

  const sizeOptions = useMemo(() => {
    const sizes: string[] = [];
    variants.forEach((v: any) => {
      const s = getOption(v, 'size');
      if (s && !sizes.includes(s)) sizes.push(s);
    });
    return sizes;
  }, [variants]);

  // ═══ Which colors/sizes have at least one available variant? ═══
  const availableColors = useMemo(() => {
    const set = new Set<string>();
    variants.forEach((v: any) => {
      if (isVariantAvailable(v)) {
        const c = getOption(v, 'color');
        if (c) set.add(c);
      }
    });
    return set;
  }, [variants]);

  const availableSizes = useMemo(() => {
    const set = new Set<string>();
    variants.forEach((v: any) => {
      if (isVariantAvailable(v)) {
        const s = getOption(v, 'size');
        if (s) set.add(s);
      }
    });
    return set;
  }, [variants]);

  // ═══ Is the whole product sold out? ═══
  const allSoldOut = useMemo(() => {
    if (variants.length === 0) return false;
    return variants.every((v: any) => !isVariantAvailable(v));
  }, [variants]);

  const selectedVariant = useMemo(() => {
    let match = variants.find((v: any) => {
      const c = getOption(v, 'color');
      const s = getOption(v, 'size');
      const colorOk = !selectedColor || c === selectedColor;
      const sizeOk = !selectedSize || s === selectedSize;
      return colorOk && sizeOk;
    });

    if (!match && selectedColor) {
      match = variants.find((v: any) => getOption(v, 'color') === selectedColor);
    }
    return match || variants[0] || null;
  }, [variants, selectedColor, selectedSize]);

  const selectedAvailable = isVariantAvailable(selectedVariant);
  const soldOut = !selectedAvailable;

  // ═══ Auto-correct: if current combo is sold out, pick an available one ═══
  useEffect(() => {
    if (!selectedVariant) return;
    if (isVariantAvailable(selectedVariant)) return;

    const fallback = variants.find(
      (v: any) =>
        isVariantAvailable(v) &&
        (!selectedColor || getOption(v, 'color') === selectedColor)
    ) || variants.find((v: any) => isVariantAvailable(v));

    if (fallback) {
      setSelectedColor(getOption(fallback, 'color'));
      setSelectedSize(getOption(fallback, 'size'));
    }
  }, [selectedVariant, variants, selectedColor]);

  const allImages = useMemo(
    () => product?.images?.edges?.map((edge: any) => edge.node.url) || [],
    [product]
  );

  const colorImages = useMemo(() => {
    if (colorOptions.length <= 1) return allImages;

    const indexOfColor = colorOptions.indexOf(selectedColor);
    if (indexOfColor === -1) return allImages;

    const perColor = Math.floor(allImages.length / colorOptions.length);
    const remainder = allImages.length % colorOptions.length;

    let start = 0;
    for (let i = 0; i < indexOfColor; i++) {
      start += perColor + (i < remainder ? 1 : 0);
    }
    const count = perColor + (indexOfColor < remainder ? 1 : 0);

    const sliced = allImages.slice(start, start + count);
    return sliced.length > 0 ? sliced : allImages;
  }, [allImages, colorOptions, selectedColor]);

  useEffect(() => {
    setSelectedImage(0);
  }, [selectedColor]);

  useEffect(() => {
    setIsZoomed(false);
    setZoomOrigin({ x: 50, y: 50 });
  }, [selectedImage, selectedColor]);

  const mainImage =
    colorImages[selectedImage] ||
    colorImages[0] ||
    product?.image ||
    '';

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-zoom-reset]')) return;
    if (!imageContainerRef.current) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    setZoomOrigin({ x: clampedX, y: clampedY });
    setIsZoomed(true);
  };

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZoomed(false);
    setZoomOrigin({ x: 50, y: 50 });
  };

  const handleAddToCart = () => {
    if (isAdding || soldOut) return;

    setIsAdding(true);

    const price = getPrice(selectedVariant) || parseFloat(product?.price || '0');
    const image = colorImages[0] || product?.image || '';

    const selectedOptions = Array.isArray(selectedVariant?.selectedOptions)
      ? selectedVariant.selectedOptions
          .filter((o: any) => o?.name && o?.value)
          .map((o: any) => ({ name: o.name, value: o.value }))
      : [];

    const result = addToCart({
      variantId: selectedVariant?.id || product?.id || '',
      title: product?.title || '',
      handle: product?.handle || '',
      price: price,
      quantity: quantity,
      image: image,
      selectedOptions: selectedOptions,
    });

    if (!result.success) {
      setErrorMsg(result.message || 'Cannot add to cart');
      setTimeout(() => setErrorMsg(''), 3000);
    } else {
      setErrorMsg('✅ Added to cart!');
      setTimeout(() => setErrorMsg(''), 2000);
    }

    setTimeout(() => setIsAdding(false), 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 md:pt-28">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  const price = getPrice(selectedVariant) || parseFloat(product.price || '0');
  const compareAt = getCompareAtPrice(selectedVariant);
  const onSale = compareAt > price && price > 0;
  const discountPercent = onSale ? Math.round(((compareAt - price) / compareAt) * 100) : 0;

  const totalPrice = price * quantity;

  return (
    <div className="min-h-screen pt-20 md:pt-28">
      <div className="container mx-auto px-4 py-4 md:py-8">

        <nav className="text-xs md:text-sm text-gray-500 mb-4 md:mb-6 flex items-center flex-wrap gap-y-1">
          <Link href="/" className="hover:text-teal-600 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-teal-600 transition-colors">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800 font-medium line-clamp-1">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 p-4 md:p-8 border border-gray-100 rounded-2xl">

          {/* ═══ LEFT — Images ═══ */}
          <div>
            <div
              ref={imageContainerRef}
              onClick={handleImageClick}
              className="relative h-72 sm:h-80 md:h-96 rounded-xl overflow-hidden bg-[#faf7f2] cursor-zoom-in select-none"
            >
              {mainImage ? (
                <div
                  className="w-full h-full transition-transform duration-300 ease-out"
                  style={{
                    transform: isZoomed ? 'scale(2)' : 'scale(1)',
                    transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                    willChange: 'transform',
                  }}
                >
                  <BgRemovedImage
                    src={mainImage}
                    alt={product.title}
                    className="w-full h-full object-contain p-4 md:p-6 pointer-events-none"
                    tolerance={245}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  No image available
                </div>
              )}

              {/* ═══ Red Sold Out label over the image ═══ */}
              {soldOut && (
                <div className="absolute top-3 left-3 md:top-4 md:left-4 z-20 px-3 py-1 md:px-4 md:py-1.5 rounded text-[10px] md:text-xs font-bold uppercase tracking-[0.15em] text-white bg-red-600 shadow-md">
                  Sold Out
                </div>
              )}

              {!isZoomed && mainImage && (
                <div className="pointer-events-none absolute bottom-3 right-3 md:bottom-4 md:right-4 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/80 backdrop-blur-sm text-[10px] md:text-xs font-semibold text-[#6f6248] shadow-sm">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tap to zoom</span>
                  <span className="sm:hidden">Zoom</span>
                </div>
              )}

              {isZoomed && (
                <button
                  data-zoom-reset
                  onClick={handleResetZoom}
                  className="absolute bottom-3 right-3 md:bottom-4 md:right-4 z-20 flex items-center gap-1.5 px-3 py-2 md:px-3.5 md:py-2 rounded-full bg-white shadow-md hover:bg-[#FFF5ED] active:scale-95 transition-all text-[10px] md:text-xs font-bold text-[#2b2b2b] cursor-pointer"
                  aria-label="Reset zoom"
                >
                  <ZoomOut className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Reset zoom</span>
                  <span className="sm:hidden">Reset</span>
                </button>
              )}
            </div>

            {colorImages.length > 1 && (
              <div className="flex gap-2 mt-3 md:mt-4 overflow-x-auto pb-2 no-scrollbar">
                {colorImages.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-14 h-14 md:w-20 md:h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors bg-[#faf7f2] ${
                      selectedImage === index ? 'border-teal-600' : 'border-gray-200'
                    } hover:border-teal-400`}
                  >
                    <BgRemovedImage
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-contain p-1"
                      tolerance={245}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ═══ RIGHT — Details ═══ */}
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              {product.title.split('|')[0]?.trim() || product.title}
            </h1>

            {/* ═══ Sold-out inline label (below title) ═══ */}
            {(soldOut || allSoldOut) && (
              <div className="mt-3 inline-block px-3 py-1 rounded text-[11px] font-semibold uppercase tracking-[0.15em] text-white bg-red-600">
                Sold Out
              </div>
            )}

            <div className="mt-3 md:mt-4 flex items-center gap-2 md:gap-3 flex-wrap">
              <span className="text-2xl md:text-3xl font-bold text-teal-600">
                Rs {totalPrice.toLocaleString()}
              </span>
              {onSale && (
                <>
                  <span className="text-base md:text-lg text-gray-400 line-through">
                    Rs {(compareAt * quantity).toLocaleString()}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#2b2b2b] bg-[#f5e6c8] px-2 py-1 rounded">
                    Save {discountPercent}%
                  </span>
                </>
              )}
              {quantity > 1 && (
                <span className="text-xs md:text-sm text-gray-400 w-full">
                  (Rs {price.toLocaleString()} × {quantity})
                </span>
              )}
            </div>

            {/* ═══ Colors ═══ */}
            {colorOptions.length > 0 && (
              <div className="mt-5 md:mt-6">
                <label className="text-xs md:text-sm font-medium text-gray-700 block mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => {
                    const isSelected = selectedColor === color;
                    const isAvailable = availableColors.has(color);
                    return (
                      <button
                        key={color}
                        disabled={!isAvailable}
                        onClick={() => isAvailable && setSelectedColor(color)}
                        className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium border-2 transition-all ${
                          !isAvailable
                            ? 'border-gray-200 text-gray-300 line-through cursor-not-allowed opacity-60'
                            : isSelected
                            ? 'border-teal-600 bg-teal-50 text-teal-700'
                            : 'border-gray-200 text-gray-700 hover:border-teal-400 hover:text-teal-700'
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ═══ Sizes ═══ */}
            {sizeOptions.length > 0 && (
              <div className="mt-5 md:mt-6">
                <label className="text-xs md:text-sm font-medium text-gray-700 block mb-2">
                  Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((size) => {
                    const isSelected = selectedSize === size;
                    const isAvailable = availableSizes.has(size);
                    return (
                      <button
                        key={size}
                        disabled={!isAvailable}
                        onClick={() => isAvailable && setSelectedSize(size)}
                        className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium border-2 transition-all ${
                          !isAvailable
                            ? 'border-gray-200 text-gray-300 line-through cursor-not-allowed opacity-60'
                            : isSelected
                            ? 'border-teal-600 bg-teal-50 text-teal-700'
                            : 'border-gray-200 text-gray-700 hover:border-teal-400 hover:text-teal-700'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {product.description && (
              <div className="mt-5 md:mt-6">
                <h3 className="text-xs md:text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Description
                </h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* ═══ Quantity (hidden when sold out) ═══ */}
            {!soldOut && (
              <div className="mt-5 md:mt-6">
                <label className="text-xs md:text-sm font-medium text-gray-700 block mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="w-12 text-center font-medium text-gray-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            )}

            <div className="mt-5 md:mt-6">
              {errorMsg && (
                <div className={`text-sm text-center mb-3 ${errorMsg.includes('✅') ? 'text-green-600' : 'text-red-500'}`}>
                  {errorMsg}
                </div>
              )}
              <button
                onClick={handleAddToCart}
                disabled={isAdding || soldOut}
                className={`w-full py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg transition-all flex items-center justify-center gap-2 ${
                  soldOut
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : !isAdding
                    ? 'bg-black hover:bg-gray-800 text-white shadow-lg'
                    : 'bg-gray-400 text-white cursor-not-allowed'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                {soldOut ? 'Sold Out' : isAdding ? 'Adding...' : 'Add to Cart'}
              </button>

              {!soldOut && (
                <p className="text-xs md:text-sm text-gray-400 text-center mt-3">
                  Free shipping on orders over Rs 5000
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}