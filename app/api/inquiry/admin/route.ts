// app/api/inquiry/admin/route.ts

import { NextRequest, NextResponse } from "next/server";
import { InquiryService } from "@/domain/inquiry";
import type { GetInquiriesOptions } from "@/domain/inquiry/inquiry.service";

/**
 * POST /api/inquiry/admin
 * 관리자용 문의 목록 조회 (마스터 패스워드 필요)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { masterPassword, page, limit, category, isAnswered } = body;

    if (!masterPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "마스터 패스워드가 필요합니다.",
        },
        { status: 400 }
      );
    }

    const options: GetInquiriesOptions = {
      page: page || 1,
      limit: limit || 10,
      category: category || "all",
      isAnswered,
    };

    const result = await InquiryService.getInquiriesForAdmin(
      masterPassword,
      options
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("문의 목록 조회 오류:", error);

    // 인증 실패
    if (error.code === "INVALID_PASSWORD") {
      return NextResponse.json(
        {
          success: false,
          error: "마스터 패스워드가 올바르지 않습니다.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "문의 목록 조회에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}
