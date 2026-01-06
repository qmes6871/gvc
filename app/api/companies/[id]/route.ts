// app/api/companies/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { CompanyService } from "@/domain/company";
import { UpdateCompanyPayload } from "@/domain/company/company.model";

/**
 * GET /api/companies/[id]
 * 병원 상세 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "유효하지 않은 ID입니다." },
        { status: 400 }
      );
    }

    const company = await CompanyService.getCompanyById(id);

    if (!company) {
      return NextResponse.json(
        { success: false, error: "병원을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.error("병원 조회 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "병원 조회에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/companies/[id]
 * 병원 정보 수정
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "유효하지 않은 ID입니다." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { masterPassword, ...companyData } = body;

    if (!masterPassword) {
      return NextResponse.json(
        { success: false, error: "마스터 패스워드가 필요합니다." },
        { status: 400 }
      );
    }

    const payload: UpdateCompanyPayload = {};
    
    if (companyData.name !== undefined) payload.name = companyData.name;
    if (companyData.thumbnailImageUrl !== undefined) payload.thumbnailImageUrl = companyData.thumbnailImageUrl;
    if (companyData.detailImageUrls !== undefined) payload.detailImageUrls = companyData.detailImageUrls;
    if (companyData.tags !== undefined) payload.tags = companyData.tags;
    if (companyData.introText !== undefined) payload.introText = companyData.introText;
    if (companyData.detailText !== undefined) payload.detailText = companyData.detailText;
    if (companyData.price !== undefined) payload.price = companyData.price;

    const updatedCompany = await CompanyService.updateCompany(id, payload, masterPassword);

    return NextResponse.json({
      success: true,
      data: updatedCompany,
    });
  } catch (error) {
    console.error("병원 수정 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "병원 수정에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/companies/[id]
 * 병원 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "유효하지 않은 ID입니다." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { masterPassword } = body;

    if (!masterPassword) {
      return NextResponse.json(
        { success: false, error: "마스터 패스워드가 필요합니다." },
        { status: 400 }
      );
    }

    await CompanyService.deleteCompany(id, masterPassword);

    return NextResponse.json({
      success: true,
      message: "병원이 삭제되었습니다.",
    });
  } catch (error) {
    console.error("병원 삭제 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "병원 삭제에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}
