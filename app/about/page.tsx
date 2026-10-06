'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/layout/Footer';
import { Mail, Phone, Globe, Share2, Code, User } from 'lucide-react';

export default function AboutPage() {
  const teamMembers = [
    {
      id: 'nazmus-sakib',
      name: 'Nazmus Sakib',
      role: 'Chief Executive Officer & Founder',
      avatar: '/sakib.jpeg', // <-- এখানে আপনার ছবি বা লোগোর পাথ দিন (যেমন: /images/sakib.jpg)
      bio: 'Leading overall platform strategy, full-stack development, and global multi-vendor operations.',
      email: 'nazmussakib@wahisnovaimex.com',
      phone: '+880 1800-000000',
      profileUrl: '/profile/nazmus-sakib',
      socials: {
        portfolio: 'https://github.com',
        network: 'https://linkedin.com'
      }
    },
    {
      id: 'tanvir-ahmed',
      name: 'Tanvir Ahmed',
      role: 'Chief Technology Officer (CTO)',
      avatar: '', // ছবি না থাকলে এখানে খালি রাখবেন, অটোমেটিক আইকন দেখাবে
      bio: 'Manages platform architecture, server deployment, and database security.',
      email: 'tanvir@wahisnovaimex.com',
      phone: '+880 1800-000001',
      profileUrl: '/profile/tanvir-ahmed',
      socials: {
        portfolio: 'https://github.com',
        network: 'https://linkedin.com'
      }
    },
    {
      id: 'rakibul-hasan',
      name: 'Rakibul Hasan',
      role: 'Head of Vendor Relations',
      avatar: '',
      bio: 'Handles vendor onboarding, physical product policies, and merchant support.',
      email: 'rakibul@wahisnovaimex.com',
      phone: '+880 1800-000002',
      profileUrl: '/profile/rakibul-hasan',
      socials: {
        portfolio: 'https://github.com',
        network: 'https://linkedin.com'
      }
    },
    {
      id: 'fariha-jabin',
      name: 'Fariha Jabin',
      role: 'Lead UI/UX & Frontend Designer',
      avatar: '',
      bio: 'Crafts responsive interfaces, checkout UI, and engaging customer shopping experiences.',
      email: 'fariha@wahisnovaimex.com',
      phone: '+880 1800-000003',
      profileUrl: '/profile/fariha-jabin',
      socials: {
        portfolio: 'https://github.com',
        network: 'https://linkedin.com'
      }
    }
  ];

  return (
    <div className="min-h-screen bg-[#070b12] text-white flex flex-col justify-between">
      <div>
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 border-b border-amber-500/15 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 mb-6">
              World-Class Multi-Vendor Digital & Physical Marketplace
            </h1>
            <p className="text-neutral-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              **Wahisnova IMEX** is a comprehensive platform where premium digital products and quality physical & food items are bought and sold seamlessly under one roof.
            </p>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Meet Our Expert Team</h2>
            <p className="text-neutral-400 text-sm">The dedicated professionals driving Wahisnova IMEX forward</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <div 
                key={index} 
                className="bg-[#0c121d] rounded-2xl overflow-hidden border border-amber-500/20 shadow-lg hover:border-amber-400/50 transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Avatar / Photo Box */}
                <div className="relative h-48 w-full bg-neutral-900 overflow-hidden border-b border-amber-500/15 flex items-center justify-center">
                  {member.avatar ? (
                    <img 
                      src={member.avatar} 
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300 shadow-inner group-hover:scale-110 transition-transform duration-300">
                      <User className="w-10 h-10 text-amber-400" />
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-amber-200">{member.name}</h4>
                    <p className="text-xs font-semibold text-amber-400 mb-2 uppercase tracking-wider">{member.role}</p>
                    <p className="text-neutral-400 text-xs leading-relaxed mb-4">{member.bio}</p>
                  </div>

                  {/* Contact & Profile Info */}
                  <div className="border-t border-amber-500/10 pt-3 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-neutral-300 truncate">
                      <Mail className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-300">
                      <Phone className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span>{member.phone}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Link 
                        href={member.profileUrl} 
                        className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1"
                      >
                        <Globe className="w-3.5 h-3.5" /> View Profile
                      </Link>

                      <div className="flex items-center gap-2">
                        <a href={member.socials.network} target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-amber-400 transition-colors">
                          <Share2 className="w-4 h-4" />
                        </a>
                        <a href={member.socials.portfolio} target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-amber-400 transition-colors">
                          <Code className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}