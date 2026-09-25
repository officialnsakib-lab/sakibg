'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCurrency } from '@/context/CurrencyContext';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin, isVendor, logout, loading } = useAuth();
  
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { currency, setCurrency } = useCurrency();

  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const isDashboardPage = pathname.startsWith('/vendor') || pathname.startsWith('/admin');

  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };
  
  const handleLogout = () => {
    setIsUserMenuOpen(false);
    logout();
  };
  
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  const getDashboardLink = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isVendor) return '/vendor/dashboard';
    return '/dashboard';
  };

  const totalCartItems = mounted && Array.isArray(cart) 
    ? cart.reduce((total, item) => total + (item.quantity || 1), 0)
    : 0;

  const totalWishlistItems = mounted && Array.isArray(wishlist) ? wishlist.length : 0;
  
  if (isDashboardPage) {
    return null;
  }
  
  return (
    <header className={`sticky top-0 z-50 bg-[#070b12] text-white transition-shadow w-full ${scrolled ? 'shadow-2xl shadow-black/50' : ''}`}>
      {/* Top Main Navbar Section */}
      <div className="border-b border-amber-500/15">
        <div className="w-full px-2 sm:px-4 lg:px-6 py-3 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Custom Logo Image */}
          <Link href="/" className="flex items-center group shrink-0">
            <div className="relative w-32 xs:w-36 sm:w-44 lg:w-48 h-10 xs:h-12 sm:h-14 overflow-hidden flex items-center justify-start">
              <Image 
                src="/tt.png" 
                alt="Wahisnova IMEX Logo" 
                fill 
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          {/* Central Search Bar (Desktop) */}
          <div className="flex-1 max-w-xl hidden md:block px-2">
            <form onSubmit={handleSearch} className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, categories, or vendors..."
                className="w-full bg-white text-neutral-900 px-4 py-2.5 pr-12 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-1.5 bg-amber-400 hover:bg-amber-500 text-neutral-950 p-2 rounded-full transition-colors flex items-center justify-center"
                aria-label="Search"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>

          {/* Right Action Icons & Currency Switcher */}
          <div className="flex items-center gap-1 sm:gap-2.5 lg:gap-3 shrink-0">
            
            {/* Currency Selector Dropdown */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as 'BDT' | 'USD')}
              className="bg-neutral-800 text-amber-300 border border-amber-500/30 text-xs sm:text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer font-semibold"
            >
              <option value="USD" className="bg-neutral-900 text-white">USD ($)</option>
              <option value="BDT" className="bg-neutral-900 text-white">BDT (৳)</option>
            </select>

            {/* Auth / Profile Area */}
            {!loading && (
              <>
                {isAuthenticated ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-1.5 p-1 rounded-full hover:bg-white/5 transition-colors border border-transparent hover:border-amber-500/30"
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-tr from-amber-600 to-yellow-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-sm">
                        {getUserInitials()}
                      </div>
                      <span className="hidden lg:block text-sm font-medium text-amber-100 max-w-[100px] truncate">
                        {user?.name?.split(' ')[0]}
                      </span>
                    </button>
                    
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white text-neutral-800 rounded-xl shadow-2xl border border-amber-100 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                          <span className={`inline-block mt-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                            user?.role === 'admin' ? 'bg-red-100 text-red-700' :
                            user?.role === 'vendor' ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                          </span>
                        </div>
                        
                        <Link href={getDashboardLink()} className="block px-4 py-2.5 text-sm font-medium hover:bg-amber-50 hover:text-amber-700" onClick={() => setIsUserMenuOpen(false)}>📊 Dashboard</Link>
                        {isVendor && <Link href="/vendor/products/upload" className="block px-4 py-2.5 text-sm font-medium hover:bg-amber-50 hover:text-amber-700" onClick={() => setIsUserMenuOpen(false)}>📦 Upload Product</Link>}
                        <Link href="/profile" className="block px-4 py-2.5 text-sm font-medium hover:bg-amber-50 hover:text-amber-700" onClick={() => setIsUserMenuOpen(false)}>👤 Profile Settings</Link>
                        <Link href="/orders" className="block px-4 py-2.5 text-sm font-medium hover:bg-amber-50 hover:text-amber-700" onClick={() => setIsUserMenuOpen(false)}>📋 My Orders</Link>
                        
                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">🚪 Logout</button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-amber-100 hover:text-amber-400 transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
                  >
                    <svg className="w-5 h-5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="hidden sm:inline">Login</span>
                  </Link>
                )}
              </>
            )}

            {/* Wishlist Icon */}
            <Link href="/wishlist" className="relative p-1.5 sm:p-2 text-amber-100 hover:text-amber-400 transition-colors flex items-center rounded-lg hover:bg-white/5" aria-label="Wishlist">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {totalWishlistItems > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white font-bold text-[10px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
                  {totalWishlistItems}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link href="/cart" className="relative p-1.5 sm:p-2 text-amber-100 hover:text-amber-400 transition-colors flex items-center rounded-lg hover:bg-white/5" aria-label="Cart">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H19m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalCartItems > 0 && (
                <span className="absolute top-0 right-0 bg-amber-400 text-neutral-950 font-bold text-[10px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
                  {totalCartItems}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 text-amber-100 hover:text-amber-400 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Toggle Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

          </div>
        </div>
      </div>

      {/* Sub Navbar Links & Global Shipping (Desktop) */}
      <div className="hidden md:block border-b border-amber-500/10 bg-[#05080e]">
        <div className="w-full px-4 lg:px-6 flex items-center justify-between h-12">
          
          <div className="flex items-center gap-6 lg:gap-8 overflow-x-auto scrollbar-none">
            <Link 
              href="/" 
              className={`text-sm font-medium transition-colors relative py-3 shrink-0 ${
                pathname === '/' ? 'text-amber-400 font-semibold' : 'text-amber-100/80 hover:text-amber-400'
              }`}
            >
              Home
              {pathname === '/' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-400"></span>}
            </Link>
            
            <Link 
              href="/digital-products" 
              className={`text-sm font-medium transition-colors relative py-3 shrink-0 ${
                pathname === '/digital-products' ? 'text-amber-400 font-semibold' : 'text-amber-100/80 hover:text-amber-400'
              }`}
            >
              Digital Products
              {pathname === '/digital-products' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-400"></span>}
            </Link>

            <Link 
              href="/physical-products" 
              className={`text-sm font-medium transition-colors relative py-3 shrink-0 ${
                pathname === '/physical-products' ? 'text-amber-400 font-semibold' : 'text-amber-100/80 hover:text-amber-400'
              }`}
            >
              Physical Products
              {pathname === '/physical-products' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-400"></span>}
            </Link>

            <Link 
              href="/categories" 
              className={`text-sm font-medium transition-colors relative py-3 shrink-0 ${
                pathname === '/categories' ? 'text-amber-400 font-semibold' : 'text-amber-100/80 hover:text-amber-400'
              }`}
            >
              Categories
              {pathname === '/categories' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-400"></span>}
            </Link>

            {isVendor && (
              <Link 
                href="/vendor/dashboard" 
                className={`text-sm font-medium transition-colors relative py-3 shrink-0 ${
                  pathname.startsWith('/vendor') ? 'text-amber-400 font-semibold' : 'text-amber-100/80 hover:text-amber-400'
                }`}
              >
                Vendor Dashboard
              </Link>
            )}
            
            {isAdmin && (
              <Link 
                href="/admin/dashboard" 
                className={`text-sm font-medium transition-colors relative py-3 shrink-0 ${
                  pathname.startsWith('/admin') ? 'text-amber-400 font-semibold' : 'text-amber-100/80 hover:text-amber-400'
                }`}
              >
                Admin Dashboard
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
              🌍
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-amber-200">Global Shipping</span>
              <span className="text-[10px] text-amber-400/70">Worldwide Delivery</span>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer (Fixed to display properly) */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#070b12] border-t border-amber-500/15 px-4 py-5 space-y-4 shadow-2xl z-50 max-h-[calc(100vh-70px)] overflow-y-auto">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 bg-white text-neutral-900 px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
            <button type="submit" className="px-4 py-2.5 bg-amber-400 text-neutral-950 font-semibold rounded-xl text-sm shrink-0">
              Search
            </button>
          </form>

          <div className="flex flex-col space-y-1 pt-2 border-t border-amber-500/15">
            <Link href="/" className="py-2.5 px-3 rounded-lg text-amber-100 hover:bg-white/5 hover:text-amber-400 font-medium transition-colors">Home</Link>
            <Link href="/digital-products" className="py-2.5 px-3 rounded-lg text-amber-100 hover:bg-white/5 hover:text-amber-400 font-medium transition-colors">Digital Products</Link>
            <Link href="/physical-products" className="py-2.5 px-3 rounded-lg text-amber-100 hover:bg-white/5 hover:text-amber-400 font-medium transition-colors">Physical Products</Link>
            <Link href="/categories" className="py-2.5 px-3 rounded-lg text-amber-100 hover:bg-white/5 hover:text-amber-400 font-medium transition-colors">Categories</Link>
            
            {isVendor && <Link href="/vendor/dashboard" className="py-2.5 px-3 rounded-lg text-amber-100 hover:bg-white/5 hover:text-amber-400 font-medium transition-colors">Vendor Dashboard</Link>}
            {isAdmin && <Link href="/admin/dashboard" className="py-2.5 px-3 rounded-lg text-amber-100 hover:bg-white/5 hover:text-amber-400 font-medium transition-colors">Admin Dashboard</Link>}

            <div className="pt-2 border-t border-amber-500/15 space-y-1">
              {isAuthenticated ? (
                <>
                  <Link href={getDashboardLink()} className="block py-2.5 px-3 rounded-lg text-amber-100 hover:bg-white/5 font-medium">📊 Dashboard</Link>
                  <Link href="/profile" className="block py-2.5 px-3 rounded-lg text-amber-100 hover:bg-white/5 font-medium">👤 Profile Settings</Link>
                  <Link href="/orders" className="block py-2.5 px-3 rounded-lg text-amber-100 hover:bg-white/5 font-medium">📋 My Orders</Link>
                  <button onClick={handleLogout} className="block w-full text-left py-2.5 px-3 rounded-lg text-red-400 hover:bg-red-500/10 font-medium">🚪 Logout</button>
                </>
              ) : (
                <div className="pt-2">
                  <Link href="/login" className="block text-center py-3 bg-amber-400 text-neutral-950 rounded-xl font-semibold shadow-md">Login / Register</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}