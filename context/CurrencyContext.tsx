// context/CurrencyContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Currency = 'BDT' | 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD' | 'AED' | 'SAR' | 'SGD' | 'MYR' | 'JPY' | 'CNY';

interface CurrencyDetails {
  symbol: string;
  rateAgainstUSD: number; // ১ USD এর বিপরীতে অন্যান্য কারেন্সির মান
  name: string;
}

// প্রতিটি কারেন্সির এক্সচেঞ্জ রেট (বেস কারেন্সি USD ধরে)
const currencyDetails: Record<Currency, CurrencyDetails> = {
  USD: { symbol: '$', rateAgainstUSD: 1, name: 'US Dollar' },
  BDT: { symbol: '৳', rateAgainstUSD: 123, name: 'Bangladeshi Taka' }, // ১ ডলার = ১২৩ টাকা
  EUR: { symbol: '€', rateAgainstUSD: 0.92, name: 'Euro' },
  GBP: { symbol: '£', rateAgainstUSD: 0.78, name: 'British Pound' },
  INR: { symbol: '₹', rateAgainstUSD: 83.5, name: 'Indian Rupee' },
  CAD: { symbol: 'CA$', rateAgainstUSD: 1.35, name: 'Canadian Dollar' },
  AUD: { symbol: 'A$', rateAgainstUSD: 1.50, name: 'Australian Dollar' },
  AED: { symbol: 'AED ', rateAgainstUSD: 3.67, name: 'UAE Dirham' },
  SAR: { symbol: 'SAR ', rateAgainstUSD: 3.75, name: 'Saudi Riyal' },
  SGD: { symbol: 'S$', rateAgainstUSD: 1.34, name: 'Singapore Dollar' },
  MYR: { symbol: 'RM ', rateAgainstUSD: 4.20, name: 'Malaysian Ringgit' },
  JPY: { symbol: '¥', rateAgainstUSD: 145, name: 'Japanese Yen' },
  CNY: { symbol: '¥', rateAgainstUSD: 7.10, name: 'Chinese Yuan' },
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  exchangeRate: number; 
  formatPrice: (amountInUSD: number) => string;
  convertPrice: (amountInUSD: number) => number;
  availableCurrencies: Currency[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('BDT'); // ইউজার ডিফল্ট BDT দেখতে পারে
  
  useEffect(() => {
    const savedCurrency = localStorage.getItem('preferred_currency') as Currency;
    if (savedCurrency && currencyDetails[savedCurrency]) {
      setCurrencyState(savedCurrency);
    }
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('preferred_currency', newCurrency);
  };

  const currentCurrencyInfo = currencyDetails[currency] || currencyDetails['USD'];
  const exchangeRate = currentCurrencyInfo.rateAgainstUSD;

  // ডাটাবেজে থাকা USD অ্যামাউন্টকে ইউজারের সিলেক্ট করা কারেন্সিতে কনভার্ট করা
  const convertPrice = (amountInUSD: number) => {
    return (amountInUSD || 0) * exchangeRate;
  };

  // সঠিক সিম্বল এবং ফরম্যাট অনুযায়ী দাম রিটার্ন করা
  const formatPrice = (amountInUSD: number) => {
    const converted = convertPrice(amountInUSD);
    const decimals = currency === 'JPY' ? 0 : 2;
    
    return `${currentCurrencyInfo.symbol}${converted.toLocaleString('en-US', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    })}`;
  };

  const availableCurrencies = Object.keys(currencyDetails) as Currency[];

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      setCurrency, 
      exchangeRate, 
      formatPrice, 
      convertPrice, 
      availableCurrencies 
    }}>
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