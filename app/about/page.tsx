'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/layout/Footer';

export default function AboutPage() {
  // 6-Member Team Data with local SVG/UI initials placeholder
  const teamMembers = [
    {
      name: 'Nazmus Sakib',
      role: 'Chief Executive Officer (CEO)',
      initials: 'NS',
      bio: 'Leading the company’s overall strategic planning and global operations.'
    },
    {
      name: 'Tanvir Ahmed',
      role: 'Chief Technology Officer (CTO)',
      initials: 'TA',
      bio: 'Maintains platform technical architecture, security, and scalability.'
    },
    {
      name: 'Rakibul Hasan',
      role: 'Head of Vendor Relations',
      initials: 'RH',
      bio: 'Handles seller onboarding, vendor support, and merchant policies.'
    },
    {
      name: 'Fariha Jabin',
      role: 'Lead UI/UX Designer',
      initials: 'FJ',
      bio: 'Designs engaging and user-friendly interfaces for customers and vendors.'
    },
    {
      name: 'Imran Hossain',
      role: 'Digital Marketing Manager',
      initials: 'IH',
      bio: 'Drives brand growth, SEO, and online marketing campaigns.'
    },
    {
      name: 'Nusrat Jahan',
      role: 'Customer Support Lead',
      initials: 'NJ',
      bio: 'Ensures prompt resolution for any customer or vendor inquiries.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#070b12] text-white flex flex-col justify-between">
      <div>
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 border-b border-amber-500/15 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="flex justify-center mb-6">
              <div className="relative w-48 h-14 sm:w-56 sm:h-16">
                <Image 
                  src="/tt.png" 
                  alt="Wahisnova IMEX Logo" 
                  fill 
                  sizes="(max-width: 768px) 192px, 224px"
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 mb-6">
              World-Class Multi-Vendor Digital & Physical Marketplace
            </h1>
            <p className="text-neutral-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              **Wahisnova IMEX** is a comprehensive platform where premium digital products (software, e-books, etc.) and quality physical items are bought and sold seamlessly under one roof in a secure environment.
            </p>
          </div>
        </section>

        {/* Our Mission & Vision */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-[#0c121d] to-[#070b12] p-8 rounded-2xl border border-amber-500/20 shadow-xl">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 text-2xl font-bold mb-4">🎯</div>
              <h3 className="text-xl font-bold text-amber-300 mb-3">Our Mission</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                To build a trusted bridge between global buyers and reliable vendors through innovative technology and exceptional service, ensuring everyone easily finds the digital and physical products they need.
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#0c121d] to-[#070b12] p-8 rounded-2xl border border-amber-500/20 shadow-xl">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 text-2xl font-bold mb-4">🚀</div>
              <h3 className="text-xl font-bold text-amber-300 mb-3">Our Vision</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                To emerge as a leading and most trusted multi-vendor platform in the global e-commerce market, empowering new entrepreneurs and vendors to scale their businesses rapidly.
              </p>
            </div>
          </div>
        </section>

        {/* Team Section (6 Members) */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-amber-500/10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Our Team</h2>
            <p className="text-neutral-400 text-sm">The dedicated individuals driving Wahisnova IMEX forward every day</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div 
                key={index} 
                className="bg-[#0c121d] rounded-2xl overflow-hidden border border-amber-500/20 shadow-lg hover:border-amber-400/50 transition-all duration-300 group flex flex-col"
              >
                {/* Image alternative: Stylish Gradient Box with Name Initials */}
                <div className="relative h-48 w-full bg-gradient-to-tr from-neutral-900 via-[#111827] to-amber-950/40 flex items-center justify-center border-b border-amber-500/10">
                  <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300 text-2xl font-extrabold shadow-inner group-hover:scale-110 transition-transform duration-300">
                    {member.initials}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-amber-200">{member.name}</h4>
                    <p className="text-xs font-semibold text-amber-400 mb-3 uppercase tracking-wider">{member.role}</p>
                    <p className="text-neutral-400 text-xs leading-relaxed">{member.bio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-[#05080e] border-t border-amber-500/10 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Want to Start Your Business With Us?</h2>
            <p className="text-neutral-400 text-sm mb-8">Register as a vendor today and showcase your products to thousands of customers worldwide.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/login" 
                className="px-6 py-3 bg-amber-400 text-neutral-950 font-bold rounded-xl text-sm hover:bg-amber-500 transition-colors shadow-lg shadow-amber-400/20"
              >
                Become a Vendor
              </Link>
              <Link 
                href="/contact" 
                className="px-6 py-3 bg-neutral-800 text-amber-300 border border-amber-500/30 font-bold rounded-xl text-sm hover:bg-neutral-700 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Component Added */}
      <Footer />
    </div>
  );
}