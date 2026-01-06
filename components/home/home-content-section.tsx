"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

import home_pic_1 from "@/assets/home_pic_1.webp";
import home_pic_2 from "@/assets/home_pic_2.webp";
import home_pic_3 from "@/assets/home_pic_3.webp";
import youngjong from "@/assets/youngjong_logo.webp";
import intume from "@/assets/intume_logo.webp";

const categories = [
  {
    id: "doc_1",
    icon: home_pic_1,
  },
  {
    id: "doc_2",
    icon: home_pic_2,
  },
  {
    id: "doc_3",
    icon: home_pic_3,
  },
];

const gvc_1 = ["✅ 정보 투명성", "✅ 차별없는 가격", "✅ 방문자 접근성", "✅ 안전한 시스텀", "✅ 고객 만족도"];


export function HomeContentSection() {
  return (
    <section className="bg-white py-20 sm:py-24">
      {/* GVC index 소개 내용 */}
      <div className="mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8">
        <div className="sm:text-center md:text-left">
          <h2 className="text-2xl font-bold tracking-tight text-black sm:text-2xl md:text-3xl leading-tight">
            <span className="block">GVC 인덱스는 무엇을 평가하나요?</span>
          </h2>

          <p className="mt-4 text-base text-gray-600">
            <b>GVC Index는</b><br />
            해외 방문자의 이용 경험을 기준으로<br />
            의료·건강 서비스의 정보 투명성과 이용 조건을 종합적으로 평가합니다.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {gvc_1.map((item, index) => (
              <span
                key={index}
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-full font-medium text-sm"
              >
                {item}
              </span>
            ))}
          </div>

          <p className="mt-4 text-base text-gray-600">
            ※ GVC 인덱스는 의료 행위, 치료 결과 또는 의료진의 전문성을 평가하지 않습니다.
          </p>
        </div>

        {/* 카테고리 그리드 */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => {
            return (
              <Link
                key={category.id}
                href={`/partners?primaryCategory=${category.id}`}
                className="group flex flex-col items-center text-center transition-all hover:scale-105"
              >
                {/* 담당의사 사진 */}
                <div className="w-full aspect-square rounded-lg overflow-hidden mb-4 shadow-md">
                  <Image
                    src={category.icon}
                    alt="담당의사"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* 병원 로고 */}
                <div className="mb-3">
                  <Image
                    src={youngjong}
                    alt="영종국제병원"
                    width={120}
                    height={40}
                    className="h-10 w-auto"
                  />
                </div>

                {/* 프로그램 문구 */}
                <h3 className="text-base font-semibold text-gray-800 group-hover:text-primary transition-colors">
                  외국인 대상 건강검진 프로그램
                </h3>
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
            <Link href="/partners">상품 둘러보기</Link>
          </Button>
        </div>
      </div>

      {/* GVC 파트너스 소개 내용 */}
      <div className="mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-black sm:text-2xl md:text-3xl leading-tight">
          <span className="block">한국 방문 예정이신가요?</span>
        </h2>

        <p className="mt-4 text-base text-gray-600">
          <b>GVC 파트너스는</b>
          해외 방문자가 한국의 의료·건강·여행 서비스를<br />
          이해하고 비교할 수 있도록 상품 중심 정보를 제공합니다.<br />
        </p>

        {/* intume 서비스 소개 */}
        <div className="mx-auto mt-12 flex flex-col md:flex-row gap-8 items-center">
          {/* 왼쪽: 제목과 내용 */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-black mb-4">
              Intume 서비스
            </h3>
            <p className="text-base text-gray-600">
              Intume는 한국을 방문하는 외국인 여행객을 위한<br />
              의료·건강·여행 통합 서비스 플랫폼입니다.<br />
              신뢰할 수 있는 파트너사와 함께 안전하고 편리한 여행을 제공합니다.
            </p>
          </div>

          {/* 오른쪽: 브랜드 로고 박스 */}
          <div className="w-[300px] h-[216px] rounded-lg bg-gray-50 flex items-center justify-center">
            <Image
              src={intume}
              alt="Intume Logo"
              width={200}
              height={80}
              className="object-contain"
            />
          </div>
        </div>


      </div>



    </section>
  );
}

