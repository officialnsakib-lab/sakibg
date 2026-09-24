'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import axios from 'axios';

type UserRole = 'customer' | 'vendor';
type VendorType = 'digital_products' | 'physical_products' | 'both';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [vendorType, setVendorType] = useState<VendorType>('digital_products');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  
  // Double request prevention
  const isSubmitting = useRef(false);
  
  // Check if vendor registration
  useEffect(() => {
    const isVendor = searchParams.get('vendor');
    if (isVendor === 'true') {
      setRole('vendor');
    }
  }, [searchParams]);
  
  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  // Password strength calculator
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthLabel = (strength: number): string => {
    if (strength <= 1) return 'Weak';
    if (strength <= 2) return 'Fair';
    if (strength <= 3) return 'Good';
    if (strength <= 4) return 'Strong';
    return 'Very Strong';
  };

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength <= 1) return 'bg-red-500';
    if (strength <= 2) return 'bg-orange-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-amber-500';
    return 'bg-amber-600';
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    
    if (!name) {
      newErrors.name = 'Name is required';
    } else if (name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting.current || loading) return;
    if (!validateForm()) return;
    
    isSubmitting.current = true;
    setLoading(true);
    
    try {
      const response = await axios.post('/api/auth/register', {
        name,
        email,
        password,
        role,
        vendorType: role === 'vendor' ? vendorType : undefined
      });
      
      if (response.data.success) {
        toast.success('Verification code sent to your email!');
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      isSubmitting.current = false;
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl text-slate-100">
        {/* Header */}
        <div>
          <h2 className="text-center text-3xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500">
            WAHISNOVA IMEX
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            {role === 'vendor' ? 'Register as a Vendor' : 'Create Your Account'}
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`p-4 rounded-xl border-2 text-center transition-all ${
              role === 'customer'
                ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="text-2xl mb-1">🛒</div>
            <div className="font-semibold text-sm">Customer</div>
            <div className="text-xs text-slate-500">Buy products</div>
          </button>
          
          <button
            type="button"
            onClick={() => setRole('vendor')}
            className={`p-4 rounded-xl border-2 text-center transition-all ${
              role === 'vendor'
                ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="text-2xl mb-1">💼</div>
            <div className="font-semibold text-sm">Vendor</div>
            <div className="text-xs text-slate-500">Sell products</div>
          </button>
        </div>

        {/* Vendor Type Selection */}
        {role === 'vendor' && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              What do you want to sell?
            </label>
            <select
              value={vendorType}
              onChange={(e) => setVendorType(e.target.value as VendorType)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-200"
            >
              <option value="digital_products">Digital Products</option>
              <option value="physical_products">Physical Products</option>
              <option value="both">Both (Digital & Physical)</option>
            </select>
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleRegister} noValidate>
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                className={`mt-1 block w-full px-3 py-2 bg-slate-950 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-200 ${
                  errors.name ? 'border-red-500' : 'border-slate-700'
                }`}
                placeholder="John Doe"
                disabled={loading}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                className={`mt-1 block w-full px-3 py-2 bg-slate-950 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-200 ${
                  errors.email ? 'border-red-500' : 'border-slate-700'
                }`}
                placeholder="you@example.com"
                disabled={loading}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => {
                    const newPassword = e.target.value;
                    setPassword(newPassword);
                    setPasswordStrength(calculatePasswordStrength(newPassword));
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  className={`block w-full px-3 py-2 bg-slate-950 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-200 ${
                    errors.password ? 'border-red-500' : 'border-slate-700'
                  }`}
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-slate-400 hover:text-amber-400"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded ${
                          level <= passwordStrength
                            ? getPasswordStrengthColor(passwordStrength)
                            : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Password strength: {getPasswordStrengthLabel(passwordStrength)}
                  </p>
                </div>
              )}
              
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                }}
                className={`mt-1 block w-full px-3 py-2 bg-slate-950 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-200 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-slate-700'
                }`}
                placeholder="••••••••"
                disabled={loading}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-amber-500 focus:ring-amber-500 bg-slate-950 border-slate-700 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-slate-400">
              I agree to the{' '}
              <a href="#" className="text-amber-400 hover:underline">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="text-amber-400 hover:underline">Privacy Policy</a>
            </label>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>

        {/* Login link */}
        <div className="text-center pt-2">
          <p className="text-sm text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-amber-400 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}