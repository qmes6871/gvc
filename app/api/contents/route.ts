import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Content, CreateContentSchema } from "@/domain/content/content.model";

/**
 * POST /api/contents
 * 콘텐츠 등록 (마스터 비밀번호 검증 후 Service Role로 등록)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 유효성 검증
    const validationResult = CreateContentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: validationResult.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const { title, thumbnailUrl, content, imageUrls, password, isPinned } = validationResult.data;

    // 마스터 비밀번호 검증
    const masterPassword = process.env.MASTER_PASSWORD;
    if (!masterPassword) {
      console.error("MASTER_PASSWORD is not set");
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

    // 콘텐츠 등록 (비밀번호 해시는 생략, 마스터 비밀번호만 사용)
    const { data, error } = await supabase
      .from(Content.tableName)
      .insert({
        title,
        thumbnail_url: thumbnailUrl,
        content,
        image_urls: imageUrls || [],
        password_hash: password, // 마스터 비밀번호 그대로 저장 (단순 비교용)
        view_count: 0,
        is_pinned: isPinned || false,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create content:", error);
      throw new Error("콘텐츠 등록에 실패했습니다.");
    }

    return NextResponse.json({
      success: true,
      data: new Content(data),
    });
  } catch (error) {
    console.error("Content creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "콘텐츠 등록 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
