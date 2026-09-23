'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { 
  DollarSign,
  TrendingUp,
  Wallet,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Package,
  ShoppingCart,
  X,
  Smartphone,
  Landmark,
  User,
  Search,
  Filter,
  FileText
} from 'lucide-react';

interface EarningTransaction {
  _id: string;
  orderId: string;
  productTitle: string;
  price: number;
  commissionAmount: number;
  vendorAmount: number;
  paymentStatus: string;
  createdAt: string;
}

interface Withdrawal {
  _id: string;
  withdrawalId: string;
  amount: number;
  method: string;
  accountNumber: string;
  accountHolderName: string;
  status: string;
  rejectionReason: string;
  createdAt: string;
}

export default function VendorEarningsPage() {
  const { user } = useAuth();
  
  // ============ STATE ============
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<EarningTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  
  // Summary state
  const [summary, setSummary] = useState({
    totalEarnings: 0,
    pendingIncome: 0,        // ✅ Add
    pendingWithdrawal: 0,    // ✅ Add
    withdrawnEarnings: 0,
    availableBalance: 0,
    totalOrders: 0,
    totalSales: 0
  });
  
  // Filter state
  const [activeTab, setActiveTab] = useState<'earnings' | 'withdrawals'>('earnings');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('all');
const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days' | 'year' | 'all' | 'custom'>('30days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  
  // Withdrawal modal
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'bkash' | 'nagad' | 'bank'>('bkash');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [processingWithdrawal, setProcessingWithdrawal] = useState(false);
  const [withdrawErrors, setWithdrawErrors] = useState<{[key: string]: string}>({});

  // ============ FETCH DATA ============
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: 10,
        status: filterStatus,
        sort: sortOrder,
        dateRange: dateRange,
      };
      
      if (search) params.search = search;
      if (dateRange === 'custom') {
        params.startDate = customStartDate;
        params.endDate = customEndDate;
      }
      
      const [earningsResponse, withdrawalsResponse] = await Promise.all([
        axios.get('/api/orders/vendor-orders', { params }),
        axios.get('/api/withdrawal/history', { params: { page: 1, limit: 10 } })
      ]);
      
      if (earningsResponse.data.success) {
        const orders = earningsResponse.data.data.orders;
        setTransactions(orders);
        setTotalPages(earningsResponse.data.data.pagination.totalPages);
        setTotalTransactions(earningsResponse.data.data.pagination.total);
        
        // Calculate summary
        const paidOrders = orders.filter((o: any) => o.paymentStatus === 'paid');
        const pendingOrders = orders.filter((o: any) => o.paymentStatus === 'pending');
        
        const totalEarned = paidOrders.reduce((sum: number, o: any) => sum + o.vendorAmount, 0);
        const pendingEarned = pendingOrders.reduce((sum: number, o: any) => sum + o.vendorAmount, 0);
        
// Summary calculation change করুন

        const availableBalance = (user?.totalEarnings || 0) - (user?.pendingWithdrawal || 0);

        setSummary({
          totalEarnings: user?.totalEarnings || 0,
          pendingIncome: user?.pendingIncome || 0,
          pendingWithdrawal: user?.pendingWithdrawal || 0,
          withdrawnEarnings: user?.withdrawnEarnings || 0,
          availableBalance: Math.max(0, 
            (user?.totalEarnings || 0) - 
            (user?.withdrawnEarnings || 0) - 
            (user?.pendingWithdrawal || 0)
          ),
          totalOrders: orders.length,
          totalSales: paidOrders.length
        });


      }
      
      if (withdrawalsResponse.data.success) {
        setWithdrawals(withdrawalsResponse.data.data.withdrawals);
      }
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus, dateRange, customStartDate, customEndDate, search, sortOrder, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ============ HANDLERS ============
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleWithdrawSubmit = async () => {
    // Validation
    const newErrors: {[key: string]: string} = {};
    
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      newErrors.amount = 'Enter valid amount';
    } else if (parseFloat(withdrawAmount) < 10) {
      newErrors.amount = 'Minimum withdrawal is $10';
    } else if (parseFloat(withdrawAmount) > summary.availableBalance) {
      newErrors.amount = 'Insufficient balance';
    }
    
    if (!accountNumber || accountNumber.length < 6) {
      newErrors.accountNumber = 'Enter valid account number';
    }
    
    if (!accountHolderName) {
      newErrors.accountHolderName = 'Account holder name required';
    }
    
    setWithdrawErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    
    setProcessingWithdrawal(true);
    try {
      const response = await axios.post('/api/withdrawal/create', {
        amount: parseFloat(withdrawAmount),
        method: withdrawMethod,
        accountNumber,
        accountHolderName
      });
      
      if (response.data.success) {
        toast.success('Withdrawal request submitted!');
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        setAccountNumber('');
        setAccountHolderName('');
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit');
    } finally {
      setProcessingWithdrawal(false);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Completed</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Pending</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">Rejected</span>;
      case 'processing':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Processing</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">{status}</span>;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'bkash':
        return <Smartphone className="w-5 h-5 text-pink-600" />;
      case 'nagad':
        return <Smartphone className="w-5 h-5 text-orange-600" />;
      case 'bank':
        return <Landmark className="w-5 h-5 text-blue-600" />;
      default:
        return <Wallet className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Earnings & Withdrawals</h1>

      {/* ============ SUMMARY CARDS ============ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <Wallet className="w-8 h-8 opacity-80" />
            <span className="text-xs bg-white/20 px-2 py-1 rounded">Available</span>
          </div>
          <p className="text-3xl font-bold">${summary.availableBalance.toFixed(2)}</p>
          <p className="text-sm opacity-80 mt-1">Available Balance</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs text-gray-400">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">${summary.totalEarnings.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">Total Earned</p>
        </div>
        {/* Pending Income Card */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-xs text-gray-400">Pending Orders</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">${summary.pendingIncome.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">Awaiting Verification</p>
        </div>
        {/* Pending Withdrawal Card */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
            <Download className="w-5 h-5 text-orange-600" />
          </div>
          <span className="text-xs text-gray-400">Withdrawal</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">${summary.pendingWithdrawal.toFixed(2)}</p>
        <p className="text-sm text-gray-500 mt-1">Pending Withdrawal</p>
      </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs text-gray-400">Withdrawn</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">${summary.withdrawnEarnings.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">Already Withdrawn</p>
        </div>
      </div>

      {/* ============ TABS ============ */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('earnings')}
          className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
            activeTab === 'earnings'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Earnings History
        </button>
        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
            activeTab === 'withdrawals'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Withdrawal Requests
        </button>
        
        <button
          onClick={() => setShowWithdrawModal(true)}
          className="ml-auto px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Withdraw
        </button>
      </div>

      {/* ============ FILTERS ============ */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search transactions..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <button type="submit" className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm">
              Search
            </button>
          </form>

          {/* Date Range */}
          <div className="flex gap-1">
            {[
              { value: '7days', label: '7D' },
              { value: '30days', label: '30D' },
              { value: '90days', label: '90D' },
              { value: 'year', label: 'Year' },
              { value: 'all', label: 'All' },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  setDateRange(item.value as any);
                  setPage(1);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  dateRange === item.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Custom Date */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => {
                setCustomStartDate(e.target.value);
                setDateRange('custom');
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => {
                setCustomEndDate(e.target.value);
                setDateRange('custom');
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as any);
              setPage(1);
            }}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Status</option>
            <option value="paid">Completed</option>
            <option value="pending">Pending</option>
          </select>

          {/* Sort */}
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value as any);
              setPage(1);
            }}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="highest">Highest Amount</option>
            <option value="lowest">Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* ============ CONTENT ============ */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-xl">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
        </div>
      ) : activeTab === 'earnings' ? (
        transactions.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase">
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Commission</th>
                  <th className="px-5 py-3">Earned</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">{transaction.productTitle}</p>
                      <p className="text-xs text-gray-500 font-mono">{transaction.orderId}</p>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-gray-900">
                      ${transaction.price}
                    </td>
                    <td className="px-5 py-3 text-sm text-red-600">
                      -${transaction.commissionAmount}
                    </td>
                    <td className="px-5 py-3 text-sm font-bold text-green-600">
                      ${transaction.vendorAmount}
                    </td>
                    <td className="px-5 py-3">
                      {getStatusBadge(transaction.paymentStatus)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900">No Earnings Found</h3>
          </div>
        )
      ) : withdrawals.length > 0 ? (
        <div className="space-y-4">
          {withdrawals.map((withdrawal) => (
            <div key={withdrawal._id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex items-center gap-3">
                  {getMethodIcon(withdrawal.method)}
                  <div>
                    <p className="font-medium text-gray-900 uppercase">{withdrawal.method}</p>
                    <p className="text-xs text-gray-500 font-mono">{withdrawal.withdrawalId}</p>
                    <p className="text-xs text-gray-400">{formatDate(withdrawal.createdAt)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">${withdrawal.amount}</p>
                  <p className="text-xs text-gray-500">
                    {withdrawal.accountNumber} • {withdrawal.accountHolderName}
                  </p>
                </div>
                <div>
                  {getStatusBadge(withdrawal.status)}
                  {withdrawal.rejectionReason && (
                    <p className="text-xs text-red-500 mt-1">{withdrawal.rejectionReason}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl">
          <Download className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900">No Withdrawal Requests</h3>
        </div>
      )}

      {/* ============ WITHDRAWAL MODAL ============ */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Withdraw Funds</h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Available Balance */}
              <div className="bg-indigo-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Available Balance</p>
                <p className="text-2xl font-bold text-indigo-600">
                  ${summary.availableBalance.toFixed(2)}
                </p>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount *
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  min="10"
                  max={summary.availableBalance}
                  className={`w-full px-4 py-2.5 border rounded-lg ${
                    withdrawErrors.amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter amount"
                />
                {withdrawErrors.amount && (
                  <p className="text-xs text-red-500 mt-1">{withdrawErrors.amount}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">Minimum: $10</p>
              </div>

              {/* Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['bkash', 'nagad', 'bank'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setWithdrawMethod(method as any)}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        withdrawMethod === method
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {getMethodIcon(method)}
                      <p className="text-xs font-semibold mt-1 uppercase">{method}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number *
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg ${
                    withdrawErrors.accountNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={withdrawMethod === 'bank' ? 'Account number' : '01XXXXXXXXX'}
                />
                {withdrawErrors.accountNumber && (
                  <p className="text-xs text-red-500 mt-1">{withdrawErrors.accountNumber}</p>
                )}
              </div>

              {/* Account Holder Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg ${
                    withdrawErrors.accountHolderName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Full name"
                />
                {withdrawErrors.accountHolderName && (
                  <p className="text-xs text-red-500 mt-1">{withdrawErrors.accountHolderName}</p>
                )}
              </div>

              {/* Info Note */}
              <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-700">
                  Admin will verify and process your withdrawal within 24-48 hours.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdrawSubmit}
                disabled={processingWithdrawal}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold disabled:opacity-50"
              >
                {processingWithdrawal ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}