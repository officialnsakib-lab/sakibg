'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/layout/Footer'; // 👈 সঠিক পাথ অনুযায়ী ফুটার ইমপোর্ট করা হলো

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqCategories = [
    {
      title: 'General Questions',
      questions: [
        {
          q: 'What is Wahisnova IMEX?',
          a: 'Wahisnova IMEX is a world-class multi-vendor marketplace where you can buy and sell both premium digital products (such as software, e-books, templates) and high-quality physical items securely under one roof.'
        },
        {
          q: 'Is Wahisnova IMEX a secure platform for shopping?',
          a: 'Yes, absolutely. We use advanced security protocols, encrypted transactions, and verified vendor systems to ensure a safe shopping and selling experience for everyone.'
        }
      ]
    },
    {
      title: 'For Buyers',
      questions: [
        {
          q: 'How can I purchase a product?',
          a: 'Simply browse our marketplace, select your desired digital or physical product, add it to your cart, and proceed to checkout by filling in your shipping/billing details and completing the payment.'
        },
        {
          q: 'How do I download my digital products after purchase?',
          a: 'Once your payment is successfully verified and processed, you will instantly get a secure download link in your dashboard and via your registered email address.'
        },
        {
          q: 'What are the available payment methods?',
          a: 'We support multiple secure payment gateways, including major credit/debit cards, mobile financial services (MFS), and online banking methods depending on your region.'
        }
      ]
    },
    {
      title: 'For Vendors & Sellers',
      questions: [
        {
          q: 'How can I become a vendor on Wahisnova IMEX?',
          a: 'Click on the "Become a Vendor" or "Login" button, register your account, and submit your vendor application. Once reviewed and approved by our team, you can start listing your products immediately.'
        },
        {
          q: 'Can I sell both digital and physical products?',
          a: 'Yes! Our platform is fully optimized for both digital downloads (software, assets, e-books) and physical inventory management with shipping tracking.'
        },
        {
          q: 'What is the commission or fee structure for vendors?',
          a: 'We offer a very competitive commission rate for vendors. Detailed information regarding commission percentages and payout cycles is available in the vendor dashboard policy section.'
        },
        {
          q: 'When and how do I receive my earnings?',
          a: 'Vendor earnings are calculated securely and can be withdrawn through our supported payout methods upon reaching the minimum withdrawal threshold.'
        }
      ]
    },
    {
      title: 'Support & Orders',
      questions: [
        {
          q: 'What should I do if I face issues with my order?',
          a: 'If you encounter any issues with a physical delivery or a digital download link, you can directly contact our Customer Support team or open a support ticket through your account.'
        },
        {
          q: 'How can I contact the support team?',
          a: 'You can reach out to us anytime by visiting our Contact page or sending an email to our support desk. Our team is dedicated to providing prompt assistance.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#070b12] text-white flex flex-col justify-between">
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-block mb-4">
            Help & Support Center
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base max-w-2xl mx-auto">
            Find clear answers to common questions about buying, selling, digital downloads, vendor accounts, and platform security on Wahisnova IMEX.
          </p>
        </div>

        {/* FAQ Content Sections */}
        <div className="max-w-4xl mx-auto space-y-12">
          {faqCategories.map((category, catIdx) => (
            <div key={catIdx} className="bg-[#0c121d] rounded-2xl border border-amber-500/20 p-6 sm:p-8 shadow-xl">
              <h2 className="text-xl font-bold text-amber-300 mb-6 pb-3 border-b border-amber-500/10 flex items-center gap-2">
                <span>📌</span> {category.title}
              </h2>

              <div className="space-y-4">
                {category.questions.map((item, qIdx) => {
                  const globalIndex = catIdx * 100 + qIdx;
                  const isOpen = openIndex === globalIndex;

                  return (
                    <div 
                      key={qIdx}
                      className="border border-neutral-800 rounded-xl overflow-hidden bg-[#070b12]/60 transition-all duration-200"
                    >
                      <button
                        onClick={() => toggleAccordion(globalIndex)}
                        className="w-full text-left px-5 py-4 font-semibold text-neutral-200 hover:text-amber-300 flex justify-between items-center gap-4 transition-colors"
                      >
                        <span className="text-sm sm:text-base">{item.q}</span>
                        <span className={`text-amber-400 font-bold text-xl transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
                          +
                        </span>
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-5 text-neutral-400 text-xs sm:text-sm leading-relaxed border-t border-neutral-800/60 pt-3">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions CTA */}
        <div className="max-w-3xl mx-auto mt-16 text-center bg-gradient-to-br from-[#0c121d] to-[#070b12] border border-amber-500/20 rounded-2xl p-8 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-2">Still Have Questions?</h3>
          <p className="text-neutral-400 text-sm mb-6">
            If you couldn't find the answer you were looking for, feel free to get in touch with our team. We are always here to help!
          </p>
          <Link
            href="/contact"
            className="inline-block px-6 py-3 bg-amber-400 text-neutral-950 font-bold rounded-xl text-sm hover:bg-amber-500 transition-colors shadow-lg shadow-amber-400/20"
          >
            Contact Support
          </Link>
        </div>
      </div>

      {/* Footer Component */}
      <Footer />
    </div>
  );
}