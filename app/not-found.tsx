import Link from 'next/link';
import { Home, Search, Package, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-4">
      <div className="text-center text-white">
        {/* Big 404 */}
        <div className="relative">
          <h1 className="text-[150px] sm:text-[200px] font-extrabold leading-none opacity-20 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="w-24 h-24 sm:w-32 sm:h-32 text-white/80" />
          </div>
        </div>

        {/* Message */}
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Page Not Found
        </h2>
        <p className="text-lg text-white/80 mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
          <Link
            href="/digital-products"
            className="px-6 py-3 bg-indigo-500/30 border-2 border-white/30 text-white rounded-lg font-semibold hover:bg-indigo-500/50 transition-colors flex items-center justify-center gap-2"
          >
            <Package className="w-5 h-5" />
            Browse Products
          </Link>
          <Link
            href="/search"
            className="px-6 py-3 bg-indigo-500/30 border-2 border-white/30 text-white rounded-lg font-semibold hover:bg-indigo-500/50 transition-colors flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            Search
          </Link>
        </div>

        {/* Help */}
        <p className="mt-8 text-sm text-white/60">
          If you think this is a mistake, please{' '}
          <Link href="/contact" className="underline hover:text-white">
            contact support
          </Link>
        </p>
      </div>
    </div>
  );
}