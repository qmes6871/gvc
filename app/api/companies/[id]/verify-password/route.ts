import { NextRequest, NextResponse } from "next/server";
import { CompanyService } from "@/domain/company/company.service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const companyId = parseInt(id);

    if (isNaN(companyId)) {
      return NextResponse.json(
        { success: false, error: "유효하지 않은 회사 ID입니다." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          error: "비밀번호를 입력해주세요.",
        },
        { status: 400 }
      );
    }

    // 비밀번호 검증
    const isValid = await CompanyService.verifyCompanyPassword(
      companyId,
      password
    );

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "비밀번호가 올바르지 않습니다.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "비밀번호가 확인되었습니다.",
    });
  } catch (error) {
    console.error("비밀번호 검증 오류:", error);
    
    // 에러 메시지 간소화
    let errorMessage = "비밀번호 검증에 실패했습니다.";
    
    if (error instanceof Error) {
      // 일반적인 에러 메시지만 추출
      if (error.message.includes("찾을 수 없습니다")) {
        errorMessage = "파트너사를 찾을 수 없습니다.";
      } else if (error.message.includes("올바르지 않습니다")) {
        errorMessage = "비밀번호가 올바르지 않습니다.";
      }
    }
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
