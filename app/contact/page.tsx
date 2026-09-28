'use client';

import React, { useState } from 'react';
import Footer from '@/components/layout/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // এখানে আপনার ফর্ম সাবমিট লজিক বা API কল যুক্ত করতে পারেন
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-white flex flex-col justify-between">
      {/* Main Content Area */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-block mb-4">
            Get in Touch
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 mb-4">
            Contact Wahisnova IMEX
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base max-w-2xl mx-auto">
            Have questions about buying, selling, digital downloads, or vendor partnerships? Reach out to our team and we’ll get back to you promptly.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-[#0c121d] p-6 sm:p-8 rounded-2xl border border-amber-500/20 shadow-xl">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 text-2xl mb-4">
                📍
              </div>
              <h3 className="text-lg font-bold text-amber-200 mb-2">Our Office</h3>
              <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                Global Operations & Digital Support Hub, Wahisnova IMEX Marketplace.
              </p>
            </div>

            <div className="bg-[#0c121d] p-6 sm:p-8 rounded-2xl border border-amber-500/20 shadow-xl">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 text-2xl mb-4">
                ✉️
              </div>
              <h3 className="text-lg font-bold text-amber-200 mb-2">Email Us</h3>
              <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed mb-1">Support: support@wahisnovaimex.com</p>
              <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">Vendor: vendors@wahisnovaimex.com</p>
            </div>

            <div className="bg-[#0c121d] p-6 sm:p-8 rounded-2xl border border-amber-500/20 shadow-xl">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 text-2xl mb-4">
                ⏰
              </div>
              <h3 className="text-lg font-bold text-amber-200 mb-2">Working Hours</h3>
              <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                Saturday – Thursday: 9:00 AM – 8:00 PM<br />
                Friday: Closed / Online Support Only
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-[#0c121d] p-8 sm:p-10 rounded-2xl border border-amber-500/20 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6">Send Us a Message</h2>

            {submitted ? (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-8 text-center">
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="text-xl font-bold text-amber-300 mb-2">Message Sent Successfully!</h3>
                <p className="text-neutral-300 text-sm mb-6">
                  Thank you for reaching out to us. Our support team has received your message and will get back to you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs hover:bg-amber-500 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-2">Your Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="w-full bg-[#070b12] border border-neutral-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-2">Your Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                      className="w-full bg-[#070b12] border border-neutral-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-2">Subject / Inquiry Type</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full bg-[#070b12] border border-neutral-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors"
                  >
                    <option value="" disabled>Select inquiry type</option>
                    <option value="General Support">General Support</option>
                    <option value="Buyer Assistance">Buyer Assistance & Orders</option>
                    <option value="Vendor Partnership">Vendor Partnership & Registration</option>
                    <option value="Technical Issue">Technical Issue / Bug Report</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-2">Your Message</label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your message or query in detail..."
                    className="w-full bg-[#070b12] border border-neutral-800 focus:border-amber-500 rounded-xl p-4 text-sm text-white placeholder-neutral-500 outline-none transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-amber-400 text-neutral-950 font-bold rounded-xl text-sm hover:bg-amber-500 transition-colors shadow-lg shadow-amber-400/20"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer Component Added */}
      <Footer />
    </div>
  );
}