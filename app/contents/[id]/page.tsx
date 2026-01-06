import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ContentService } from "@/domain/content/content.service";
import { ContentDetailClient } from "@/components/content/content-detail-client";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const content = await ContentService.getContentById(Number(id));

  if (!content) {
    return {
      title: "콘텐츠를 찾을 수 없습니다 | 푸드링크",
    };
  }

  return {
    title: `${content.title} | 푸드링크`,
    description: content.content.replace(/<[^>]*>/g, "").slice(0, 160),
  };
}

export default async function ContentDetailPage({ params }: Props) {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* 뒤로가기 버튼 */}
          <div className="mb-6">
            <Link href="/contents">
              <Button variant="ghost" className="gap-2 text-gray-400 hover:text-gray-600 hover:bg-transparent">
                <ArrowLeft className="h-4 w-4" />
                목록으로 돌아가기
              </Button>
            </Link>
          </div>

          {/* 상세 내용 */}
          <Suspense
            fallback={
              <div className="animate-pulse space-y-8">
                <div className="h-10 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-96 bg-gray-200 rounded"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            }
          >
            <ContentDetailContent params={params} />
          </Suspense>
        </div>
      </div>
    </MainLayout>
  );
}

async function ContentDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const content = await ContentService.getContentById(Number(id));

  if (!content) {
    notFound();
  }

  return (
    <ContentDetailClient
      id={content.id}
      title={content.title}
      content={content.content}
      thumbnailUrl={content.thumbnailUrl}
      imageUrls={content.imageUrls}
      viewCount={content.viewCount}
      createdAt={content.createdAt}
      isPinned={content.isPinned}
      isNew={content.isNew()}
    />
  );
}
