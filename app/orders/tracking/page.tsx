'use client';

import React from 'react';

// আমাদের মার্কেটপ্লেসের নির্দিষ্ট স্ট্যাটাস ফ্লো অনুযায়ী স্টেপগুলো সাজানো হলো
const steps = ['pending', 'confirmed', 'shipping', 'delivered'];

export default function OrderTracking({ order }: { order: any }) {
  // স্ট্যাটাসটি ছোট হাতের অক্ষরে কনভার্ট করে ইনডেক্স বের করা হচ্ছে
  const currentStatus = order?.orderStatus?.toLowerCase() || 'pending';
  
  // যদি স্ট্যাটাস 'received' বা 'shipped' হয় তবে সেগুলোকে সঠিক স্টেপে ম্যাপ করা
  const normalizedStatus = currentStatus === 'shipped' ? 'shipping' : (currentStatus === 'received' ? 'delivered' : currentStatus);
  const currentStep = steps.indexOf(normalizedStatus);

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-lg font-bold mb-6 text-gray-900">অর্ডার ট্র্যাকিং আইডি: <span className="font-mono text-indigo-600">{order?.orderId}</span></h2>
      
      {/* Stepper Timeline */}
      <div className="flex justify-between items-center mb-8 relative">
        {steps.map((step, index) => {
          const isCompleted = index <= currentStep;
          return (
            <div key={step} className="flex flex-col items-center flex-1 relative z-10">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all shadow-sm ${
                isCompleted 
                  ? 'bg-indigo-600 text-white ring-4 ring-indigo-50' 
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {index + 1}
              </div>
              <span className={`text-xs capitalize mt-2 font-semibold ${isCompleted ? 'text-indigo-600' : 'text-gray-400'}`}>
                {step === 'shipping' ? 'Shipping' : step}
              </span>
            </div>
          );
        })}
      </div>

      {/* Courier & Tracking details for Physical Products */}
      {order?.productType === 'physical' && order?.trackingNumber && (
        <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-1">
          <p className="text-sm font-medium text-gray-700">কুরিয়ার সার্ভিস: <span className="font-bold text-gray-900">{order.courierName || 'Standard Delivery'}</span></p>
          <p className="text-sm font-medium text-gray-700">ট্র্যাকিং নম্বর: <span className="font-bold font-mono text-indigo-600">{order.trackingNumber}</span></p>
        </div>
      )}
    </div>
  );
}