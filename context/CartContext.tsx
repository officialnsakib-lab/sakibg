'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id?: string;
  _id?: string;
  productId?: string;
  title: string;
  price?: number;
  salePrice?: number;
  image?: string;
  thumbnailUrl?: string;
  quantity: number;
  vendorId?: string;
  [key: string]: any; // অতিরিক্ত যেকোনো প্রপার্টি হ্যান্ডেল করার জন্য
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // LocalStorage থেকে কার্ট লোড করা
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage', error);
      }
    }
  }, []);

  // কার্ট আপডেট হলে LocalStorage এ সেভ করা
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // ইউনিক আইডি বের করার একটি হেল্পার ফাংশন
  const getItemId = (item: CartItem) => item.productId || item._id || item.id || '';

  const addToCart = (product: CartItem) => {
    const newProductId = getItemId(product);
    
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => getItemId(item) === newProductId
      );

      if (existingIndex > -1) {
        // যদি প্রduct আগে থেকেই থাকে, তবে কোয়ান্টিটি বাড়াবে
        const updatedCart = [...prevCart];
        const existingItem = updatedCart[existingIndex];
        updatedCart[existingIndex] = {
          ...existingItem,
          quantity: Number(existingItem.quantity || 1) + Number(product.quantity || 1),
        };
        return updatedCart;
      }
      
      // নতুন প্রডাক্ট হলে কার্টে যুক্ত করবে
      return [...prevCart, { ...product, quantity: Number(product.quantity || 1) }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => getItemId(item) !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        getItemId(item) === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // মোট দাম সঠিকভাবে হিসাব করার জন্য price বা salePrice এবং quantity চেক করা
  const totalAmount = cart.reduce((sum, item) => {
    const itemPrice = Number(item.salePrice || item.price || 0);
    const itemQty = Number(item.quantity || 1);
    return sum + itemPrice * itemQty;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};