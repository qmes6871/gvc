"use client";

import Image from "next/image";
import heroBg from "@/assets/hero_bg.webp";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-screen-lg px-4 py-20 sm:px-6 sm:py-30 lg:px-8 lg:py-[10%] h-[80dvh] flex flex-col justify-between">
        <Image
          src={heroBg}
          alt="Hero Background"
          fill
          priority
          className="object-cover object-center"
          quality={90}
        />
      </div>
    </section>
  );
}
