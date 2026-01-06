"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { PartnerForm } from "@/components/partners/partner-form";

interface CompanyFormData {
  name: string;
  thumbnailImageUrl: string | null;
  detailImageUrls: string[];
  tags: string[];
  introText: string;
  detailText: string;
  price: number | null;
  masterPassword: string;
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
        thumbnailImageUrl: data.thumbnailImageUrl,
        detailImageUrls: data.detailImageUrls,
        tags: data.tags,
        introText: data.introText,
        detailText: data.detailText,
        price: data.price,
        masterPassword: data.masterPassword,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "병원 등록에 실패했습니다.");
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* 페이지 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              병원 정보 등록
            </h1>
            <p className="text-gray-600">
              병원 정보를 입력하고 등록을 완료해주세요.
              <br />
              마스터 패스워드가 필요합니다.
            </p>
          </div>

          {/* 등록 폼 */}
          <PartnerForm mode="create" onSubmit={handleSubmit} />
        </div>
      </div>
    </MainLayout>
  );
}
