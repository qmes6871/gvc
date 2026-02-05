import { MainLayout } from "@/components/layout/main-layout";
import { InquiryForm } from "@/components/inquiry/inquiry-form";
import { MessageSquare } from "lucide-react";

export default async function InquiryPage() {
  return (
    <MainLayout>
      {/* Hero banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/50 to-violet-50/30 pt-12 pb-16 md:pt-16 md:pb-20">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-violet-400/[0.04] rounded-full blur-[100px]" />
        <div className="absolute inset-0 dot-pattern" />

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/[0.08] mb-6">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-[1.1]">
            <span className="text-gradient">문의</span>하기
          </h1>
          <p className="mt-4 text-base md:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            한국 방문 전, 시술 및 검진 관련 정보를 입력해 주세요.
            <br className="hidden sm:block" />
            빠른 시일 내에 안내드리겠습니다.
          </p>
        </div>
      </section>

      {/* Form area */}
      <section className="relative bg-[#f8f9fc] py-10 md:py-16">
        <div className="absolute inset-0 dot-pattern" />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
          <InquiryForm />
        </div>
      </section>
    </MainLayout>
  );
}
