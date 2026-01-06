import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MainLayout } from "@/components/layout/main-layout";
import { CompanyService } from "@/domain/company/company.service";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, MessageCircle } from "lucide-react";
import { Loader2 } from "lucide-react";
import { PartnerDetailActions } from "@/components/partners/partner-detail-actions";

interface PartnerDetailPageProps {
  params: Promise<{ id: string }>;
}

async function PartnerDetailContent({ id }: { id: number }) {
  const result = await CompanyService.getCompanyById(id);

  if (!result) {
    notFound();
  }

  const { company, detail } = result;

  // 승인되지 않은 회사는 접근 불가
  if (!company.isApproved()) {
    notFound();
  }

  // 첫 번째 상세 이미지
  const firstDetailImage = detail?.detailImages?.[0];

  return (
    <div className="space-y-12">
      {/* 제목과 버튼 */}
      <div className="relative">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-4">
          {company.name}
        </h1>
        
        {/* 수정/삭제 버튼 - 오른쪽 정렬 */}
        <div className="flex justify-end mt-2">
          <PartnerDetailActions companyId={id} companyName={company.name} />
        </div>
      </div>

      {/* 상세 이미지 1장 */}
      {firstDetailImage && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden border shadow-lg">
          <Image
            src={firstDetailImage}
            alt={`${company.name} 상세 이미지`}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* 상세 텍스트 */}
      {detail?.detailText && (
        <div className="prose max-w-none">
          <p className="text-gray-700 text-base md:text-lg whitespace-pre-wrap leading-relaxed">
            {detail.detailText}
          </p>
        </div>
      )}

      {/* 문의하기 CTA 버튼 */}
      <div className="flex justify-center pt-8">
        <Link href={`/inquiry?companyId=${id}`}>
          <Button 
            size="lg" 
            className="bg-black hover:bg-gray-800 text-white text-lg px-8 py-6 gap-3"
          >
            <MessageCircle className="h-5 w-5" />
            문의하기
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function PartnerDetailPage({ params }: PartnerDetailPageProps) {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* 뒤로가기 버튼 */}
          <div className="mb-6">
            <Link href="/partners">
              <Button variant="ghost" className="gap-2 text-gray-400 hover:text-gray-600 hover:bg-transparent">
                <ArrowLeft className="h-4 w-4" />
                목록으로 돌아가기
              </Button>
            </Link>
          </div>

          {/* 상세 내용 */}
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-black mx-auto mb-4" />
                  <p className="text-gray-600">파트너 정보를 불러오는 중...</p>
                </div>
              </div>
            }
          >
            <PartnerDetailWrapper params={params} />
          </Suspense>
        </div>
      </div>
    </MainLayout>
  );
}

async function PartnerDetailWrapper({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const companyId = parseInt(id, 10);

  if (isNaN(companyId)) {
    notFound();
  }

  return <PartnerDetailContent id={companyId} />;
}
