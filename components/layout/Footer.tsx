'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Globe, 
  Mail,
  MapPin,
  Phone,
  Heart
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-white/10">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand with Larger PNG Logo */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="relative w-48 sm:w-56 h-14 sm:h-16">
                <Image 
                  src="/tt.png" 
                  alt="Wahisnova Logo" 
                  fill 
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Premium digital marketplace for buying and selling digital products, website templates, and creative assets.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/digital-products" className="text-sm text-gray-400 hover:text-white transition-colors">Digital Products</Link></li>
              <li><Link href="/website-demos" className="text-sm text-gray-400 hover:text-white transition-colors">Website Templates</Link></li>
              <li><Link href="/categories" className="text-sm text-gray-400 hover:text-white transition-colors">Categories</Link></li>
              <li><Link href="/search" className="text-sm text-gray-400 hover:text-white transition-colors">Search</Link></li>
            </ul>
          </div>

          {/* For Vendors */}
          <div>
            <h3 className="font-semibold text-white mb-4">For Vendors</h3>
            <ul className="space-y-2">
              <li><Link href="/register?vendor=true" className="text-sm text-gray-400 hover:text-white transition-colors">Become a Vendor</Link></li>
              <li><Link href="/vendor/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">Vendor Dashboard</Link></li>
              <li><Link href="/vendor/products/upload" className="text-sm text-gray-400 hover:text-white transition-colors">Upload Product</Link></li>
              <li><Link href="/vendor/earnings" className="text-sm text-gray-400 hover:text-white transition-colors">Earnings</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="w-4 h-4 flex-shrink-0" />
                support@wahisnova.com
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="w-4 h-4 flex-shrink-0" />
                +880 1577-394019
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                Khulna, Bangladesh
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Wahisnova. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            Design & Developed with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> by <span className="text-white font-medium">Nazmus Sakib</span>
          </p>
        </div>
      </div>
    </footer>
  );
}