import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext'; // Cart Provider imported
import { WishlistProvider } from '@/context/WishlistContext'; // Wishlist Provider imported
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Toaster } from 'react-hot-toast';
import MaintenanceCheck from '@/components/MaintenanceCheck';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Wahisnova - Digital Marketplace',
  description: 'Buy and sell digital products and website templates',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider> {/* Wishlist Provider wrapped here */}
              <MaintenanceCheck>
                <Navbar />
                {children}
                {/* <Footer /> */}
              </MaintenanceCheck>
            </WishlistProvider>
          </CartProvider>
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}