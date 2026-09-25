'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import Link from 'next/link';
import Image from 'next/image';

// Swiper-এর প্রয়োজনীয় স্টাইল ইমপোর্ট
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

// নতুন ওয়েবসাইট লঞ্চ উপলক্ষে ৬টি স্লাইডার এবং প্রোডাক্ট অফার ডেটা
const heroSlides = [
  {
    id: 1,
    title: "Grand Product Launch Special",
    subtitle: "Celebrate our brand new physical product launch with massive discounts.",
    discount: "Flat 30% OFF",
    firstTimeDiscount: "Extra 30% OFF on your first purchase!",
    buttonText: "Shop Products",
    buttonLink: "/physical-products",
    badge: "New Release",
    image: "/product1.png"
  },
  {
    id: 2,
    title: "Premium Website Templates",
    subtitle: "Launch your dream online store or portfolio instantly with our high-performance templates.",
    discount: "Save up to $100",
    buttonText: "Explore Templates",
    buttonLink: "/website-demos",
    badge: "Trending",
    image: "/product3.jpeg"
  },
  {
    id: 3,
    title: "Vendor Mega Welcome Offer",
    subtitle: "Join our multi-vendor marketplace today and enjoy zero commission on your first 10 sales.",
    discount: "0% Commission",
    buttonText: "Become a Vendor",
    buttonLink: "/register?vendor=true",
    badge: "Limited Time",
    image: "/product2.png"
  },
  {
    id: 4,
    title: "Exclusive UI/UX Design Kits",
    subtitle: "Upgrade your design workflow with modern, pixel-perfect, and fully responsive UI components.",
    discount: "Special Deal: 40% OFF",
    buttonText: "Browse Design Assets",
    buttonLink: "/categories",
    badge: "Hot Deal",
    image: "/5.jpeg"
  },
  {
    id: 5,
    title: "Start Your Business with Wahisnovaimex",
    subtitle: "Launch your dream enterprise today with our expert-crafted solutions, professional tools, and reliable digital guidance designed for growth.",
    discount: "Kickstart Today",
    buttonText: "Get Started Now",
    buttonLink: "/start-business",
    badge: "Exclusive Offer",
    image: "/rr.jpeg"
  },
  {
    id: 6,
    title: "24/7 Priority Support & Updates",
    subtitle: "Enjoy lifetime access, free regular updates, and dedicated expert support with every purchase.",
    discount: "Lifetime Access",
    buttonText: "Get Started Now",
    buttonLink: "/search",
    badge: "Value Pack",
    image: "/4.jpeg"
  }
];

export default function HeroSlider() {
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
        {heroSlides.map((slide) => (
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

                  <div className="pt-2">
                    <Link
                      href={slide.buttonLink}
                      className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-neutral-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg hover:scale-105 text-sm sm:text-base"
                    >
                      {slide.buttonText}
                    </Link>
                  </div>
                </div>

                {/* ডান পাশের প্রোডাক্ট ইমেজ (সম্পূর্ণ রেসপন্সিভ ও ফ্রেশ) */}
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
        ))}
      </Swiper>
    </div>
  );
}