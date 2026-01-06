import { MainLayout } from "@/components/layout/main-layout";
import { InquiryForm } from "@/components/inquiry/inquiry-form";
import { MessageCircle } from "lucide-react";
import { CompanyService } from "@/domain/company/company.service";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

interface InquiryPageProps {
  searchParams: Promise<{ companyId?: string }>;
}

async function InquiryContent({ companyId }: { companyId: number }) {
  const result = await CompanyService.getCompanyById(companyId);

  if (!result || !result.company.isApproved()) {
    notFound();
  }

  const { company } = result;

  return (
    <>
      {/* 헤더 */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <MessageCircle className="h-8 w-8 text-black" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          {company.name}
        </h1>
        <p className="text-2xl font-semibold text-gray-700 mb-4">
          파트너사에 문의하기
        </p>
        <p className="text-lg text-gray-600 leading-relaxed">
          구매, 협업, 제휴, 단순 문의 등 무엇이든 보내주시면
          <br />
          <span className="font-semibold text-black">48시간 안에</span> 빠르게 확인하겠습니다.
        </p>
      </div>

      {/* 문의 폼 */}
      <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
        <InquiryForm companyId={companyId} companyName={company.name} />
      </div>

      {/* 안내 사항 */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">📌 안내사항</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 영업일 기준 48시간 이내에 답변드립니다.</li>
          <li>• 첨부 파일은 최대 5개, 각 파일당 10MB까지 업로드 가능합니다.</li>
          <li>• 입력하신 연락처로 답변을 보내드립니다.</li>
        </ul>
      </div>
    </>
  );
}

export default async function InquiryPage({ searchParams }: InquiryPageProps) {
  const params = await searchParams;
  const companyId = params.companyId ? parseInt(params.companyId, 10) : null;

  if (!companyId || isNaN(companyId)) {
    notFound();
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
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
            <InquiryContent companyId={companyId} />
          </Suspense>
        </div>
      </div>
    </MainLayout>
  );
}
