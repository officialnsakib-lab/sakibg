'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/layout/Footer';
import { Mail, Phone, ArrowLeft, ShieldCheck, Briefcase, User } from 'lucide-react';

export default function TeamMemberProfilePage() {
  const params = useParams();
  const memberId = params?.id;

  const teamData: { [key: string]: any } = {
    'nazmus-sakib': {
      name: 'Nazmus Sakib',
      role: 'Chief Executive Officer & Founder',
      avatar: '/sakib.jpeg', // এখানে ছবির পাথ দিতে পারেন
      bio: 'Leading overall platform strategy, full-stack development, and global multi-vendor operations.',
      email: 'nazmussakib@wahisnovaimex.com',
      phone: '+880 1800-000000',
      expertise: ['Next.js & MERN Stack', 'Multi-Vendor Architecture', 'Platform Security'],
      experience: '5+ Years in Web Development & E-Commerce Solutions'
    },
    'tanvir-ahmed': {
      name: 'Tanvir Ahmed',
      role: 'Chief Technology Officer (CTO)',
      avatar: '',
      bio: 'Manages platform architecture, server deployment, and database security.',
      email: 'tanvir@wahisnovaimex.com',
      phone: '+880 1800-000001',
      expertise: ['Cloud Infrastructure', 'DevOps & CI/CD', 'MongoDB Optimization'],
      experience: '4+ Years in Backend & Cloud Engineering'
    },
    'rakibul-hasan': {
      name: 'Rakibul Hasan',
      role: 'Head of Vendor Relations',
      avatar: '',
      bio: 'Handles vendor onboarding, physical product policies, and merchant support.',
      email: 'rakibul@wahisnovaimex.com',
      phone: '+880 1800-000002',
      expertise: ['Vendor Management', 'Supply Chain', 'Customer Satisfaction'],
      experience: '4+ Years in E-Commerce Operations'
    },
    'fariha-jabin': {
      name: 'Fariha Jabin',
      role: 'Lead UI/UX & Frontend Designer',
      avatar: '',
      bio: 'Crafts responsive interfaces, checkout UI, and engaging customer shopping experiences.',
      email: 'fariha@wahisnovaimex.com',
      phone: '+880 1800-000003',
      expertise: ['Tailwind CSS', 'UI/UX Wireframing', 'Responsive Design'],
      experience: '3+ Years in Frontend & Creative Design'
    }
  };

  const member = teamData[String(memberId)] || teamData['nazmus-sakib'];

  return (
    <div className="min-h-screen bg-[#070b12] text-white flex flex-col justify-between">
      <div className="max-w-4xl mx-auto px-4 py-16 w-full">
        <Link href="/about" className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to About Us
        </Link>

        {/* Profile Card */}
        <div className="bg-[#0c121d] rounded-3xl border border-amber-500/20 shadow-2xl p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 mb-8 text-center sm:text-left">
            <div className="w-28 h-28 rounded-2xl bg-neutral-900 border border-amber-500/30 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-inner">
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-amber-400" />
              )}
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-amber-200 mb-2">{member.name}</h1>
              <p className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">{member.role}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-neutral-300">
                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-amber-400" /> {member.email}</span>
                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-amber-400" /> {member.phone}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6 border-t border-amber-500/10 pt-8 text-sm">
            <div>
              <h3 className="text-base font-bold text-amber-300 mb-2">Biography</h3>
              <p className="text-neutral-400 leading-relaxed">{member.bio}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="bg-neutral-900/60 p-5 rounded-2xl border border-amber-500/10">
                <h4 className="font-bold text-amber-200 flex items-center gap-2 mb-3">
                  <Briefcase className="w-4 h-4 text-amber-400" /> Core Expertise
                </h4>
                <ul className="space-y-1.5 text-neutral-400 text-xs">
                  {member.expertise.map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-2">✓ {item}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-neutral-900/60 p-5 rounded-2xl border border-amber-500/10">
                <h4 className="font-bold text-amber-200 flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-amber-400" /> Professional Experience
                </h4>
                <p className="text-neutral-400 text-xs leading-relaxed">{member.experience}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}