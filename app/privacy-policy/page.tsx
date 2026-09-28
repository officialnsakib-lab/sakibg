import React from 'react';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Privacy Policy - WAHISNOVA IMEX',
  description: 'Privacy Policy for WAHISNOVA IMEX - Multi-vendor platform for physical and digital products.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#070b12] text-gray-300 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-[#0b101b] border border-amber-500/20 rounded-3xl p-8 sm:p-12 shadow-2xl">
        
        {/* Header Section */}
        <div className="border-b border-white/10 pb-6 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-4">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            Data Protection & Security
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wide">
            Privacy <span className="text-amber-400">Policy</span>
          </h1>
          <p className="text-xs text-gray-400 mt-2">Last updated: September 28, 2026</p>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-sm sm:text-base leading-relaxed">
          
          <section>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-amber-400">01.</span> Introduction
            </h2>
            <p className="text-gray-300">
              Welcome to <strong>WAHISNOVA IMEX</strong> ("we," "our," or "us"). We are deeply committed to protecting your personal information and your right to privacy when you visit our multi-vendor website and use our services to purchase both physical and digital products.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-amber-400">02.</span> Information We Collect
            </h2>
            <p className="text-gray-300 mb-2">
              We collect personal information that you voluntarily provide when registering on the website, placing an order, or registering as a vendor:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              <li><strong>Personal Information:</strong> Name, email address, phone number, shipping address, billing address, and payment details.</li>
              <li><strong>Vendor Information:</strong> Business details, tax identification numbers, and payout information for multi-vendor operations.</li>
              <li><strong>Transaction Data:</strong> Details regarding physical and digital products purchased or sold through our platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-amber-400">03.</span> How We Use Your Information
            </h2>
            <p className="text-gray-300 mb-2">We use the collected information for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              <li>To facilitate account creation and login processes.</li>
              <li>To fulfill and manage your orders (shipping for physical goods and instant delivery/downloads for digital products).</li>
              <li>To manage multi-vendor operations and allow smooth communication between buyers and vendors.</li>
              <li>To serve personalized advertisements via third-party partners like <strong>Google AdSense</strong>.</li>
              <li>To send administrative information, order updates, and policy changes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-amber-400">04.</span> Digital vs. Physical Products Policy
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div className="bg-neutral-900/60 border border-white/10 p-5 rounded-2xl">
                <h3 className="font-bold text-white mb-1 text-amber-300">📦 Physical Products</h3>
                <p className="text-xs text-gray-400">
                  Shipping addresses and contact numbers are collected solely to deliver physical merchandise safely through our courier partners.
                </p>
              </div>
              <div className="bg-neutral-900/60 border border-white/10 p-5 rounded-2xl">
                <h3 className="font-bold text-white mb-1 text-amber-300">💻 Digital Products</h3>
                <p className="text-xs text-gray-400">
                  Digital items are delivered electronically via secure download links or user dashboards. Download logs are tracked to prevent unauthorized distribution.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-amber-400">05.</span> Cookies and Web Beacons
            </h2>
            <p className="text-gray-300">
              WAHISNOVA IMEX uses cookies to store information regarding visitor preferences and the pages accessed. Google, as a third-party vendor, uses DART cookies to serve ads based on users' visits to our site and other sites on the internet. You may opt out of DART cookies by visiting the Google ad and content network Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-amber-400">06.</span> Security of Your Information
            </h2>
            <p className="text-gray-300">
              We implement industry-standard administrative, technical, and physical security measures to protect your personal data and ensure safe multi-vendor transactions.
            </p>
          </section>

          <section className="border-t border-white/10 pt-6">
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-amber-400">07.</span> Contact Us
            </h2>
            <p className="text-gray-300 mb-3">If you have any questions about this Privacy Policy, please contact us:</p>
            <div className="bg-black/40 border border-amber-500/20 p-4 rounded-xl space-y-1 text-sm">
              <p><strong>Company:</strong> WAHISNOVA IMEX</p>
              <p><strong>Email:</strong> support@wahisnova.com</p>
              <p><strong>Helpline:</strong> +880 1577-394019</p>
              <p><strong>Location:</strong> Khulna, Bangladesh</p>
            </div>
          </section>

        </div>

      </div>
    </main>
  );
}