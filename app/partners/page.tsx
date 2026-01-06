import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PartnersGrid } from "@/components/partners/partners-grid";
import { CompanyService } from "@/domain/company/company.service";
import { HomeBannerService } from "@/domain/banner/banner.service";
import { HomeBannerCarousel } from "@/components/banner";
import { PlusCircle } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";

interface SearchParams {
  category?: string;
  tags?: string;
  search?: string;
  page?: string;
}

interface PartnersPageProps {
  searchParams: Promise<SearchParams>;
}

export default function PartnersPage({ searchParams }: PartnersPageProps) {

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        <Suspense
          fallback={
            <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
              {/* 페이지 헤더 */}
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  병원 찾기
                </h1>
                <p className="text-gray-600">
                  다양한 진료 분야의 전문 병원을 찾아보세요
                </p>
              </div>

              {/* 로딩 스켈레톤 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-md h-80 animate-pulse"
                  >
                    <div className="w-full h-48 bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-6 bg-gray-200 rounded" />
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          }
        >
          <PartnersContent searchParams={searchParams} />
        </Suspense>
      </div>
    </MainLayout>
  );
}

async function PartnersContent({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  
  const category = params.category;
  const tagsParam = params.tags;
  const tags = tagsParam ? tagsParam.split(",") : undefined;
  const searchQuery = params.search;
  const page = parseInt(params.page || "1", 10);

  // 병원 목록과 배너 동시 조회
  const [result, banners] = await Promise.all([
    CompanyService.getCompanies({
      page,
      limit: 999,
      tags,
      searchQuery,
    }),
    HomeBannerService.getActiveBanners(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
          병원 찾기
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          다양한 진료 분야의 전문 병원을 찾아보세요
        </p>
      </div>

      {/* 배너 캐러셀 */}
      <HomeBannerCarousel banners={banners} />

      {/* 검색 결과 정보 */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          총 <span className="font-semibold">{result.total}</span>개의 병원
        </p>
        {(category || tags) && (
          <div className="flex flex-wrap gap-2">
            {category && (
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                {category}
              </span>
            )}
            {tags?.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 병원 그리드 */}
      <Suspense fallback={<div className="h-10 bg-gray-200 rounded animate-pulse" />}>
        {result.companies.length > 0 ? (
          <PartnersGrid companies={result.companies} />
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">검색 결과가 없습니다.</p>
            <p className="text-gray-400 text-sm mt-2">
              다른 검색 조건을 시도해보세요.
            </p>
          </div>
        )}
      </Suspense>
    </div>
  );
}
