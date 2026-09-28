import React from 'react';

export const metadata = {
  title: 'Terms & Conditions - WAHISNOVA IMEX',
  description: 'Terms and Conditions for WAHISNOVA IMEX - Multi-vendor marketplace for physical and digital products.',
};

export default function TermsAndConditionsPage() {
  return (
    <main className="min-h-screen bg-[#070b12] text-gray-300 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-[#0b101b] border border-amber-500/20 rounded-3xl p-8 sm:p-12 shadow-2xl">
        
        {/* Header Section */}
        <div className="border-b border-white/10 pb-6 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-4">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            Legal Guidelines & Agreements
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wide">
            Terms & <span className="text-amber-400">Conditions</span>
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
              Welcome to <strong>WAHISNOVA IMEX</strong>. By accessing our multi-vendor platform, registering an account, or purchasing both physical and digital products, you agree to be bound by these Terms and Conditions. Please read them carefully before using our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-amber-400">02.</span> Multi-Vendor Platform Rules
            </h2>
            <p className="text-gray-300 mb-2">
              Wahisnova IMEX operates as a marketplace connecting independent vendors with buyers. 
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              <li><strong>Vendor Responsibilities:</strong> Vendors must ensure that all physical and digital merchandise listed are legal, authentic, and free from copyright violations.</li>
              <li><strong>User Accounts:</strong> You are responsible for keeping your account credentials secure and confidential.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-amber-400">03.</span> Physical & Digital Products Policy
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div className="bg-neutral-900/60 border border-white/10 p-5 rounded-2xl">
                <h3 className="font-bold text-white mb-1 text-amber-300">📦 Physical Products</h3>
                <p className="text-xs text-gray-400">
                  Delivery timelines depend on courier services and vendor processing locations. Cash on Delivery (COD) and digital payments are accepted based on availability.
                </p>
              </div>
              <div className="bg-neutral-900/60 border border-white/10 p-5 rounded-2xl">
                <h3 className="font-bold text-white mb-1 text-amber-300">💻 Digital Products</h3>
                <p className="text-xs text-gray-400">
                  Digital items, templates, and software licenses are delivered instantly via download links or user dashboards upon successful payment verification.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-amber-400">04.</span> Payments & Pricing
            </h2>
            <p className="text-gray-300">
              All prices listed on WAHISNOVA IMEX are subject to change without notice. We support secure local payment methods including bKash, Nagad, Rocket, and Cash on Delivery. Vendors receive their payouts according to our standard platform settlement schedule.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-amber-400">05.</span> Limitation of Liability
            </h2>
            <p className="text-gray-300">
              Wahisnova IMEX shall not be held liable for any indirect, incidental, or consequential damages arising from the use of products purchased from third-party vendors on our platform.
            </p>
          </section>

          <section className="border-t border-white/10 pt-6">
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-amber-400">06.</span> Contact Information
            </h2>
            <p className="text-gray-300 mb-3">
              If you have any questions or concerns regarding these Terms & Conditions, please contact our support team:
            </p>
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