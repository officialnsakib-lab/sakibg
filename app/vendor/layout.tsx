'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  Upload, 
  ShoppingCart, 
  DollarSign, 
  Settings, 
  LogOut,
  Menu,
  X,
  Globe,
  Download
} from 'lucide-react';
import { toast } from 'react-hot-toast/headless';

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isVendor, logout, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checking, setChecking] = useState(true);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      if (!loading) {
        if (!isAuthenticated) {
          router.push('/login?redirect=/vendor/dashboard');
        } else if (!isVendor) {
          router.push('/');
        } else {
          setChecking(false);
        }
      }
    };
    
    checkAuth();
  }, [loading, isAuthenticated, isVendor, router]);
    useEffect(() => {
      // Check if user is banned
      if (user?.isBanned) {
        toast.error('Your account has been banned');
        logout();
        router.push('/login?banned=true');
      }
    }, [user]);
  // Loading state
  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Checking access...</p>
        </div>
      </div>
    );
  }

  // Access denied
  if (!isAuthenticated || !isVendor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-12 rounded-xl shadow-lg max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You need vendor access to view this page.
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const menuItems = [
    { href: '/vendor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/vendor/products', label: 'My Products', icon: Package },
    { href: '/vendor/products/upload', label: 'Upload Product', icon: Upload },
    { href: '/vendor/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/vendor/earnings', label: 'Earnings', icon: DollarSign },
    { href: '/vendor/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and menu button */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center text-white font-bold">
                  W
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  Vendor Panel
                </span>
              </Link>
            </div>

            {/* User info */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">Vendor</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)]
        `}>
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-indigo-50 text-indigo-600 font-medium' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <button
                onClick={logout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}