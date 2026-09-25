import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext'; // Cart Provider imported
import { WishlistProvider } from '@/context/WishlistContext'; // Wishlist Provider imported
import { CurrencyProvider } from '@/context/CurrencyContext'; // Currency Provider imported
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Toaster } from 'react-hot-toast';
import MaintenanceCheck from '@/components/MaintenanceCheck';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Wahisnova - Digital Marketplace',
  description: 'Buy and sell digital products and website templates',
};

// Next.js App Router-এ ভিউপোর্ট আলাদাভাবে এক্সপোর্ট করতে হয়
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* অতিরিক্ত নিরাপত্তার জন্য ভিউপোর্ট মেটা ট্যাগ */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <CurrencyProvider> {/* Currency Provider wrapped here */}
                <MaintenanceCheck>
                  <Navbar />
                  {children}
                  {/* <Footer /> */}
                </MaintenanceCheck>
              </CurrencyProvider>
            </WishlistProvider>
          </CartProvider>
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}