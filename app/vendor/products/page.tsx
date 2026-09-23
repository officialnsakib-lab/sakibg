'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Package, 
  Trash2, 
  Eye, 
  Edit,
  Plus,
  Filter
} from 'lucide-react';

export default function MyProductsPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/products/my-products', {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: filter }
      });
      
      if (response.data.success) {
        setProducts(response.data.data.products);
      }
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filter]);

  // Delete product
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      const response = await axios.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        toast.success('Product deleted');
        fetchProducts();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Delete failed');
    }
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Approved</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Pending</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">Rejected</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">{status}</span>;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <p className="text-gray-600">Manage your digital products</p>
        </div>
        
        <Link
          href="/vendor/products/upload"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5" />
          Upload New
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'pending', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Thumbnail */}
              <div className="h-40 bg-gradient-to-br from-indigo-500 to-violet-600 relative">
                {product.thumbnailUrl ? (
                  <img
                    src={product.thumbnailUrl}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-12 h-12 text-white/50" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  {getStatusBadge(product.status)}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.title}
                </h3>
                <p className="text-sm text-gray-500 mb-3">{product.category}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold text-indigo-600">
                    ${product.price}
                  </span>
                  <span className="text-xs text-gray-500">
                    {product.sales} sales
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(`/digital-products/${product._id}`, '_blank')}
                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 flex items-center justify-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Found</h3>
          <p className="text-gray-600 mb-6">Upload your first product to start selling</p>
          <Link
            href="/vendor/products/upload"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
          >
            Upload Product
          </Link>
        </div>
      )}
    </div>
  );
}