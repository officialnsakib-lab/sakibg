'use client';
import { useState, useEffect } from 'react';

export default function MobilePopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check screen size to show the popup only on mobile devices
    const checkScreenSize = () => {
      if (window.innerWidth < 768) {
        setIsOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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
          className="block bg-green-600 text-white py-2.5 px-4 rounded-lg font-bold mb-3 hover:bg-green-700 transition"
        >
          Download APK
        </a>
        
        <button 
          onClick={() => setIsOpen(false)}
          className="text-gray-500 text-sm hover:text-gray-700"
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
}