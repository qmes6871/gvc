"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

// 아이콘 이미지 임포트
import iconManufacture from "@/assets/icon_manufacture.svg";
import iconPackage from "@/assets/icon_package.svg";
import iconAnalytics from "@/assets/icon_analytics.svg";
import iconLogi from "@/assets/icon_logi.svg";
import iconMkt from "@/assets/icon_mkt.svg";

const categories = [
  {
    id: "manufacturing",
    label: "제조",
    icon: iconManufacture,
    description: "식품 제조 전문 파트너",
  },
  {
    id: "packaging",
    label: "패키지",
    icon: iconPackage,
    description: "포장 및 패키징 전문",
  },
  {
    id: "analysis",
    label: "분석",
    icon: iconAnalytics,
    description: "성분 및 품질 분석",
  },
  {
    id: "logistics",
    label: "물류",
    icon: iconLogi,
    description: "배송 및 물류 관리",
  },
  {
    id: "marketing",
    label: "마케팅",
    icon: iconMkt,
    description: "브랜딩 및 마케팅",
  },
];

export function PartnerCategorySection() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <div className="sm:text-center md:text-left">
          <h2 className="text-2xl font-bold tracking-tight text-black sm:text-2xl md:text-3xl leading-tight">
            <span className="block">당신의 파트너를</span>
            <span className="block">손쉽게 찾아보세요</span>
          </h2>
          <p className="mt-4 text-base text-gray-600">
            더 이상 파트너 찾는데 시간 낭비하지 마세요.
            <br />
            FoodLink가 딱 맞는 파트너를 연결해드려요.
          </p>
        </div>

        {/* 카테고리 그리드 */}
        <div className="mt-16 grid sm:grid-cols-2 md:grid-cols-5 gap-6">
          {categories.map((category) => {
            return (
              <Link
                key={category.id}
                href={`/partners?primaryCategory=${category.id}`}
                className="group"
              >
                <div className="flex flex-col items-center text-center transition-all">
                  {/* 아이콘 */}
                  <div className="flex h-[6rem] w-[6rem] items-center justify-center rounded-full bg-[#F5F5F5] shadow-[0.125rem_0.125rem_0.25rem_rgba(0,0,0,0.25)] transition-transform group-hover:scale-110">
                    <Image
                      src={category.icon}
                      alt={category.label}
                      width={48}
                      height={48}
                      className="h-10 w-10"
                    />
                  </div>

                  {/* 라벨 */}
                  <h3 className="mt-4 font-bold text-black">
                    {category.label}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>

        {/* 전체 보기 버튼 */}
        <div className="mt-12 flex justify-center">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 px-8 text-base font-semibold"
          >
            <Link href="/partners">모든 파트너 보기</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
