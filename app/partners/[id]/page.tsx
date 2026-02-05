import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MainLayout } from "@/components/layout/main-layout";
import { CompanyService } from "@/domain/company/company.service";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  MessageCircle,
  Loader2,
  Building2,
  Tag,
  FileText,
  Banknote,
} from "lucide-react";

const GRADIENT_THEMES = [
  { bg: "from-blue-500 to-indigo-600", icon: "text-blue-200", pattern: "bg-blue-400/20" },
  { bg: "from-emerald-500 to-teal-600", icon: "text-emerald-200", pattern: "bg-emerald-400/20" },
  { bg: "from-violet-500 to-purple-600", icon: "text-violet-200", pattern: "bg-violet-400/20" },
  { bg: "from-rose-500 to-pink-600", icon: "text-rose-200", pattern: "bg-rose-400/20" },
  { bg: "from-amber-500 to-orange-600", icon: "text-amber-200", pattern: "bg-amber-400/20" },
  { bg: "from-cyan-500 to-sky-600", icon: "text-cyan-200", pattern: "bg-cyan-400/20" },
];

interface PartnerDetailPageProps {
  params: Promise<{ id: string }>;
}

async function PartnerDetailContent({ id }: { id: number }) {
  const company = await CompanyService.getCompanyById(id);

  if (!company) {
    notFound();
  }

  const theme = GRADIENT_THEMES[id % GRADIENT_THEMES.length];
  const hasImages = company.detailImageUrls && company.detailImageUrls.length > 0;
  const hasThumbnail = !!company.thumbnailImageUrl;

  return (
    <div className="space-y-0">
      {/* 히어로 섹션 */}
      <div className="relative overflow-hidden rounded-2xl">
        {hasThumbnail ? (
          <div className="relative w-full aspect-[21/9]">
            <Image
              src={company.thumbnailImageUrl!}
              alt={company.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
                {company.name}
              </h1>
              {company.tags && company.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {company.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white backdrop-blur-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={`relative w-full bg-gradient-to-br ${theme.bg} py-16 md:py-24 px-6 md:px-10`}>
            {/* 배경 장식 */}
            <div className={`absolute top-6 right-10 w-32 h-32 rounded-full ${theme.pattern}`} />
            <div className={`absolute bottom-8 left-8 w-20 h-20 rounded-full ${theme.pattern}`} />
            <div className={`absolute top-1/3 right-1/3 w-16 h-16 rounded-full ${theme.pattern}`} />
            <div className={`absolute bottom-1/4 right-1/4 w-24 h-24 rounded-full ${theme.pattern}`} />
            <div className={`absolute top-10 left-1/3 w-10 h-10 rounded-full ${theme.pattern}`} />

            <div className="relative z-10 max-w-3xl">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center`}>
                  <Building2 className="w-7 h-7 text-white" strokeWidth={1.5} />
                </div>
                {company.price != null && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <span className="text-white font-bold text-sm">
                      {company.price.toLocaleString()}원~
                    </span>
                  </div>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
                {company.name}
              </h1>
              {company.tags && company.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-5">
                  {company.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 rounded-full text-sm font-medium bg-white/20 text-white backdrop-blur-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 본문 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* 왼쪽: 메인 콘텐츠 */}
        <div className="lg:col-span-2 space-y-8">
          {/* 소개 텍스트 */}
          {company.introText && (
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                  <FileText className="w-4.5 h-4.5 text-blue-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">소개</h2>
              </div>
              <p className="text-gray-600 leading-relaxed text-base">
                {company.introText}
              </p>
            </div>
          )}

          {/* 상세 텍스트 */}
          {company.detailText && (
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <FileText className="w-4.5 h-4.5 text-emerald-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">상세 정보</h2>
              </div>
              <div className="text-gray-600 leading-relaxed text-base whitespace-pre-line">
                {company.detailText}
              </div>
            </div>
          )}

          {/* 상세 이미지들 */}
          {hasImages && (
            <div className="space-y-4">
              {company.detailImageUrls.map((imageUrl, index) => (
                <div
                  key={index}
                  className="relative w-full aspect-video overflow-hidden rounded-2xl shadow-sm"
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
        </div>

        {/* 오른쪽: 사이드바 */}
        <div className="space-y-6">
          {/* 가격 정보 카드 */}
          {company.price != null && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Banknote className="w-4.5 h-4.5 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">가격 정보</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {company.price.toLocaleString()}
                <span className="text-base font-normal text-gray-500 ml-1">원~</span>
              </p>
              <p className="text-sm text-gray-400 mt-1">시술 내용에 따라 변동될 수 있습니다.</p>
            </div>
          )}

          {/* 태그 카드 */}
          {company.tags && company.tags.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
                  <Tag className="w-4.5 h-4.5 text-violet-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">진료 분야</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {company.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 문의하기 CTA */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-center">
            <p className="text-white/80 text-sm mb-3">이 병원에 대해 궁금하신가요?</p>
            <Link href={`/inquiry?companyId=${id}`}>
              <Button
                size="lg"
                className="w-full bg-white text-blue-700 hover:bg-blue-50 font-bold text-base py-6 gap-2"
              >
                <MessageCircle className="h-5 w-5" />
                문의하기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PartnerDetailPage({ params }: PartnerDetailPageProps) {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-6xl">
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
