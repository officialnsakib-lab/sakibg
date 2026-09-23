'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Settings,
  Users,
  Search,
  Ban,
  CheckCircle,
  Eye,
  Mail,
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Shield,
  User,
  Activity,
  Trash2,
  Key,
  Globe,
  Bell,
  Lock
} from 'lucide-react';

interface Customer {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  isActive: boolean;
  isBanned: boolean;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  lastLogin: string;
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'customers' | 'settings'>('customers');
  
  // Customers state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Settings state
  const [siteName, setSiteName] = useState('Wahisnova');
  const [siteDescription, setSiteDescription] = useState('Digital Marketplace');
  const [supportEmail, setSupportEmail] = useState('support@wahisnova.com');
  const [defaultCommission, setDefaultCommission] = useState(10);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [saving, setSaving] = useState(false);




        // Fetch settings on mount
        useEffect(() => {
        const fetchSettings = async () => {
            try {
            const response = await axios.get('/api/admin/settings');
            if (response.data.success) {
                const s = response.data.data.settings;
                setSiteName(s.siteName);
                setSiteDescription(s.siteDescription);
                setSupportEmail(s.supportEmail);
                setDefaultCommission(s.defaultCommission);
                setAllowRegistration(s.allowRegistration);
                setMaintenanceMode(s.maintenanceMode);
            }
            } catch (error) {
            console.error('Settings fetch error:', error);
            }
        };
        
        fetchSettings();
        }, []);


  // ============ FETCH CUSTOMERS ============
  const fetchCustomers = useCallback(async () => {
    setLoadingCustomers(true);
    try {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      
      const response = await axios.get('/api/admin/customers', { params });
      
      if (response.data.success) {
        setCustomers(response.data.data.customers);
        setTotal(response.data.data.pagination.total);
        setTotalPages(response.data.data.pagination.totalPages);
      }
    } catch (error: any) {
      console.error('Customers error:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoadingCustomers(false);
    }
  }, [search, page]);

  useEffect(() => {
    if (activeTab === 'customers') {
      fetchCustomers();
    }
  }, [activeTab, fetchCustomers]);

  // ============ HANDLERS ============
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleBanCustomer = async (customerId: string) => {
    setProcessingId(customerId);
    try {
      const response = await axios.put('/api/admin/customer-action', {
        customerId,
        action: 'ban'
      });
      
      if (response.data.success) {
        toast.success('Customer banned');
        fetchCustomers();
      }
    } catch (error: any) {
      toast.error('Failed to ban');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUnbanCustomer = async (customerId: string) => {
    setProcessingId(customerId);
    try {
      const response = await axios.put('/api/admin/customer-action', {
        customerId,
        action: 'unban'
      });
      
      if (response.data.success) {
        toast.success('Customer unbanned');
        fetchCustomers();
      }
    } catch (error: any) {
      toast.error('Failed to unban');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    
    setProcessingId(customerId);
    try {
      const response = await axios.delete(`/api/admin/customers/${customerId}`);
      
      if (response.data.success) {
        toast.success('Customer deleted');
        fetchCustomers();
      }
    } catch (error: any) {
      toast.error('Failed to delete');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const response = await axios.put('/api/admin/settings', {
        siteName,
        siteDescription,
        supportEmail,
        defaultCommission,
        allowRegistration,
        maintenanceMode
      });
      
      if (response.data.success) {
        toast.success('Settings saved');
      }
    } catch (error: any) {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // ============ HELPERS ============
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings & Users</h1>
        <p className="text-gray-500 mt-1">Manage customers and site settings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
            activeTab === 'customers'
              ? 'bg-red-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Customers
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
            activeTab === 'settings'
              ? 'bg-red-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          Site Settings
        </button>
      </div>

      {/* ============ CUSTOMERS TAB ============ */}
      {activeTab === 'customers' && (
        <>
          {/* Search */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
              >
                Search
              </button>
            </form>
          </div>

          {/* Customers Table */}
          {loadingCustomers ? (
            <div className="text-center py-20 bg-white rounded-xl">
              <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto" />
            </div>
          ) : customers.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs font-semibold text-gray-500 uppercase">
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Orders</th>
                    <th className="px-5 py-3">Total Spent</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Joined</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <tr key={customer._id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                            {customer.name?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{customer.name}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {customer.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600">
                        {customer.totalOrders || 0}
                      </td>
                      <td className="px-5 py-3 text-sm font-semibold text-gray-900">
                        ${customer.totalSpent || 0}
                      </td>
                      <td className="px-5 py-3">
                        {customer.isBanned ? (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                            Banned
                          </span>
                        ) : customer.isActive ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600">
                        {formatDate(customer.createdAt)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
                          {customer.isBanned ? (
                            <button
                              onClick={() => handleUnbanCustomer(customer._id)}
                              disabled={processingId === customer._id}
                              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                              title="Unban"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBanCustomer(customer._id)}
                              disabled={processingId === customer._id}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                              title="Ban"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteCustomer(customer._id)}
                            disabled={processingId === customer._id}
                            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">No Customers Found</h3>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    page === i + 1
                      ? 'bg-red-600 text-white'
                      : 'border border-gray-300 text-gray-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* ============ SETTINGS TAB ============ */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Site Settings</h3>
          
          {/* Site Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Site Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
            <textarea
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Support Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Default Commission */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Commission Rate (%)
            </label>
            <input
              type="number"
              value={defaultCommission}
              onChange={(e) => setDefaultCommission(parseFloat(e.target.value))}
              min="0"
              max="100"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
              <span className="text-sm font-medium text-gray-700">Allow Registration</span>
              <input
                type="checkbox"
                checked={allowRegistration}
                onChange={(e) => setAllowRegistration(e.target.checked)}
                className="w-5 h-5 text-red-600"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
              <span className="text-sm font-medium text-gray-700">Maintenance Mode</span>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-5 h-5 text-red-600"
              />
            </label>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      )}
    </div>
  );
}