'use client';

import React from 'react';
import { Wrench, Clock, Mail } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-4">
      <div className="text-center text-white">
        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Wrench className="w-10 h-10" />
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Under Maintenance</h1>
        <p className="text-lg text-white/80 mb-6 max-w-md mx-auto">
          We're currently performing scheduled maintenance. We'll be back shortly!
        </p>
        
        <div className="flex items-center justify-center gap-2 text-white/60 mb-8">
          <Clock className="w-5 h-5" />
          <span>Estimated time: 1-2 hours</span>
        </div>
        
        <div className="bg-white/10 rounded-lg p-4 inline-block">
          <p className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4" />
            support@wahisnova.com
          </p>
        </div>
      </div>
    </div>
  );
}