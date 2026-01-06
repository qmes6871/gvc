import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ContentService } from "@/domain/content/content.service";
import { ContentEditFormClient } from "@/components/content/content-edit-form-client";
import { MainLayout } from "@/components/layout/main-layout";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ContentEditPage({ params }: Props) {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* 뒤로가기 버튼 */}
          <div className="mb-6">
            <Suspense>
              <BackButton params={params} />
            </Suspense>
          </div>

          {/* 수정 폼 */}
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
            <h1 className="text-2xl font-bold mb-6">콘텐츠 수정</h1>
            <Suspense
              fallback={
                <div className="animate-pulse space-y-4">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                  <div className="h-96 bg-gray-200 rounded"></div>
                </div>
              }
            >
              <ContentEditFormContent params={params} />
            </Suspense>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

async function BackButton({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <Link href={`/contents/${id}`}>
      <Button variant="ghost" className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        뒤로가기
      </Button>
    </Link>
  );
}

async function ContentEditFormContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const content = await ContentService.getContentById(Number(id));

  if (!content) {
    notFound();
  }

  return (
    <ContentEditFormClient
      contentId={content.id}
      initialData={{
        title: content.title,
        thumbnailUrl: content.thumbnailUrl || "",
        content: content.content,
        imageUrls: content.imageUrls || [],
        isPinned: content.isPinned ?? false,
      }}
    />
  );
}
