'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  Loader2,
  Download,
  CheckCircle,
  FileText,
  Shield,
  Clock,
  AlertTriangle,
  Package
} from 'lucide-react';

interface DownloadInfo {
  orderId: string;
  productTitle: string;
  downloadCount: number;
  downloadExpiry: string;
  fileUrl: string;
  fileSize: string;
}

export default function DownloadPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [downloadInfo, setDownloadInfo] = useState<DownloadInfo | null>(null);

  const token = params.token as string;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // Fetch download info
    const fetchDownloadInfo = async () => {
      try {
        const response = await axios.get(`/api/download/${token}`);
        
        if (response.data.success) {
          setDownloadInfo(response.data.data);
        }
      } catch (error: any) {
        setError(error.response?.data?.error || 'Download link invalid');
      } finally {
        setLoading(false);
      }
    };

    fetchDownloadInfo();
  }, [token, isAuthenticated, router]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Direct download link
      window.location.href = `/api/download/${token}`;
      toast.success('Download started!');
      
      // Wait a bit then show success
      setTimeout(() => {
        setDownloading(false);
      }, 3000);
    } catch (error) {
      toast.error('Download failed');
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-12 rounded-xl shadow-lg max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Download Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/orders" className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold">
            Go to My Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-lg">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="w-10 h-10 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Download Your Purchase</h1>
            <p className="text-gray-600 mt-2">{downloadInfo?.productTitle}</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">File Size</p>
                <p className="font-medium text-gray-900">{downloadInfo?.fileSize || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Shield className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-xs text-gray-500">Security</p>
                <p className="font-medium text-gray-900">Verified & Secure Download</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-xs text-gray-500">Download Expiry</p>
                <p className="font-medium text-gray-900">
                  {new Date(downloadInfo?.downloadExpiry || '').toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className={`w-full px-6 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors ${
              downloading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {downloading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Downloading...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                Download Now
              </span>
            )}
          </button>

          <div className="mt-4 text-center">
            <Link href="/orders" className="text-sm text-gray-500 hover:text-indigo-600">
              View All Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}