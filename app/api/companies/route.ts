// app/api/companies/route.ts
import { NextRequest, NextResponse } from "next/server";
import { CompanyService } from "@/domain/company/company.service";

/**
 * POST /api/companies
 * 새로운 파트너사 등록
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const company = await CompanyService.createCompany({
      name: body.name,
      imageUrl: body.imageUrl,
      password: body.password,
      primaryCategory: body.primaryCategory,
      secondaryCategory: body.secondaryCategory,
      detail: body.detail,
    });

    return NextResponse.json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.error("Company creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "파트너 등록에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}
