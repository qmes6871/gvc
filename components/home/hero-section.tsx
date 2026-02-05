"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import heroBg from "@/assets/hero_bg.webp";

export function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-white via-blue-50/60 to-violet-50/40">
        {/* Background image — faded & light */}
        <Image
          src={heroBg}
          alt="Hero Background"
          fill
          priority
          className="object-cover object-center opacity-[0.12]"
          quality={90}
        />

        {/* Floating blobs */}
        <div className="absolute top-1/4 -left-40 w-[500px] h-[500px] bg-primary/[0.06] rounded-full blur-[140px] animate-float" />
        <div className="absolute bottom-1/3 -right-40 w-[400px] h-[400px] bg-violet-400/[0.06] rounded-full blur-[120px] animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-300/[0.04] rounded-full blur-[160px]" />

        {/* Dot pattern */}
        <div className="absolute inset-0 dot-pattern" />

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          {/* Status badge */}
          <div
            className={`inline-flex items-center gap-2.5 rounded-full border border-gray-200 bg-white/70 backdrop-blur-sm px-5 py-2 mb-8 md:mb-10 shadow-sm transition-all duration-700 delay-300 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-sm text-gray-500 font-medium">
              해외 방문자를 위한 인증 플랫폼
            </span>
          </div>

          {/* Heading */}
          <h1
            className={`transition-all duration-1000 delay-100 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <span className="block text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter text-gray-900 leading-[0.9]">
              GVC
            </span>
            <span className="block text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter leading-[0.9] mt-1 text-gradient">
              Partners
            </span>
          </h1>

          <p
            className={`mt-6 md:mt-8 text-base sm:text-lg md:text-xl text-gray-400 max-w-xl mx-auto leading-relaxed font-light transition-all duration-700 delay-500 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            한국의 의료 · 건강 · 여행 서비스를
            <br />
            객관적으로 평가하고 인증합니다
          </p>

          {/* CTA */}
          <div
            className={`mt-10 md:mt-14 flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <Link
              href="/partners"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-blue-500 px-8 py-4 text-[15px] font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              상품 둘러보기
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/inquiry"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white/70 backdrop-blur-sm px-8 py-4 text-[15px] font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:bg-white hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]"
            >
              문의하기
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-scroll-bounce">
          <span className="text-[10px] text-gray-300 tracking-[0.2em] uppercase font-medium">
            Scroll
          </span>
          <ChevronDown className="h-4 w-4 text-gray-300" />
        </div>
      </section>

      {/* ── Marquee Band ── */}
      <div className="relative bg-gradient-to-r from-primary to-blue-500 py-3.5 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(8)].map((_, i) => (
            <span
              key={i}
              className="mx-6 text-xs font-bold text-white/80 tracking-[0.15em] uppercase"
            >
              INDEX CERTIFICATION &nbsp;&bull;&nbsp; MEDICAL TOURISM
              &nbsp;&bull;&nbsp; HEALTH CHECK &nbsp;&bull;&nbsp; TRAVEL
              SERVICE &nbsp;&bull;&nbsp;
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
