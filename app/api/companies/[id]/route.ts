// app/api/companies/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { CompanyService } from "@/domain/company/company.service";

/**
 * GET /api/companies/[id]
 * 파트너사 상세 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const companyId = parseInt(id, 10);
    
    const result = await CompanyService.getCompanyById(companyId);

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: "파트너를 찾을 수 없습니다.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Company fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "데이터를 불러오는데 실패했습니다.",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/companies/[id]
 * 파트너사 정보 수정
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const companyId = parseInt(id, 10);
    const body = await request.json();

    // 기본 정보 업데이트
    await CompanyService.updateCompany(
      companyId,
      {
        name: body.name,
        imageUrl: body.imageUrl,
        primaryCategory: body.primaryCategory,
        secondaryCategory: body.secondaryCategory,
      },
      body.password
    );

    // 상세 정보 업데이트
    if (body.detail) {
      await CompanyService.updateCompanyDetail(
        companyId,
        body.detail,
        body.password
      );
    }

    return NextResponse.json({
      success: true,
      message: "파트너 정보가 수정되었습니다.",
    });
  } catch (error) {
    console.error("Company update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "파트너 수정에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/companies/[id]
 * 파트너사 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const companyId = parseInt(id, 10);
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          error: "비밀번호가 필요합니다.",
        },
        { status: 400 }
      );
    }

    await CompanyService.deleteCompany(companyId, password);

    return NextResponse.json({
      success: true,
      message: "파트너가 삭제되었습니다.",
    });
  } catch (error) {
    console.error("Company delete error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "파트너 삭제에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}
