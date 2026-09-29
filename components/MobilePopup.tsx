'use client';
import { useState, useEffect } from 'react';

export default function MobilePopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // ১. চেক করা হচ্ছে অ্যাপটি কি Capacitor এর মাধ্যমে নে্টিভ অ্যাপ হিসেবে চলছে কি না
    const isCapacitorApp = typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform();
    if (isCapacitorApp) {
      return;
    }

    // ২. চেক করা হচ্ছে ৩০ সেকেন্ডের কুলডাউন পিরিয়ড পার হয়েছে কি না
    const dismissedTime = localStorage.getItem('app_popup_dismissed_time');
    if (dismissedTime) {
      const timeElapsed = Date.now() - parseInt(dismissedTime);
      const thirtySeconds = 30 * 1000; // ৩০ সেকেন্ড মিলিসেকেন্ডে
      if (timeElapsed < thirtySeconds) {
        return; // ৩০ সেকেন্ডের মধ্যে হলে পপআপ দেখাবে না
      }
    }

    // ৩. মোবাইল ব্রাউজার হলে স্ক্রিন সাইজ চেক করে পপআপ দেখাবে
    const checkScreenSize = () => {
      if (window.innerWidth < 768) {
        setIsOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // পপআপ বন্ধ করার সময় বর্তমান সময় সেভ করে রাখা হলো
    localStorage.setItem('app_popup_dismissed_time', Date.now().toString());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl w-full max-w-xs text-center shadow-xl">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Download Our Android App!</h3>
        <p className="text-sm text-gray-600 mb-4">Get the official app for a faster and smoother mobile experience.</p>
        
        <a 
          href="https://drive.google.com/uc?export=download&id=12L8bDmjRn5xUI3YbsAH6hgfluysr_qRN" 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={handleClose}
          className="block bg-green-600 text-white py-2.5 px-4 rounded-lg font-bold mb-3 hover:bg-green-700 transition"
        >
          Download APK
        </a>
        
        <button 
          onClick={handleClose}
          className="text-gray-500 text-sm hover:text-gray-700"
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
}