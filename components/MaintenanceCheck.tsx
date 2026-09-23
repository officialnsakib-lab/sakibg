'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

export default function MaintenanceCheck({ children }: { children: React.ReactNode }) {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isAdmin, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const response = await axios.get('/api/settings/public');
        if (response.data.success) {
          setMaintenanceMode(response.data.data.settings.maintenanceMode);
        }
      } catch (error) {
        console.error('Maintenance check error:', error);
        setMaintenanceMode(false);
      } finally {
        setLoading(false);
      }
    };

    checkMaintenance();
  }, []);

  useEffect(() => {
    // Skip check for these pages
    const skipPages = ['/maintenance', '/login', '/register', '/admin'];
    const shouldSkip = skipPages.some(page => pathname.startsWith(page));
    
    if (!loading && maintenanceMode && !shouldSkip && !isAdmin) {
      router.push('/maintenance');
    }
  }, [loading, maintenanceMode, pathname, isAdmin, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}