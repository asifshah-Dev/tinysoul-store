'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ============================================================
// TYPES
// ============================================================
export interface CartOption {
  name: string;
  value: string;
}

export interface CartItem {
  id: string;
  variantId: string;
  title: string;
  handle: string;
  price: number;
  quantity: number;
  image?: string;
  maxQuantity?: number;
  selectedOptions: CartOption[];
}

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (item: Omit<CartItem, 'id'>) => { success: boolean; message?: string };
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => { success: boolean; message?: string };
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(STORAGE_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          // Ensure every item has a selectedOptions array (defaults to [])
          const normalized: CartItem[] = parsed.map((item: any) => ({
            id: item.id || `${item.variantId}_${Date.now()}`,
            variantId: item.variantId || item.id || '',
            title: item.title || '',
            handle: item.handle || '',
            price: typeof item.price === 'number' ? item.price : parseFloat(item.price || '0'),
            quantity: typeof item.quantity === 'number' ? item.quantity : 1,
            image: item.image || '',
            maxQuantity: item.maxQuantity,
            selectedOptions: Array.isArray(item.selectedOptions)
              ? item.selectedOptions
              : [],
          }));
          setCart(normalized);
        }
      }
    } catch (e) {
      console.error('Failed to parse cart:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const addToCart = (item: Omit<CartItem, 'id'>): { success: boolean; message?: string } => {
    const existingItemIndex = cart.findIndex(
      cartItem => cartItem.variantId === item.variantId
    );

    const currentQuantity = existingItemIndex !== -1
      ? cart[existingItemIndex].quantity
      : 0;

    const newQuantity = currentQuantity + item.quantity;

    if (item.maxQuantity !== undefined && newQuantity > item.maxQuantity) {
      return {
        success: false,
        message: `Only ${item.maxQuantity} items available. You have ${currentQuantity} in cart.`,
      };
    }

    setCart(prevCart => {
      if (existingItemIndex !== -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity = newQuantity;
        // keep selectedOptions from the new item (in case they differ — shouldn't, but safe)
        updatedCart[existingItemIndex].selectedOptions = item.selectedOptions || [];
        return updatedCart;
      } else {
        return [
          ...prevCart,
          {
            ...item,
            selectedOptions: Array.isArray(item.selectedOptions) ? item.selectedOptions : [],
            id: `${item.variantId}_${Date.now()}`,
          },
        ];
      }
    });

    setIsCartOpen(true);
    return { success: true };
  };

  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number): { success: boolean; message?: string } => {
    if (quantity <= 0) {
      removeFromCart(id);
      return { success: true };
    }

    const item = cart.find(item => item.id === id);
    if (!item) return { success: false, message: 'Item not found' };

    if (item.maxQuantity !== undefined && quantity > item.maxQuantity) {
      return { success: false, message: `Only ${item.maxQuantity} items available.` };
    }

    setCart(prevCart =>
      prevCart.map(cartItem =>
        cartItem.id === id ? { ...cartItem, quantity } : cartItem
      )
    );
    return { success: true };
  };

  const clearCart = () => setCart([]);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen(prev => !prev);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}