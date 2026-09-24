'use client';

import React from 'react';

const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderTracking({ order }: { order: any }) {
  const currentStep = steps.indexOf(order.orderStatus);

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-lg shadow-md border">
      <h2 className="text-xl font-bold mb-4">অর্ডার ট্র্যাকিং আইডি: {order.orderId}</h2>
      
      {/* Stepper Timeline */}
      <div className="flex justify-between items-center mb-6">
        {steps.map((step, index) => (
          <div key={step} className="flex flex-col items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${index <= currentStep ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {index + 1}
            </div>
            <span className="text-xs capitalize mt-2 font-medium">{step}</span>
          </div>
        ))}
      </div>

      {/* Courier & Tracking details for Physical Products */}
      {order.productType === 'physical' && order.trackingNumber && (
        <div className="p-4 bg-gray-50 border rounded-md">
          <p className="text-sm font-medium">কুরিয়ার সার্ভিস: <span className="font-bold">{order.courierName}</span></p>
          <p className="text-sm font-medium">ট্র্যাকিং নম্বর: <span className="font-bold">{order.trackingNumber}</span></p>
        </div>
      )}
    </div>
  );
}