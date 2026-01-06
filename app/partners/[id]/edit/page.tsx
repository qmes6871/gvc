"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { PartnerForm } from "@/components/partners/partner-form";
import { Loader2 } from "lucide-react";
import type { PrimaryCategory, SecondaryCategory } from "@/domain/company/company.model";
import Link from "next/link";

interface CompanyFormData {
  name: string;
  description: string;
  imageUrl: string | null;
  primaryCategory: PrimaryCategory[];
  secondaryCategory: SecondaryCategory[];
  phone: string;
  email: string;
  detailImages: string[];
  detailText: string;
  password: string;
}

export default function EditPartnerPage() {
  const params = useParams();
  const id = parseInt(params.id as string, 10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<Partial<CompanyFormData> | null>(null);
  const [password, setPassword] = useState<string>("");

  useEffect(() => {
    // 세션 스토리지에서 비밀번호 가져오기
    const storedPassword = sessionStorage.getItem(`partner_pwd_${id}`);
    if (!storedPassword) {
      setError("권한이 없습니다. 상세 페이지에서 비밀번호를 확인해주세요.");
      setLoading(false);
      return;
    }
    setPassword(storedPassword);

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/companies/${id}`);
        const result = await response.json();
        
        if (!result.success) {
          setError(result.error || "파트너를 찾을 수 없습니다.");
          return;
        }

        const data = result.data;
        setInitialData({
          name: data.company.name,
          description: data.detail?.detailText?.substring(0, 100) || "",
          imageUrl: data.company.imageUrl || null,
          primaryCategory: data.company.primaryCategory,
          secondaryCategory: data.company.secondaryCategory,
          phone: data.detail?.phone || "",
          email: data.detail?.email || "",
          detailImages: data.detail?.detailImages || [],
          detailText: data.detail?.detailText || "",
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
        imageUrl: data.imageUrl,
        primaryCategory: data.primaryCategory,
        secondaryCategory: data.secondaryCategory,
        password: password, // 세션에서 가져온 비밀번호 사용
        detail: {
          phone: data.phone,
          email: data.email,
          detailImages: data.detailImages,
          detailText: data.detailText,
        },
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "파트너 수정에 실패했습니다.");
    }

    // 수정 완료 후 세션 스토리지에서 비밀번호 제거
    sessionStorage.removeItem(`partner_pwd_${id}`);
  };

  const handleDelete = async () => {
    const response = await fetch(`/api/companies/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "파트너 삭제에 실패했습니다.");
    }

    // 삭제 완료 후 세션 스토리지에서 비밀번호 제거
    sessionStorage.removeItem(`partner_pwd_${id}`);
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
              파트너 정보 수정
            </h1>
            <p className="text-gray-600">
              파트너 정보를 수정하거나 삭제할 수 있습니다.
              <br />
              수정 또는 삭제를 위해서는 등록 시 입력한 비밀번호가 필요합니다.
            </p>
          </div>

          {/* 수정 폼 */}
          <PartnerForm
            mode="edit"
            initialData={initialData}
            companyId={id}
            onSubmit={handleSubmit}
            onDelete={async () => {
              const confirmed = confirm("정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.");
              if (confirmed) {
                await handleDelete();
              } else {
                throw new Error("삭제가 취소되었습니다.");
              }
            }}
          />
        </div>
      </div>
    </MainLayout>
  );
}
