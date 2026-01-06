import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// DELETE: 콘텐츠 삭제
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const contentId = Number(id);

    if (isNaN(contentId)) {
      return NextResponse.json({ error: "유효하지 않은 콘텐츠 ID입니다." }, { status: 400 });
    }

    // 요청 바디에서 마스터 패스워드 확인
    const body = await request.json();
    const { masterPassword } = body;

    if (!masterPassword) {
      return NextResponse.json({ error: "마스터 패스워드가 필요합니다." }, { status: 400 });
    }

    // 마스터 패스워드 검증
    if (masterPassword !== process.env.MASTER_PASSWORD) {
      return NextResponse.json({ error: "마스터 패스워드가 올바르지 않습니다." }, { status: 401 });
    }

    // Service Role 클라이언트 생성 (RLS 우회)
    const supabase = await createClient();

    // 콘텐츠 삭제
    const { error } = await supabase.from("t_contents").delete().eq("id", contentId);

    if (error) {
      console.error("콘텐츠 삭제 오류:", error);
      return NextResponse.json({ error: "콘텐츠 삭제에 실패했습니다." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("콘텐츠 삭제 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// PUT: 콘텐츠 수정
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const contentId = Number(id);

    if (isNaN(contentId)) {
      return NextResponse.json({ error: "유효하지 않은 콘텐츠 ID입니다." }, { status: 400 });
    }

    const body = await request.json();
    const { title, thumbnailUrl, content, imageUrls, isPinned, masterPassword } = body;

    // 필수 필드 검증
    if (!title || !content || !masterPassword) {
      return NextResponse.json(
        { error: "제목, 내용, 마스터 패스워드는 필수입니다." },
        { status: 400 }
      );
    }

    // 마스터 패스워드 검증
    if (masterPassword !== process.env.MASTER_PASSWORD) {
      return NextResponse.json({ error: "마스터 패스워드가 올바르지 않습니다." }, { status: 401 });
    }

    // Service Role 클라이언트 생성 (RLS 우회)
    const supabase = await createClient();

    // 콘텐츠 수정
    const { data, error } = await supabase
      .from("t_contents")
      .update({
        title,
        thumbnail_url: thumbnailUrl || null,
        content,
        image_urls: imageUrls || [],
        is_pinned: isPinned || false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", contentId)
      .select()
      .single();

    if (error) {
      console.error("콘텐츠 수정 오류:", error);
      return NextResponse.json({ error: "콘텐츠 수정에 실패했습니다." }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("콘텐츠 수정 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
