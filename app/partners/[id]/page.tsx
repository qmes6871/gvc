import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MainLayout } from "@/components/layout/main-layout";
import { CompanyService } from "@/domain/company/company.service";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle, Loader2 } from "lucide-react";

interface PartnerDetailPageProps {
  params: Promise<{ id: string }>;
}

async function PartnerDetailContent({ id }: { id: number }) {
  const company = await CompanyService.getCompanyById(id);

  if (!company) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* 제목 */}
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
          {company.name}
        </h1>
      </div>

      {/* 상세 이미지들 */}
      {company.detailImageUrls && company.detailImageUrls.length > 0 && (
        <div className="space-y-4">
          {company.detailImageUrls.map((imageUrl, index) => (
            <div
              key={index}
              className="relative w-full aspect-video overflow-hidden"
            >
              <Image
                src={imageUrl}
                alt={`${company.name || "병원"} 상세 이미지 ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* 문의하기 CTA 버튼 */}
      <div className="flex justify-center pt-8">
        <Link href={`/inquiry?companyId=${id}`}>
          <Button 
            size="lg" 
            className="bg-[#124DD8] hover:bg-[#0d3da8] text-white text-lg px-8 py-6 gap-3"
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
