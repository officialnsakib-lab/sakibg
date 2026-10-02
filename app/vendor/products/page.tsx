'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Package, 
  Box,
  Trash2, 
  Eye, 
  Edit,
  Plus
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
    if (token) {
      fetchProducts();
    }
  }, [filter, token]);

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
        toast.success('Product deleted successfully');
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
        return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Approved</span>;
      case 'pending':
        return <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">Pending</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Rejected</span>;
      default:
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-950">My Products</h1>
          <p className="text-gray-600 text-sm mt-1">Manage your uploaded digital and physical products</p>
        </div>
        
        <Link
          href="/vendor/products/upload"
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Upload New Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'pending', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              filter === status
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-500 mt-3 text-sm">Loading your products...</p>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const isPhysical = product.productType === 'physical';
            const viewUrl = isPhysical 
              ? `/products/${product._id}` 
              : `/digital-products/${product._id}`;

            return (
              <div key={product._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col justify-between transition-all hover:shadow-md">
                <div>
                  {/* Thumbnail */}
                  <div className="h-44 bg-gradient-to-br from-indigo-500 to-violet-600 relative overflow-hidden">
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
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 shadow-sm">
                      {getStatusBadge(product.status)}
                    </div>

                    {/* Type Badge */}
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white px-2.5 py-0.5 rounded-md text-xs flex items-center gap-1">
                      {isPhysical ? <Box className="w-3.5 h-3.5 text-orange-400" /> : <Package className="w-3.5 h-3.5 text-indigo-300" />}
                      <span className="capitalize">{product.productType || 'digital'}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 text-base">
                      {product.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-3 capitalize">
                      Category: <span className="font-medium text-gray-700">{product.category}</span>
                    </p>
                    
                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-100">
                      <div>
                        <span className="text-lg font-bold text-indigo-600">
                          ${product.price}
                        </span>
                        {product.salePrice && (
                          <span className="text-xs text-gray-400 line-through ml-2">
                            ${product.salePrice}
                          </span>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <span className="text-xs text-gray-500 block">
                          Sales: <strong className="text-gray-800">{product.sales || 0}</strong>
                        </span>
                        {isPhysical && (
                          <span className="text-xs text-gray-500 block">
                            Stock: <strong className={product.stockQuantity > 0 ? "text-green-600" : "text-red-600"}>{product.stockQuantity ?? 0}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions (View, Edit, Delete) */}
                <div className="p-4 pt-0 flex gap-2">
                  <button
                    onClick={() => window.open(viewUrl, '_blank')}
                    className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm hover:bg-gray-100 flex items-center justify-center gap-1.5 font-medium transition-colors border border-gray-200"
                  >
                    <Eye className="w-4 h-4 text-gray-500" />
                    View
                  </button>
                  
                  <Link
                    href={`/vendor/products/edit/${product._id}`}
                    className="flex-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm hover:bg-indigo-100 flex items-center justify-center gap-1.5 font-medium transition-colors border border-indigo-100"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Link>

                  <button
                    onClick={() => handleDelete(product._id)}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 flex items-center justify-center transition-colors border border-red-100"
                    aria-label="Delete"
                    title="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No Products Found</h3>
          <p className="text-gray-500 text-sm mb-6">You haven't uploaded any products under this filter yet.</p>
          <Link
            href="/vendor/products/upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-sm text-sm"
          >
            <Plus className="w-4 h-4" />
            Upload Your First Product
          </Link>
        </div>
      )}
    </div>
  );
}