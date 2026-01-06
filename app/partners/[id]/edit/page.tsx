"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { PartnerForm } from "@/components/partners/partner-form";
import { Loader2 } from "lucide-react";
import Link from "next/link";

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

export default function EditPartnerPage() {
  const params = useParams();
  const id = parseInt(params.id as string, 10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<Partial<CompanyFormData> | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/companies/${id}`);
        const result = await response.json();
        
        if (!result.success) {
          setError(result.error || "병원을 찾을 수 없습니다.");
          return;
        }

        const company = result.data;
        setInitialData({
          name: company.name,
          thumbnailImageUrl: company.thumbnailImageUrl || null,
          detailImageUrls: company.detailImageUrls || [],
          tags: company.tags || [],
          introText: company.introText || "",
          detailText: company.detailText || "",
          price: company.price || null,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (data: CompanyFormData) => {
    const response = await fetch(`/api/companies/${id}`, {
      method: "PUT",
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
      throw new Error(result.error || "병원 수정에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-black mx-auto mb-4" />
            <p className="text-gray-600">데이터를 불러오는 중...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !initialData) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 text-lg mb-4">{error || "데이터를 찾을 수 없습니다."}</p>
            <Link
              href="/partners"
              className="text-black hover:underline"
            >
              파트너 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* 페이지 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              병원 정보 수정
            </h1>
            <p className="text-gray-600">
              병원 정보를 수정하거나 삭제할 수 있습니다.
              <br />
              수정 또는 삭제를 위해서는 마스터 패스워드가 필요합니다.
            </p>
          </div>

          {/* 수정 폼 */}
          <PartnerForm
            mode="edit"
            initialData={initialData}
            companyId={id}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </MainLayout>
  );
}
