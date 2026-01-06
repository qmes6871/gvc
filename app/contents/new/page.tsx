"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { ContentForm } from "@/components/content/content-form";
import { Loader2 } from "lucide-react";
import Link from "next/link";

interface ContentFormData {
  title: string;
  thumbnailUrl: string | null;
  content: string;
  imageUrls: string[];
  isPinned: boolean;
  password: string;
}

export default function NewContentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 세션 스토리지에서 마스터 비밀번호 인증 확인
    const verified = sessionStorage.getItem("content_master_verified");
    if (!verified) {
      setError("권한이 없습니다. 목록 페이지에서 글쓰기 버튼을 클릭해주세요.");
      setLoading(false);
      return;
    }
    setLoading(false);
  }, []);

  const handleSubmit = async (data: ContentFormData) => {
    const response = await fetch("/api/contents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "콘텐츠 등록에 실패했습니다.");
    }

    // 등록 완료 후 세션 스토리지에서 인증 제거
    sessionStorage.removeItem("content_master_verified");

    return result.data.id; // 생성된 콘텐츠 ID 반환
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-black mx-auto mb-4" />
            <p className="text-gray-600">권한을 확인하는 중...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <Link href="/contents" className="text-black hover:underline">
              콘텐츠 목록으로 돌아가기
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
              콘텐츠 작성
            </h1>
            <p className="text-gray-600">
              새로운 콘텐츠를 작성합니다.
              <br />
              작성 시 입력한 비밀번호는 향후 수정 시 필요합니다.
            </p>
          </div>

          {/* 작성 폼 */}
          <ContentForm mode="create" onSubmit={handleSubmit} />
        </div>
      </div>
    </MainLayout>
  );
}
