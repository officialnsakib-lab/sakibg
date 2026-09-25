// context/CurrencyContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Currency = 'BDT' | 'USD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  exchangeRate: number; // ১ ডলারে কত টাকা (যেমন: ১১৫ বা ১২০ টাকা)
  formatPrice: (amountInUSD: number) => string;
  convertPrice: (amountInUSD: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('USD'); // ডিফল্ট USD রাখতে পারেন
  const exchangeRate = 120; // আপনি আপনার ইচ্ছেমতো কনভার্শন রেট সেট করতে পারেন (যেমন: ১ USD = ১২০ BDT)

  // লোকাল স্টোরেজে কারেন্সি সেভ করে রাখা যাতে পেজ রিফ্রেশ করলে মুছে না যায়
  useEffect(() => {
    const savedCurrency = localStorage.getItem('preferred_currency') as Currency;
    if (savedCurrency) {
      setCurrencyState(savedCurrency);
    }
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('preferred_currency', newCurrency);
  };

  // যদি আপনার ডাটাবেজে প্রোডাক্টের দাম ডলারে সেভ করা থাকে, তবে টাকায় কনভার্ট করার হিসাব
  const convertPrice = (amount: number) => {
    if (currency === 'BDT') {
      return amount * exchangeRate;
    }
    return amount;
  };

  const formatPrice = (amount: number) => {
    const converted = convertPrice(amount);
    if (currency === 'BDT') {
      return `৳${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, exchangeRate, formatPrice, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}