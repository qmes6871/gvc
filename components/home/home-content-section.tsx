"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shield, Globe, Eye, Lock, Heart } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

import home_pic_1 from "@/assets/home_pic_1.webp";
import home_pic_2 from "@/assets/home_pic_2.webp";
import home_pic_3 from "@/assets/home_pic_3.webp";
import youngjong from "@/assets/youngjong_logo.webp";
import intume from "@/assets/intume_logo.webp";

const certified_partner = [
  { id: "doc_1", icon: home_pic_1 },
  { id: "doc_2", icon: home_pic_2 },
  { id: "doc_3", icon: home_pic_3 },
];

const gvc_items = [
  { label: "정보 투명성", icon: Eye },
  { label: "차별없는 가격", icon: Shield },
  { label: "방문자 접근성", icon: Globe },
  { label: "안전한 시스템", icon: Lock },
  { label: "고객 만족도", icon: Heart },
];

export function HomeContentSection() {
  const s1 = useScrollAnimation();
  const s2 = useScrollAnimation();
  const s3 = useScrollAnimation();
  const s4 = useScrollAnimation();
  const s5 = useScrollAnimation();

  return (
    <>
      {/* ────────────────────────────────────
          Section 1 — INDEX 인증 소개
      ──────────────────────────────────── */}
      <section className="relative bg-white py-24 md:py-32 lg:py-40 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-[160px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-400/[0.03] rounded-full blur-[140px]" />
        <div className="absolute inset-0 dot-pattern" />

        <div className="relative mx-auto max-w-screen-lg px-6 sm:px-8">
          {/* Heading */}
          <div
            ref={s1.ref}
            className={`max-w-2xl transition-all duration-700 ${
              s1.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-primary mb-4">
              About Index
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-[1.1]">
              GVC 파트너스의
              <br />
              <span className="text-gradient">INDEX 인증</span>이란?
            </h2>
            <p className="mt-5 md:mt-6 text-base md:text-lg text-gray-500 leading-relaxed max-w-lg">
              <b className="text-gray-700">GVC Index는</b> 해외 방문자를 기준으로
              의료, 건강 서비스를 객관적으로 평가하기 위한 정보 기준입니다.
            </p>
          </div>

          {/* Partner Cards */}
          <div
            ref={s2.ref}
            className={`mt-12 md:mt-16 transition-all duration-700 delay-200 ${
              s2.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
              {certified_partner.map((partner, i) => (
                <Link
                  key={partner.id}
                  href={`/partners?primaryCategory=${partner.id}`}
                  className="group relative rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm shadow-gray-200/50 transition-all duration-500 hover:shadow-xl hover:shadow-primary/[0.08] hover:border-primary/20 hover:-translate-y-1"
                  style={{
                    transitionDelay: s2.isVisible ? `${i * 120}ms` : "0ms",
                  }}
                >
                  {/* Image */}
                  <div className="aspect-[4/3] overflow-hidden">
                    <Image
                      src={partner.icon}
                      alt="partner"
                      width={400}
                      height={300}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>

                  {/* Card info */}
                  <div className="p-4 md:p-5">
                    <div className="mb-2">
                      <Image
                        src={youngjong}
                        alt="영종국제병원"
                        width={100}
                        height={32}
                        className="h-5 md:h-7 w-auto"
                      />
                    </div>
                    <p className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                      외국인 대상 건강검진 프로그램
                    </p>
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary/60 group-hover:text-primary transition-colors">
                      자세히 보기
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 md:mt-14 flex justify-center">
            <Link
              href="/partners"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-blue-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              상품 둘러보기
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────
          Section 2 — 평가 항목
      ──────────────────────────────────── */}
      <section className="relative bg-[#f8f9fc] py-24 md:py-32 lg:py-40 overflow-hidden">
        <div className="absolute inset-0 dot-pattern" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary/[0.04] to-transparent rounded-full blur-[100px]" />

        <div className="relative mx-auto max-w-screen-lg px-6 sm:px-8">
          <div
            ref={s3.ref}
            className={`text-center max-w-2xl mx-auto transition-all duration-700 ${
              s3.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-primary mb-4">
              Evaluation Criteria
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-[1.1]">
              GVC 인덱스는 무엇을
              <br />
              <span className="text-gradient">평가</span>하나요?
            </h2>
            <p className="mt-5 text-base md:text-lg text-gray-500 leading-relaxed">
              해외 방문자의 이용 경험을 기준으로 의료·건강 서비스의
              <br className="hidden md:block" />
              정보 투명성과 이용 조건을 종합적으로 평가합니다.
            </p>
          </div>

          {/* Evaluation Items */}
          <div
            ref={s4.ref}
            className={`mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 transition-all duration-700 delay-200 ${
              s4.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            {gvc_items.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="group relative flex flex-col items-center gap-3 rounded-2xl bg-white p-5 md:p-6 shadow-sm shadow-gray-200/50 border border-gray-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/[0.08] hover:border-primary/20"
                  style={{
                    transitionDelay: s4.isVisible ? `${i * 80}ms` : "0ms",
                  }}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/[0.08] text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 text-center">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="mt-6 text-center text-xs md:text-sm text-gray-400">
            ※ GVC 인덱스는 의료 행위, 치료 결과 또는 의료진의 전문성을 평가하지
            않습니다.
          </p>
        </div>
      </section>

      {/* ────────────────────────────────────
          Section 3 — 한국 방문
      ──────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-blue-50/80 via-white to-violet-50/40 py-24 md:py-32 lg:py-40 overflow-hidden">
        <div className="absolute inset-0 dot-pattern" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-[140px]" />

        <div className="relative mx-auto max-w-screen-lg px-6 sm:px-8">
          <div
            ref={s5.ref}
            className={`transition-all duration-700 ${
              s5.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            {/* Top area */}
            <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
              <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-primary mb-4">
                Visit Korea
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-[1.1]">
                <span className="text-gradient">한국 방문</span> 예정이신가요?
              </h2>
              <p className="mt-5 text-base md:text-lg text-gray-500 leading-relaxed">
                GVC 파트너스는 해외 방문자가 한국의 의료·건강·여행 서비스를
                이해하고 비교할 수 있도록 상품 중심 정보를 제공합니다.
              </p>
            </div>

            {/* Intume card */}
            <div className="relative rounded-3xl bg-white border border-gray-100 shadow-sm shadow-gray-200/50 p-6 md:p-10 lg:p-12">
              <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
                {/* Left content */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
                    한국의 현지인들과 함께하는
                    <br />
                    안심여행과 함께
                  </h3>
                  <p className="text-sm md:text-base text-gray-500 leading-relaxed">
                    인투미 트립과 함께 서울부터 로컬여행까지
                    <br />
                    원하는 여행을 선택하세요.
                  </p>
                </div>

                {/* Right: Brand logo */}
                <div className="w-full md:w-[280px] h-[160px] md:h-[200px] rounded-2xl bg-[#f8f9fc] border border-gray-100 flex items-center justify-center">
                  <Image
                    src={intume}
                    alt="Intume Logo"
                    width={180}
                    height={70}
                    className="object-contain w-[140px] md:w-[180px]"
                  />
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-10 md:mt-14 flex justify-center">
              <Link
                href="/inquiry"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-blue-500 px-8 py-4 text-[15px] font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                문의하기
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
