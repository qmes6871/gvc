import { NextRequest, NextResponse } from "next/server";
import { InquiryService, CreateInquiryPayload } from "@/domain/inquiry";

/**
 * POST /api/inquiry - 문의 등록 (익명)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // IP 주소 및 User Agent 추출
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined;
    const userAgent = req.headers.get("user-agent") || undefined;

    const payload: CreateInquiryPayload = {
      category: body.category,
      visitTiming: body.visitTiming,
      phone: body.phone,
      email: body.email,
      nationality: body.nationality,
      city: body.city,
      content: body.content || "",
      attachments: body.attachments || [],
    };

    const inquiry = await InquiryService.createInquiry(payload, ipAddress, userAgent);

    return NextResponse.json({
      success: true,
      data: inquiry,
    });
  } catch (error: any) {
    console.error("문의 등록 실패:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "문의 등록에 실패했습니다.",
      },
      { status: error.statusCode || 500 }
    );
  }
}
