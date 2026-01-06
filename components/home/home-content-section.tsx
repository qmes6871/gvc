"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

import home_pic_1 from "@/assets/home_pic_1.webp";
import home_pic_2 from "@/assets/home_pic_2.webp";
import home_pic_3 from "@/assets/home_pic_3.webp";
import youngjong from "@/assets/youngjong_logo.webp";
import intume from "@/assets/intume_logo.webp";

const certified_partner = [
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
    <section className="bg-white py-12 md:py-20 lg:py-24">
      {/* GVC index 소개 내용 */}
      <div className="mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 mb-16 md:mb-24 lg:mb-32">
        <div className="sm:text-center md:text-left">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-black leading-tight">
              <span className="block">GVC 파트너스의 INDEX 인증이란?</span>
            </h2>

            <p className="mt-3 md:mt-4 text-sm md:text-base text-gray-600 leading-relaxed">
              <b>GVC Index는</b><br />
              해외 방문자를 기준으로 의료, 건강 서비스를<br />
              객관적으로 평가하기 위한 정보 기준입니다.
            </p>
          </div>

          {/* 인증 파트너 예시 */}
          <div className="mt-8 md:mt-12 lg:mt-16 grid grid-cols-3 gap-3 md:gap-8">
            {certified_partner.map((partner) => {
              return (
                <Link
                  key={partner.id}
                  href={`/partners?primaryCategory=${partner.id}`}
                  className="group flex flex-col items-center text-center transition-all hover:scale-105"
                >
                  <div className="w-full aspect-square rounded-lg overflow-hidden mb-2 md:mb-4 shadow-md">
                    <Image
                      src={partner.icon}
                      alt="partner"
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* 병원 로고 */}
                  <div className="mb-2 md:mb-3">
                    <Image
                      src={youngjong}
                      alt="영종국제병원"
                      width={120}
                      height={40}
                      className="h-6 md:h-10 w-auto"
                    />
                  </div>

                  {/* 프로그램 문구 */}
                  <h3 className="text-xs md:text-base font-semibold text-gray-800 group-hover:text-primary transition-colors">
                    외국인 대상 건강검진 프로그램
                  </h3>
                </Link>
              );
            })}
          </div>

          {/* 상품 둘러보기 버튼 */}
          <div className="mt-8 md:mt-12 mb-8 md:mb-12 flex justify-center">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-10 md:h-12 px-6 md:px-8 text-sm md:text-base font-semibold"
            >
              <Link href="/partners">상품 둘러보기</Link>
            </Button>
          </div>

          {/* GVC 인덱스 평가 항목 */}
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-black leading-tight">
              <span className="block">GVC 인덱스는 무엇을 평가하나요?</span>
            </h2>

            <p className="mt-3 md:mt-4 text-sm md:text-base text-gray-600 leading-relaxed">
              <b>GVC Index는</b><br />
              해외 방문자의 이용 경험을 기준으로<br />
              의료·건강 서비스의 정보 투명성과 이용 조건을 종합적으로 평가합니다.
            </p>
          </div>

          {/* GVC 인덱스 평가 항목 2 */}
          <div className="mt-4 md:mt-6 grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3 w-full">
            {gvc_1.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-center px-2 md:px-4 py-2 md:py-3 bg-primary text-white rounded-lg font-medium text-xs md:text-sm text-center"
              >
                {item}
              </div>
            ))}
          </div>

          {/* GVC 인덱스 평가 항목 3 */}
          <p className="mt-3 md:mt-4 text-xs md:text-sm text-gray-600">
            ※ GVC 인덱스는 의료 행위, 치료 결과 또는 의료진의 전문성을 평가하지 않습니다.
          </p>
        </div>
      </div>

      {/* GVC 파트너스 소개 내용 */}
      <div className="mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8">
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-black leading-tight">
          <span className="block">한국 방문 예정이신가요?</span>
        </h2>

        <p className="mt-3 md:mt-4 text-sm md:text-base text-gray-600 leading-relaxed">
          <b>GVC 파트너스는</b>
          해외 방문자가 한국의 의료·건강·여행 서비스를 <br />
          이해하고 비교할 수 있도록 상품 중심 정보를 제공합니다.<br />
        </p>

        {/* intume 서비스 소개 */}
        <div className="mx-auto mt-8 md:mt-12 flex flex-col md:flex-row gap-6 md:gap-8 items-center">
          {/* 왼쪽: 제목과 내용 */}
          <div className="flex-1">
            <h3 className="text-base md:text-lg lg:text-xl font-bold text-black mb-3 md:mb-4">
              한국의 현지인들과 함께하는 안심여행과 함께
            </h3>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              인투미 트립과 함께 서울부터 로컬여행까지 <br />원하는 여행을 선택하세요.
            </p>
          </div>

          {/* 오른쪽: 브랜드 로고 박스 */}
          <div className="w-full md:w-[300px] h-[180px] md:h-[216px] rounded-lg bg-gray-50 flex items-center justify-center">
            <Image
              src={intume}
              alt="Intume Logo"
              width={200}
              height={80}
              className="object-contain w-[150px] md:w-[200px]"
            />
          </div>
        </div>

        {/* 문의하기 버튼 */}
        <div className="mt-8 md:mt-12 flex justify-center">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-10 md:h-12 px-6 md:px-8 text-sm md:text-base font-semibold"
          >
            <Link href="/inquiry">문의하기</Link>
          </Button>
        </div>
      </div>

    </section>
  );
}

