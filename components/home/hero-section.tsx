"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero_bg.webp";
import LogoImg from "@/assets/foodlink-logo.png";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* 배경 이미지 */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={heroBg}
          alt="Hero Background"
          fill
          priority
          className="object-cover object-center"
          quality={90}
        />
      </div>

      <div className="mx-auto max-w-screen-lg px-4 py-20 sm:px-6 sm:py-30 lg:px-8 lg:py-[10%] h-[80dvh] flex flex-col justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-black sm:text-2xl md:text-3xl leading-tight">
            <span className="block">Food 제조의 모든 과정</span>
            <span className="mt-2 block">한 곳에서 해결하세요</span>

            <div className="mt-16">
              <Button
                asChild
                size="lg"
                className="h-10 bg-black px-8 text-base font-semibold text-white hover:bg-gray-800 rounded-3xl"
              >
                <Link href="/partners">
                  파트너 찾아보기
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </h1>

          {/* 회사 로고 섹션 */}
          <div className="mt-12 flex justify-end w-full">
            <div className="flex items-center space-x-2">
              <Image
                src={LogoImg.src}
                alt="FoodLink Logo"
                width={120}
                height={40}
              />
            </div>
          </div>
      </div>
    </section>
  );
}
