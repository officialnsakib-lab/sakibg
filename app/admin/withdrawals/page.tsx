'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Loader2,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
  X,
  Smartphone,
  Landmark,
  User,
  Mail,
  Calendar,
  Filter,
  Download,
  TrendingUp,
  Wallet,
  AlertTriangle
} from 'lucide-react';

interface Withdrawal {
  _id: string;
  withdrawalId: string;
  amount: number;
  method: string;
  accountNumber: string;
  accountHolderName: string;
  status: string;
  rejectionReason: string;
  transactionId: string;
  processedAt: string;
  createdAt: string;
  vendorId: {
    _id: string;
    name: string;
    email: string;
    totalEarnings: number;
    withdrawnEarnings: number;
    pendingEarnings: number;
  };
}

export default function AdminWithdrawalsPage() {
  // ============ STATE ============
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Filter state
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'processing' | 'completed' | 'rejected'>('all');
  const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days' | 'all'>('30days');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  
  // Stats
  const [stats, setStats] = useState({
    totalWithdrawals: 0,
    pendingWithdrawals: 0,
    completedWithdrawals: 0,
    totalWithdrawn: 0,
    pendingAmount: 0
  });
  
  // Modal state
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // ============ FETCH DATA ============
  const fetchWithdrawals = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: 10,
        status: filterStatus,
        dateRange,
      };
      
      if (search) params.search = search;
      
      const response = await axios.get('/api/admin/withdrawals', { params });
      
      if (response.data.success) {
        setWithdrawals(response.data.data.withdrawals);
        setTotal(response.data.data.pagination.total);
        setTotalPages(response.data.data.pagination.totalPages);
        setStats(response.data.data.stats);
      }
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error('Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, dateRange, search, page]);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  // ============ HANDLERS ============
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleApprove = async (withdrawalId: string) => {
    setProcessingId(withdrawalId);
    try {
      const response = await axios.put('/api/admin/process-withdrawal', {
        withdrawalId,
        action: 'approve',
        transactionId: transactionId.trim() || undefined
      });
      
      if (response.data.success) {
        toast.success('Withdrawal approved and processed!');
        setShowModal(false);
        setShowRejectModal(false);
        setSelectedWithdrawal(null);
        setTransactionId('');
        fetchWithdrawals();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to approve');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedWithdrawal || !rejectReason.trim()) {
      toast.error('Rejection reason required');
      return;
    }
    
    setProcessingId(selectedWithdrawal._id);
    try {
      const response = await axios.put('/api/admin/process-withdrawal', {
        withdrawalId: selectedWithdrawal._id,
        action: 'reject',
        rejectionReason: rejectReason.trim()
      });
      
      if (response.data.success) {
        toast.success('Withdrawal rejected');
        setShowModal(false);
        setShowRejectModal(false);
        setSelectedWithdrawal(null);
        setRejectReason('');
        fetchWithdrawals();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reject');
    } finally {
      setProcessingId(null);
    }
  };

  // ============ HELPERS ============
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Completed</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Pending</span>;
      case 'processing':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Processing</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">Rejected</span>;
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Withdrawal Management</h1>

      {/* ============ STATS ============ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <Download className="w-6 h-6 text-indigo-600 mb-2" />
          <p className="text-xl font-bold text-gray-900">{stats.totalWithdrawals}</p>
          <p className="text-xs text-gray-500">Total Requests</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <Clock className="w-6 h-6 text-yellow-600 mb-2" />
          <p className="text-xl font-bold text-gray-900">{stats.pendingWithdrawals}</p>
          <p className="text-xs text-gray-500">Pending</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
          <p className="text-xl font-bold text-gray-900">{stats.completedWithdrawals}</p>
          <p className="text-xs text-gray-500">Completed</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <DollarSign className="w-6 h-6 text-blue-600 mb-2" />
          <p className="text-xl font-bold text-gray-900">${stats.totalWithdrawn}</p>
          <p className="text-xs text-gray-500">Total Withdrawn</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <TrendingUp className="w-6 h-6 text-purple-600 mb-2" />
          <p className="text-xl font-bold text-gray-900">${stats.pendingAmount}</p>
          <p className="text-xs text-gray-500">Pending Amount</p>
        </div>
      </div>

      {/* ============ FILTERS ============ */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by ID, vendor, account..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <button type="submit" className="px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm">
              Search
            </button>
          </form>

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
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateRange}
            onChange={(e) => {
              setDateRange(e.target.value as any);
              setPage(1);
            }}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* ============ WITHDRAWALS TABLE ============ */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-xl">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto" />
        </div>
      ) : withdrawals.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase">
                  <th className="px-5 py-3">Vendor</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Method</th>
                  <th className="px-5 py-3">Account</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal._id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {withdrawal.vendorId?.name?.charAt(0) || 'V'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{withdrawal.vendorId?.name}</p>
                          <p className="text-xs text-gray-500">{withdrawal.vendorId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-lg font-bold text-gray-900">${withdrawal.amount}</p>
                      <p className="text-xs text-gray-500 font-mono">{withdrawal.withdrawalId}</p>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {getMethodIcon(withdrawal.method)}
                        <span className="text-sm font-medium uppercase">{withdrawal.method}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm text-gray-900">{withdrawal.accountNumber}</p>
                      <p className="text-xs text-gray-500">{withdrawal.accountHolderName}</p>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">
                      {formatDate(withdrawal.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      {getStatusBadge(withdrawal.status)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedWithdrawal(withdrawal);
                            setShowModal(true);
                          }}
                          className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {withdrawal.status === 'pending' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedWithdrawal(withdrawal);
                                setShowModal(true);
                              }}
                              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedWithdrawal(withdrawal);
                                setShowRejectModal(true);
                              }}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl">
          <Download className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900">No Withdrawal Requests</h3>
        </div>
      )}

      {/* ============ PAGINATION ============ */}
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

      {/* ============ APPROVE MODAL ============ */}
      {showModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Process Withdrawal</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Amount</span>
                  <span className="font-bold text-gray-900">${selectedWithdrawal.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Method</span>
                  <span className="font-medium uppercase">{selectedWithdrawal.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Account</span>
                  <span className="font-medium">{selectedWithdrawal.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Holder</span>
                  <span className="font-medium">{selectedWithdrawal.accountHolderName}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction ID (optional)
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  placeholder="Your reference transaction ID"
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApprove(selectedWithdrawal._id)}
                disabled={processingId === selectedWithdrawal._id}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-semibold"
              >
                {processingId === selectedWithdrawal._id ? 'Processing...' : 'Approve & Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ REJECT MODAL ============ */}
      {showRejectModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Reject Withdrawal</h3>
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason *
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              placeholder="Why are you rejecting this withdrawal?"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processingId === selectedWithdrawal._id}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}