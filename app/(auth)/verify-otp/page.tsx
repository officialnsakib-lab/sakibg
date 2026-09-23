'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Mail, Loader2, CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    if (!email) {
      router.push('/register');
      return;
    }
    inputRefs.current[0]?.focus();
  }, [email, router]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Handle OTP input change
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pasted)) return;
    
    const newOtp = pasted.split('').concat(Array(6 - pasted.length).fill(''));
    setOtp(newOtp);
    
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/verify-otp', {
        email,
        otp: otpString
      });
      
      if (response.data.success) {
        toast.success('Email verified!');
        
        // Redirect based on role
        const user = response.data.data.user;
        setTimeout(() => {
          if (user.role === 'vendor') {
            window.location.href = '/vendor/dashboard';
          } else {
            window.location.href = '/';
          }
        }, 500);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Verification failed');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Handle resend
  const handleResend = async () => {
    if (resendTimer > 0) return;
    
    setResending(true);
    try {
      await axios.post('/api/auth/resend-otp', { email });
      toast.success('New OTP sent!');
      setResendTimer(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to resend');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Verify Your Email
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          We sent a 6-digit code to<br />
          <span className="font-semibold text-gray-700">{email}</span>
        </p>

        <form onSubmit={handleSubmit}>
          {/* OTP Inputs */}
          <div className="flex justify-center gap-2 sm:gap-3 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                disabled={loading}
              />
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || otp.join('').length !== 6}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Verify Email
              </>
            )}
          </button>
        </form>

        {/* Resend */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500 mb-2">Didn't receive the code?</p>
          <button
            onClick={handleResend}
            disabled={resending || resendTimer > 0}
            className="text-indigo-600 font-medium hover:text-indigo-800 disabled:opacity-50 flex items-center gap-1 mx-auto"
          >
            {resending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
          </button>
        </div>

        {/* Back to register */}
        <div className="text-center mt-6 pt-6 border-t border-gray-200">
          <Link href="/register" className="text-sm text-gray-500 hover:text-indigo-600 flex items-center justify-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Back to Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyOtpForm />
    </Suspense>
  );
}