'use client';

import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Swiper-এর প্রয়োজনীয় স্টাইল ইমপোর্ট
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

// নতুন ৬টি ফিজিক্যাল ও ফুড প্রোডাক্ট অফার স্লাইড ডেটা
const heroSlides = [
  {
    id: 1,
    title: "Claim Your 10% Discount Ticket Now!",
    subtitle: "Grab your exclusive 10% discount token for your next purchase. Valid for a limited time only.",
    discount: "10% OFF Ticket",
    buttonText: "Claim Token",
    buttonLink: "/physical-products",
    badge: "Special Event",
    image: "/product1.jpeg",
    isClaimSlide: true // ✅ শুধু নতুনদের জন্য টোকেন ক্লেইম বাটন থাকবে
  },
  {
    id: 2,
    title: "Cash on Delivery Available Nationwide",
    subtitle: "Shop your favorite physical products & food items with absolute trust. Pay safely when it arrives at your door.",
    discount: "Nationwide COD",
    buttonText: "Shop Now",
    buttonLink: "/physical-products",
    badge: "Secure Shopping",
    image: "/product2.jpeg"
  },
  {
    id: 3,
    title: "Flat 50 BDT OFF on 1000 BDT Purchase",
    subtitle: "Get an instant 50 BDT discount when you spend 1000 BDT or more on your first product order.",
    discount: "Save 50 BDT",
    buttonText: "Explore Products",
    buttonLink: "/physical-products",
    badge: "Big Savings",
    image: "/product3.jpeg"
  },
  {
    id: 4,
    title: "Register & Win Free Delivery",
    subtitle: "Create your free account today and unlock exclusive free delivery rewards on your orders.",
    discount: "Free Delivery Offer",
    buttonText: "Register Now",
    buttonLink: "/register",
    badge: "Free Shipping",
    image: "/5.jpeg"
  },
  {
    id: 5,
    title: "Fresh Quality Food & Physical Items",
    subtitle: "Explore our wide range of verified physical goods and delicious food items delivered fresh to you.",
    discount: "Top Quality",
    buttonText: "Browse Store",
    buttonLink: "/physical-products",
    badge: "Best Sellers",
    image: "/rr.jpeg"
  },
  {
    id: 6,
    title: "24/7 Dedicated Support & Service",
    subtitle: "We are always here to help you with your orders, tracking, and seamless shopping experience.",
    discount: "Always Support",
    buttonText: "Contact Us",
    buttonLink: "/contact",
    badge: "Reliable",
    image: "/4.jpeg"
  }
];

export default function HeroSlider() {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [claiming, setClaiming] = useState(false);

  // ✅ টোকেন ক্লেইম করার হ্যান্ডলার
  const handleClaimToken = async () => {
    if (!isAuthenticated) {
      toast.error('Please login first to claim your token');
      window.location.href = '/login';
      return;
    }

    try {
      setClaiming(true);
      const res = await axios.post('/api/auth/claim-token');
      if (res.data.success) {
        toast.success('Congratulations! You have successfully claimed your 10% discount token.');
        if (refreshUser) refreshUser(); // স্টেট রিফ্রেশ করা যাতে বাটনটি হাইড হয়ে যায়
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Claim failed');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="w-full relative z-30 overflow-hidden rounded-none sm:rounded-3xl shadow-2xl border-0 sm:border border-white/10 my-0 sm:my-4 bg-neutral-950">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect={'fade'}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        loop={true}
        className="w-full h-[450px] sm:h-[480px] lg:h-[540px]"
      >
        {heroSlides.map((slide) => {
          // প্রথম স্লাইডে ইউজার যদি অলরেডি টোকেন ক্লেইম করে থাকে, তবে বাটন হাইড হয়ে সাধারণ লিংক দেখাবে
          const showClaimButton = slide.isClaimSlide && (!isAuthenticated || !user?.hasClaimedToken);

          return (
            <SwiperSlide key={slide.id}>
              <div className="w-full h-full relative overflow-hidden flex items-center px-6 sm:px-12 lg:px-16 bg-gradient-to-r from-neutral-950 via-zinc-900 to-neutral-950">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 w-full items-center gap-8 z-10">
                  
                  {/* বাম পাশের টেক্সট কন্টেন্ট */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-block bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold px-3 py-1 rounded-full text-amber-400">
                        {slide.badge}
                      </span>
                      <span className="inline-block bg-amber-400/20 border border-amber-400/30 text-xs font-bold px-3 py-1 rounded-full text-amber-300">
                        {slide.discount}
                      </span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                      {slide.title}
                    </h1>

                    <p className="text-sm sm:text-base text-gray-300 max-w-xl leading-relaxed">
                      {slide.subtitle}
                    </p>

                    <div className="pt-2 flex flex-wrap gap-4">
                      {showClaimButton ? (
                        <button
                          onClick={handleClaimToken}
                          disabled={claiming}
                          className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-neutral-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg hover:scale-105 text-sm sm:text-base cursor-pointer disabled:opacity-50"
                        >
                          {claiming ? 'Claiming...' : 'Claim 10% Discount Token'}
                        </button>
                      ) : (
                        <Link
                          href={slide.buttonLink}
                          className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-neutral-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg hover:scale-105 text-sm sm:text-base"
                        >
                          {slide.buttonText}
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* ডান পাশের ইমেজ */}
                  <div className="lg:col-span-5 flex justify-center items-center">
                    <div className="relative w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/40 backdrop-blur-md p-4">
                      <Image 
                        src={slide.image} 
                        alt={slide.title} 
                        fill 
                        sizes="(max-width: 768px) 100vw, 320px"
                        className="object-contain hover:scale-105 transition-transform duration-500"
                        priority={slide.id === 1}
                      />
                    </div>
                  </div>

                </div>

              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}