// app/api/companies/route.ts

import { NextRequest, NextResponse } from "next/server";
import { CompanyService } from "@/domain/company";
import { CreateCompanyPayload } from "@/domain/company/company.model";

/**
 * POST /api/companies
 * 새로운 병원 등록
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { masterPassword, ...companyData } = body;

    if (!masterPassword) {
      return NextResponse.json(
        { success: false, error: "마스터 패스워드가 필요합니다." },
        { status: 400 }
      );
    }

    const payload: CreateCompanyPayload = {
      name: companyData.name,
      thumbnailImageUrl: companyData.thumbnailImageUrl,
      detailImageUrls: companyData.detailImageUrls || [],
      tags: companyData.tags || [],
      introText: companyData.introText,
      detailText: companyData.detailText,
      price: companyData.price,
    };

    const newCompany = await CompanyService.createCompany(payload, masterPassword);

    return NextResponse.json({
      success: true,
      data: newCompany,
    });
  } catch (error) {
    console.error("병원 등록 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "병원 등록에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/companies
 * 병원 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tagsParam = searchParams.get("tags");
    const tags = tagsParam ? tagsParam.split(",") : undefined;
    const searchQuery = searchParams.get("search") || undefined;

    const companies = await CompanyService.getCompanies({
      tags,
      searchQuery,
    });

    return NextResponse.json({
      success: true,
      data: companies,
    });
  } catch (error) {
    console.error("병원 목록 조회 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "병원 목록 조회에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}
