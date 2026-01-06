import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/verify-master-password
 * 마스터 비밀번호 검증
 */
export async function POST(request: NextRequest) {
  try {
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

    const masterPassword = process.env.MASTER_PASSWORD;

    if (!masterPassword) {
      console.error("MASTER_PASSWORD is not set in environment variables");
      return NextResponse.json(
        {
          success: false,
          error: "서버 설정 오류입니다.",
        },
        { status: 500 }
      );
    }

    if (password !== masterPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "비밀번호가 일치하지 않습니다.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Master password verification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "비밀번호 검증 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
