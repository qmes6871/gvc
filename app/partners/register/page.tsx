"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { PartnerForm } from "@/components/partners/partner-form";

interface CompanyFormData {
  name: string;
  description: string;
  imageUrl: string | null;
  primaryCategory: any[];
  secondaryCategory: any[];
  phone: string;
  email: string;
  detailImages: string[];
  detailText: string;
  password: string;
}

export default function RegisterPartnerPage() {
  const handleSubmit = async (data: CompanyFormData) => {
    const response = await fetch("/api/companies", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.name,
        imageUrl: data.imageUrl,
        password: data.password,
        primaryCategory: data.primaryCategory,
        secondaryCategory: data.secondaryCategory,
        detail: {
          description: data.description,
          phone: data.phone,
          email: data.email,
          detailImages: data.detailImages,
          detailText: data.detailText,
        },
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "파트너 등록에 실패했습니다.");
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* 페이지 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              파트너 등록하기
            </h1>
            <p className="text-gray-600">
              파트너 정보를 입력하고 등록 신청을 완료해주세요.
              <br />
              관리자 승인 후 파트너 목록에 표시됩니다.
            </p>
          </div>

          {/* 등록 폼 */}
          <PartnerForm mode="create" onSubmit={handleSubmit} />
        </div>
      </div>
    </MainLayout>
  );
}
