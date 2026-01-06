import { Suspense } from "react";
import { ContentService } from "@/domain/content/content.service";
import { MainLayout } from "@/components/layout/main-layout";
import { ContentListHeader } from "@/components/content/content-list-header";
import React from "react";
import { ContentListItem } from "@/components/content/content-list-item";

export const metadata = {
  title: "콘텐츠 | 푸드링크",
  description: "푸드링크의 공식 콘텐츠를 확인해보세요.",
};

export default function ContentsPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        <Suspense
          fallback={
            <div className="container mx-auto px-4 py-12 max-w-5xl">
              {/* 페이지 헤더 */}
              <div className="mb-8 flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold">콘텐츠</h1>
                  <p className="text-gray-600 mt-2">
                    푸드링크의 최신 소식과 정보를 확인하세요.
                  </p>
                </div>
                <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
              </div>

              {/* 로딩 스켈레톤 */}
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse border rounded-lg p-6 flex gap-6 bg-white"
                  >
                    <div className="flex-1 space-y-4">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                    <div className="w-40 h-32 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          }
        >
          <ContentsContent />
        </Suspense>
      </div>
    </MainLayout>
  );
}

async function ContentsContent() {
  const contents = await ContentService.getContents();

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* 페이지 헤더 */}
      <ContentListHeader />

      {/* 콘텐츠 목록 */}
      <Suspense
        fallback={
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse border rounded-lg p-6 flex gap-6 bg-white"
              >
                <div className="flex-1 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
                <div className="w-40 h-32 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        }
      >
        {contents.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {contents.map((content) => (
              <ContentListItem 
                key={content.id}
                id={content.id}
                title={content.title}
                content={content.content}
                thumbnailUrl={content.thumbnailUrl}
                viewCount={content.viewCount}
                createdAt={content.createdAt}
                isPinned={content.isPinned}
                isNew={content.isNew()}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">등록된 콘텐츠가 없습니다.</p>
          </div>
        )}
      </Suspense>
    </div>
  );
}
