'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';

type UserRole = 'admin' | 'vendor' | 'customer';
type VendorType = 'digital_products' | 'website_demo' | 'both';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  vendorType?: VendorType;
  isApprovedVendor: boolean;
  isBanned: boolean;
  isActive: boolean;
  commissionRate: number;
  totalSales: number;
  totalEarnings: number;
  pendingEarnings: number;
  withdrawnEarnings: number;
  pendingIncome: number;
  pendingWithdrawal: number;
  totalProducts: number;
  totalWebsiteDemos: number;
  activeProducts: number;
  activeWebsiteDemos: number;
  pendingProducts: number;
  pendingWebsiteDemos: number;
  averageRating?: number;
  totalReviews?: number;
  avatar?: string;
  bio?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  isEmailVerified: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isVendor: boolean;
  isCustomer: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  vendorType?: VendorType;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const tokenCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('wahisnova_token='));
        
        if (tokenCookie) {
          setToken(tokenCookie.split('=')[1]);
        }
        
        const userCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('wahisnova_user='));
        
        if (userCookie) {
          try {
            const userData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
            setUser(userData);
            await refreshUser();
          } catch (e) {
            // Invalid user cookie
          }
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await axios.get('/api/auth/me');
      
      if (response.data.success) {
        const userData = response.data.data.user;
        
        if (userData.isBanned || userData.isActive === false) {
          setUser(null);
          setToken(null);
          document.cookie = 'wahisnova_token=; Max-Age=0; path=/';
          document.cookie = 'wahisnova_user=; Max-Age=0; path=/';
          router.push('/login?banned=true');
          return;
        }
        
        setUser(userData);
      } else {
        setUser(null);
        setToken(null);
      }
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        setUser(null);
        setToken(null);
      }
    }
  }, [router]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', {
        email: email.toLowerCase().trim(),
        password
      });

      if (response.data.success) {
        setUser(response.data.data.user);
        
        if (response.data.data.user.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (response.data.data.user.role === 'vendor') {
          router.push('/vendor/dashboard');
        } else {
          router.push('/');
        }
        
        toast.success('Login successful!');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  }, [router]);

const register = useCallback(async (data: RegisterData) => {
  try {
    const response = await axios.post('/api/auth/register', {
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      password: data.password,
      role: data.role,
      vendorType: data.vendorType
    });

    if (response.data.success) {
      // Don't auto-login, redirect to OTP page
      if (response.data.data.requiresVerification) {
        toast.success('Verification code sent!');
        router.push(`/verify-otp?email=${encodeURIComponent(response.data.data.email)}`);
        return;
      }
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Registration failed');
  }
}, [router]);

  const logout = useCallback(async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    setUser(null);
    setToken(null);
    document.cookie = 'wahisnova_token=; Max-Age=0; path=/';
    document.cookie = 'wahisnova_user=; Max-Age=0; path=/';
    router.push('/login');
    toast.success('Logged out successfully');
  }, [router]);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isVendor = user?.role === 'vendor';
  const isCustomer = user?.role === 'customer';

  const value: AuthContextType = {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    isVendor,
    isCustomer,
    login,
    register,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}