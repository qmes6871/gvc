import { NextRequest, NextResponse } from "next/server";
import { CompanyService } from "@/domain/company/company.service";

export async function PATCH(
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
    const { approvalStatus, masterPassword } = body;

    if (!approvalStatus || !masterPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "승인 상태와 마스터 패스워드를 입력해주세요.",
        },
        { status: 400 }
      );
    }

    if (!["approved", "rejected", "pending"].includes(approvalStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: "유효하지 않은 승인 상태입니다.",
        },
        { status: 400 }
      );
    }

    // 승인 상태 변경 (마스터 패스워드 검증 포함)
    await CompanyService.updateApprovalStatus(
      companyId,
      approvalStatus as "approved" | "rejected" | "pending",
      masterPassword
    );

    return NextResponse.json({
      success: true,
      message: "승인 상태가 변경되었습니다.",
    });
  } catch (error) {
    console.error("승인 상태 변경 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "승인 상태 변경에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}
