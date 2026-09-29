import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Toaster } from 'react-hot-toast';
import MaintenanceCheck from '@/components/MaintenanceCheck';
import MobilePopup from '@/components/MobilePopup'; // মোবাইল পপআপ কম্পোনেন্ট ইমপোর্ট করা হলো

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Wahisnova - Digital Marketplace', 
  description: 'Buy and sell digital products and website templates',
  icons: {
    icon: [
      { url: '/favicon.png?v=1', type: 'image/png' },
    ],
    shortcut: ['/favicon.png?v=1'],
    apple: [
      { url: '/favicon.png?v=1' },
    ],
  },
};

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
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <CurrencyProvider>
                <MaintenanceCheck>
                  <Navbar />
                  {children}
                  {/* <Footer /> */}
                  
                  {/* মোবাইল অ্যাপ ডাউনলোডের পপআপ (কম্পিউটারে দেখাবে না) */}
                  <MobilePopup />
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