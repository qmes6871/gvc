import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Inquiry, INQUIRY_CATEGORIES } from "@/domain/inquiry/inquiry.model";
import { sendInquiryEmail } from "@/lib/mailersend";
import { CompanyService } from "@/domain/company/company.service";

/**
 * POST /api/inquiry
 * 문의 등록 (비밀번호 없이 간단하게)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, category, content, phone, email, attachmentUrls } = body;

    // 유효성 검증
    if (!companyId || typeof companyId !== "number") {
      return NextResponse.json(
        {
          success: false,
          error: "파트너사 ID가 필요합니다.",
        },
        { status: 400 }
      );
    }

    if (!category || !INQUIRY_CATEGORIES[category.toUpperCase() as keyof typeof INQUIRY_CATEGORIES]) {
      return NextResponse.json(
        {
          success: false,
          error: "유효한 카테고리를 선택해주세요.",
        },
        { status: 400 }
      );
    }

    if (!content || content.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: "문의 내용은 10자 이상 입력해주세요.",
        },
        { status: 400 }
      );
    }

    if (!phone || !email) {
      return NextResponse.json(
        {
          success: false,
          error: "연락처 정보를 입력해주세요.",
        },
        { status: 400 }
      );
    }

    // Service role client 생성 (RLS 우회)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data: inquiryData, error } = await supabase
      .from(Inquiry.tableName)
      .insert({
        company_id: companyId,
        category,
        content: content.trim(),
        attachments: attachmentUrls || [],
        name: "익명", // 이름 없이 간단하게
        phone: phone.trim(),
        email: email.trim(),
        password_hash: "", // 비밀번호 없음
        is_answered: false,
      })
      .select()
      .single();

    if (error) {
      console.error("문의 등록 오류:", error);
      return NextResponse.json(
        {
          success: false,
          error: "문의 등록에 실패했습니다.",
        },
        { status: 500 }
      );
    }

    // 파트너사 정보 조회
    const companyResult = await CompanyService.getCompanyById(companyId);
    const companyName = companyResult?.company?.name || "알 수 없는 파트너사";

    // 관리자에게 이메일 발송 (비동기 처리, 실패해도 문의 등록은 성공으로 처리)
    try {
      await sendInquiryEmail({
        companyName,
        category,
        name: "익명",
        email: email.trim(),
        phone: phone.trim(),
        content: content.trim(),
      });
    } catch (emailError) {
      // 이메일 발송 실패는 로그만 남기고 계속 진행
      console.error("이메일 발송 실패:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "문의가 성공적으로 접수되었습니다.",
      data: {
        id: inquiryData.id,
      },
    });
  } catch (error) {
    console.error("Inquiry creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "문의 등록에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}
