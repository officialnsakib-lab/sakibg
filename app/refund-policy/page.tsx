'use client';

import React from 'react';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#070b12] text-white py-16 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-block mb-4">
          Trust & Transparency
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 mb-4">
          Refund & Return Policy
        </h1>
        <p className="text-neutral-400 text-sm sm:text-base max-w-2xl mx-auto">
          Please read our refund policy carefully to understand the terms regarding digital downloads and physical product returns on Wahisnova IMEX.
        </p>
      </div>

      {/* Policy Content Container */}
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Section 1: Overview */}
        <div className="bg-[#0c121d] p-6 sm:p-8 rounded-2xl border border-amber-500/20 shadow-xl">
          <h2 className="text-xl font-bold text-amber-200 mb-3 flex items-center gap-2">
            <span>📋</span> 1. General Overview
          </h2>
          <p className="text-neutral-300 text-sm leading-relaxed">
            At Wahisnova IMEX, we strive to ensure complete transparency between buyers and multi-vendor partners. Because our marketplace offers both instant digital assets and physical goods, our refund and return guidelines differ based on the product category.
          </p>
        </div>

        {/* Section 2: Digital Products (Non-Refundable) */}
        <div className="bg-[#0c121d] p-6 sm:p-8 rounded-2xl border border-amber-500/20 shadow-xl">
          <h2 className="text-xl font-bold text-amber-200 mb-3 flex items-center gap-2">
            <span>💻</span> 2. Digital Products Policy (Non-Refundable)
          </h2>
          <p className="text-neutral-300 text-sm leading-relaxed mb-4">
            Due to the irrevocable nature of digital goods (such as software, plugins, templates, e-books, and downloadable assets):
          </p>
          <ul className="list-disc list-inside text-neutral-400 text-sm space-y-2">
            <li><strong className="text-amber-300">All digital product sales are final.</strong> Once a digital file or license key has been purchased and downloaded or accessed, it cannot be returned, exchanged, or refunded.</li>
            <li>Exceptions are only made if the digital file is proven to be completely corrupted or fundamentally different from its official description, subject to review by our support team.</li>
          </ul>
        </div>

        {/* Section 3: Physical Products (Refundable & Returnable) */}
        <div className="bg-[#0c121d] p-6 sm:p-8 rounded-2xl border border-amber-500/20 shadow-xl">
          <h2 className="text-xl font-bold text-amber-200 mb-3 flex items-center gap-2">
            <span>📦</span> 3. Physical Products Policy (Refund & Return)
          </h2>
          <p className="text-neutral-300 text-sm leading-relaxed mb-4">
            For physical items purchased through our marketplace, we want you to be completely satisfied. You are eligible for a return and refund under the following conditions:
          </p>
          <ul className="list-disc list-inside text-neutral-400 text-sm space-y-2">
            <li><strong className="text-amber-300">Timeframe:</strong> Return requests must be initiated within <strong className="text-white">7 days</strong> of receiving your delivery.</li>
            <li><strong className="text-amber-300">Condition:</strong> The item must be unused, in its original packaging, and in the same condition that you received it.</li>
            <li><strong className="text-amber-300">Damaged or Defective:</strong> If you receive a damaged, defective, or incorrect item, please notify us immediately with photo/video proof for a full replacement or refund.</li>
          </ul>
        </div>

        {/* Section 4: Refund Process */}
        <div className="bg-[#0c121d] p-6 sm:p-8 rounded-2xl border border-amber-500/20 shadow-xl">
          <h2 className="text-xl font-bold text-amber-200 mb-3 flex items-center gap-2">
            <span>🔄</span> 4. How to Request a Return
          </h2>
          <p className="text-neutral-300 text-sm leading-relaxed">
            To start a return for a physical product, contact our support team at <strong className="text-amber-300">support@wahisnovaimex.com</strong> with your order ID and reason for return. Once your returned item is received and inspected by the vendor, your refund will be processed through your original payment method within 5–7 business days.
          </p>
        </div>

      </div>
    </div>
  );
}